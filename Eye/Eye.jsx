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
		return new Transform(left, top, layer.layout.scale);
	}
	
	/**
	 * render layers
	 */
	function render(): void {
		// todo: render only if any layer is dirty
		
		// todo: check background-color
		this._ctx.clearRect(0, 0, this._width, this._height);
		
		// for debug
		this._ctx.fillStyle = "#505050";
		this._ctx.fillRect(0, 0, this._width, this._height);
		
		for(var i = 0; i < this._layerList.length; i++) {
			var layer = this._layerList[i];
			// todo: check dirty flag
			layer._render();
			
			// check layout and set proper transform
			var width = layer.layout.clientWidth;
			var height = layer.layout.clientHeight;
			if(!width || !height) {
				Tombo.error("[Eye#render] layoutInformation.clientWidth/Height is not initialized");
			}
			
			// draw
			var transform = this._calculateLayoutTransform(layer);
			this._ctx.drawImage(this._layerList[i]._canvas, transform.left, transform.top);
		}
	}
}
