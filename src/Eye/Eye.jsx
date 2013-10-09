/***
 * Eye, Tombo Rendering Engine.
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */

import "js/web.jsx";

import "Stream.jsx";
import "Eye/Layer.jsx";
import "Eye/LayoutInformation.jsx";
import "Eye/DisplayNode.jsx";
import "Eye/RenderingContext.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

/**
 * Eye class
 *
 * <p>Eye's main class. At first, you should create the instance of this class.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class Eye {
	var _renderingContext: RenderingContext;
	var _width: number;
	var _height: number;
	
	var _layerList: Array.<Layer>;
	static var DEBUG = false;
	static var _shapeCounter = 0;

	/**
	 * create instance with prepared canvas
	 */
	function constructor(canvas: HTMLCanvasElement) {
		this(new CanvasRenderingContext(canvas));
	}
	/**
	 * create instance with new canvas (width, height)
	 */
	function constructor(width: number, height: number) {
		this(Eye.useStreaming() ?
			new StreamRenderingContext(width, height) :
			new CanvasRenderingContext(width, height));
	}
	/**
	 * create instance with new canvas (640, 960)
	 */
	function constructor() {
		this(640, 960);
	}

	function constructor(rctx: RenderingContext) {
		this._renderingContext = rctx;
		this._width  = rctx.width;
		this._height = rctx.height;
		this._layerList = []: Layer[];
	}
	
	/**
	 * get a node from canvas position (x, y)
	 */
	function findTouchedNode(x: number, y: number): DisplayNode {
		for(var i = 0; i < this._layerList.length; i++) {
			var layer = this._layerList[i];
			// todo: check dirty flag
			
			// check layout and set proper transform
			var width = layer.layout.clientWidth;
			var height = layer.layout.clientHeight;
			if(!width || !height) {
				Tombo.warn("[Eye#findTouchedNode] layoutInformation.clientWidth/Height is not initialized");
			} else {
				// todo: cache the calculated values
				var transform = Eye._calculateLayoutTransform(this._width, this._height, layer);
				var node = layer._findTouchedNode(transform, x, y);
				if(node) {
					return node;
				}
			}
		}
		return null;
	}
	
	/**
	 * append a layer
	 */
	function appendLayer(layer: Layer): void {
		if(layer._isChild) {
			Tombo.warn("[Eye#appendLayer] now trying to append a layer which is already appended");
		}
		if(layer.layout.layoutMode & LayoutInformation.AUTO_SCALE) {
			// calculate scale
			var scale = Math.min(this._width / layer.width, this._height / layer.height);
			layer._setLayoutScale(scale);
		}
		this._layerList.push(layer);
		layer._isChild = true;
		
		// todo: set proper dirty flag
	}
	
	/**
	 * remove a child layer. return true if successfully removed
	 * @param layer layer which is removed
	 */
	function removeLayer(layer: Layer): boolean {
		if(!layer._isChild) {
			return false;
		}
		for(var i = 0; i < this._layerList.length; i++) {
			if(this._layerList[i] == layer) {
				this._layerList.splice(i, 1);
				layer._isChild = false;
				return true;
			}
		}
		return false;
	}
	
	static function _calculateLayoutTransform(width: number, height: number, layer: Layer): Transform {
		// todo: cache the result
		var cwidth = layer.layout.clientWidth;
		var cheight = layer.layout.clientHeight;
		var left = 0;
		var top = 0;
		if(layer.layout.layoutMode & LayoutInformation.CENTER) {
			left = (width - cwidth) / 2;
			top = (height - cheight) / 2;
		}
		if(layer.layout.layoutMode & LayoutInformation.LEFT) {
			left = layer.layout.left;
		}
		if(layer.layout.layoutMode & LayoutInformation.TOP) {
			top = layer.layout.top;
		}
		if(layer.layout.layoutMode & LayoutInformation.RIGHT) {
			left = width - cwidth - layer.layout.right;
		}
		if(layer.layout.layoutMode & LayoutInformation.BOTTOM) {
			top = height - cheight - layer.layout.bottom;
		}
		return new Transform(left, top, layer.layout.scale, layer.layout.scale);
	}
	
	/**
	 * render layers
	 */
	function render(stream: Stream = null): void {
		if (stream) {
			var streamRenderingContext = this._renderingContext as StreamRenderingContext;
			streamRenderingContext.setStream(stream);
		}

		// todo: render only if any layer is dirty
		// todo: check background-color
		this._renderingContext.clearRect(0, 0, this._width, this._height - 1);
		
		if(Eye.DEBUG) {
			this._renderingContext.fillStyle = "#505050";
			this._renderingContext.fillRect(0, 0, this._width, this._height);
		}
		
		this._layerList.forEach((layer) -> {
			// todo: check dirty flag
			this._renderingContext.draw(layer);
		});
		this._renderingContext.flush();
	}

	// assume server side Tombo does not have dom
	static function useStreaming(): boolean {
		return dom.document == null;
	}
}
