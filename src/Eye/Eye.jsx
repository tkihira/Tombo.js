/***
 * Eye, Tombo Rendering Engine.
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */

import "js/web.jsx";

import "Layer.jsx";
import "LayoutInformation.jsx";
import "DisplayNode.jsx";
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
	var _canvas: HTMLCanvasElement;
	var _width: number;
	var _height: number;
	var _ctx: CanvasRenderingContext2D;
	
	var _layerList: Array.<Layer>;
	static var _layerMask = 0xffff;
	static var _clearDebugCanvas = true;
	var _debugCanvas: HTMLCanvasElement;
	var _debugContext: CanvasRenderingContext2D;
	static var DEBUG = false;
	
	/**
	 * create instance with prepared canvas
	 */
	function constructor(canvas: HTMLCanvasElement) {
		this._initialize(canvas);
	}
	/**
	 * create instance with new canvas (width, height)
	 */
	function constructor(width: number, height: number) {
		this._initialize(width, height);
	}
	/**
	 * create instance with new canvas (640, 960)
	 */
	function constructor() {
		this._initialize(640, 960);
	}
	
	function _initialize(width: number, height: number): void {
		var canvas = dom.createElement("canvas") as HTMLCanvasElement;
		canvas.width = width;
		canvas.height = height;
		this._initialize(canvas);
	}
	function _initialize(canvas: HTMLCanvasElement): void {
		if(this._canvas) {
			Tombo.error("[Eye#initialize] Tombo Eye is already initialized");
		}
		this._setCanvas(canvas);
		this._layerList = []: Layer[];
	}
	
	function _setCanvas(canvas: HTMLCanvasElement): void {
		this._canvas = canvas;
		this._width = canvas.width;
		this._height = canvas.height;
		this._ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if(Tombo.DRAW_DIRTY_REGION) {
			this._debugCanvas = null;
			this._debugContext = null;
		}
		
		// todo: recalculate all layer's layout
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
				var transform = this._calculateLayoutTransform(layer);
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
				return true;
			}
		}
		return false;
	}
	
	function _calculateLayoutTransform(layer: Layer): Transform {
		// todo: cache the result
		var width = layer.layout.clientWidth;
		var height = layer.layout.clientHeight;
		var left = 0;
		var top = 0;
		if(layer.layout.layoutMode & LayoutInformation.CENTER) {
			left = (this._width - width) / 2;
			top = (this._height - height) / 2;
		}
		if(layer.layout.layoutMode & LayoutInformation.LEFT) {
			left = layer.layout.left;
		}
		if(layer.layout.layoutMode & LayoutInformation.TOP) {
			top = layer.layout.top;
		}
		if(layer.layout.layoutMode & LayoutInformation.RIGHT) {
			left = this._width - width - layer.layout.right;
		}
		if(layer.layout.layoutMode & LayoutInformation.BOTTOM) {
			top = this._height - height - layer.layout.bottom;
		}
		return new Transform(left, top, layer.layout.scale, layer.layout.scale);
	}
	
	/**
	 * render layers
	 */
	function render(): void {
		// todo: render only if any layer is dirty
		
		// todo: check background-color
		this._ctx.clearRect(0, 0, this._width, this._height - 1);
		
		// for debug
		if(Eye.DEBUG) {
			this._ctx.fillStyle = "#505050";
			this._ctx.fillRect(0, 0, this._width, this._height);
		}
		if(Tombo.DRAW_DIRTY_REGION) {
			if(!this._debugCanvas) {
				this._debugCanvas = dom.createElement("canvas") as HTMLCanvasElement;
				this._debugCanvas.width = this._width;
				this._debugCanvas.height = this._height;
				this._debugContext = this._debugCanvas.getContext("2d") as CanvasRenderingContext2D;
				this._debugContext.lineWidth = 1;
				dom.document.body.addEventListener('keyup', function(event) {
					var code = (event as KeyboardEvent).keyCode;
					if(0x30 <= code && code <= 0x39) {
						Eye._layerMask ^= 1 << (code - 0x30);
					} else if(code == 0x41) {
						Eye._clearDebugCanvas = !Eye._clearDebugCanvas;
					}
				}, false);
			}
			if(Eye._clearDebugCanvas) {
				this._debugContext.clearRect(0, 0, this._width, this._height);
			}
			this._debugContext.strokeStyle = '#f00';
			for(var i = 0; i < this._layerList.length; i++) {
				var layer = this._layerList[i];
				layer._renderDirtyRegion(this._debugContext);
			}
		}
		var counts = [] : Array.<number>;
		
		for(var i = 0; i < this._layerList.length; i++) {
			Tombo.count = 0;
			if((Eye._layerMask & (1 << i)) == 0) {
				continue;
			}
			var layer = this._layerList[i];
			// todo: check dirty flag
			layer._render();
			counts.push(Tombo.count);
			
			// check layout and set proper transform
			var width = layer.layout.clientWidth;
			var height = layer.layout.clientHeight;
			if(!width || !height) {
				Tombo.error("[Eye#render] layoutInformation.clientWidth/Height is not initialized");
			}
			
			// draw
			var transform = this._calculateLayoutTransform(layer);
			this._ctx.globalCompositeOperation = layer.layout.compositeOperation;
			this._ctx.drawImage(this._layerList[i]._canvas, transform.left, transform.top);
		}
		if(Tombo.DRAW_DIRTY_REGION) {
			if(Tombo.paintedRegion.length > 0) {
				this._debugContext.strokeStyle = '#00f';
				for(var i = 0; i < Tombo.paintedRegion.length; i += 4) {
					var x = Tombo.paintedRegion[i];
					var y = Tombo.paintedRegion[i + 1];
					var width = Tombo.paintedRegion[i + 2];
					var height = Tombo.paintedRegion[i + 3];
					this._debugContext.strokeRect(x, y, width, height);
				}
				Tombo.paintedRegion = [] : Array.<number>;
				this._debugContext.fillStyle = '#f00';
				this._debugContext.font = '16px Arial';
				this._debugContext.fillText('[' + counts.join() + ']', 0, 16);
			}
			this._ctx.drawImage(this._debugCanvas, 0, 0);
		}
	}
}
