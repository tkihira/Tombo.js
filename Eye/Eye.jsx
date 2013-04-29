import "js/web.jsx";

import "Layer.jsx";
import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

class Eye {
	var canvas: HTMLCanvasElement;
	var width: number;
	var height: number;
	var ctx: CanvasRenderingContext2D;
	
	var layerList: Array.<Layer>;
	
	function constructor() {
		this.initialize(640, 960);
	}
	function constructor(canvas: HTMLCanvasElement) {
		this.initialize(canvas);
	}
	function constructor(width: number, height: number) {
		this.initialize(width, height);
	}
	
	function initialize(width: number, height: number): void {
		var canvas = dom.createElement("canvas") as HTMLCanvasElement;
		canvas.width = width;
		canvas.height = height;
		this.initialize(canvas);
	}
	function initialize(canvas: HTMLCanvasElement): void {
		if(this.canvas) {
			Tombo.error("[Eye#initialize] Tombo Eye is already initialized");
		}
		this.setCanvas(canvas);
		this.layerList = []: Layer[];
	}
	
	function setCanvas(canvas: HTMLCanvasElement): void {
		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		
		// todo: recalculate all layer's layout
	}
	
	function findTouchedNode(x: number, y: number): DisplayNode {
		for(var i = 0; i < this.layerList.length; i++) {
			var layer = this.layerList[i];
			// todo: check dirty flag
			
			// check layout and set proper transform
			var width = layer.layout.clientWidth;
			var height = layer.layout.clientHeight;
			if(!width || !height) {
				Tombo.warn("[Eye#findTouchedNode] layoutInformation.clientWidth/Height is not initialized");
			} else {
				// todo: cache the calculated values
				var transform = this.calculateLayoutTransform(layer);
				var node = layer.findTouchedNode(transform, x, y);
				if(node) {
					return node;
				}
			}
		}
		return null;
	}
	
	function appendLayer(layer: Layer): void {
		if(layer.isChild) {
			Tombo.warn("[Eye#appendLayer] now trying to append a layer which is already appended");
		}
		if(layer.layout.layoutMode & LayoutInformation.AUTO_SCALE) {
			// calculate scale
			var scale = Math.min(this.width / layer.width, this.height / layer.height);
			layer.setLayoutScale(scale);
		}
		this.layerList.push(layer);
		layer.isChild = true;
		
		// todo: set proper dirty flag
	}
	
	function calculateLayoutTransform(layer: Layer): Transform {
		// todo: cache the result
		var width = layer.layout.clientWidth;
		var height = layer.layout.clientHeight;
		var left = 0;
		var top = 0;
		if(layer.layout.layoutMode & LayoutInformation.CENTER) {
			left = (this.width - width) / 2;
			top = (this.height - height) / 2;
		}
		if(layer.layout.layoutMode & LayoutInformation.LEFT) {
			left = layer.layout.left;
		}
		if(layer.layout.layoutMode & LayoutInformation.TOP) {
			top = layer.layout.top;
		}
		if(layer.layout.layoutMode & LayoutInformation.RIGHT) {
			left = this.width - width - layer.layout.right;
		}
		if(layer.layout.layoutMode & LayoutInformation.BOTTOM) {
			top = this.height - height - layer.layout.bottom;
		}
		return new Transform(left, top, layer.layout.scale);
	}
	
	function render(): void {
		// todo: render only if any layer is dirty
		
		// todo: check background-color
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// for debug
		this.ctx.fillStyle = "#505050";
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		for(var i = 0; i < this.layerList.length; i++) {
			var layer = this.layerList[i];
			// todo: check dirty flag
			layer.render();
			
			// check layout and set proper transform
			var width = layer.layout.clientWidth;
			var height = layer.layout.clientHeight;
			if(!width || !height) {
				Tombo.error("[Eye#render] layoutInformation.clientWidth/Height is not initialized");
			}
			
			// draw
			var transform = this.calculateLayoutTransform(layer);
			this.ctx.drawImage(this.layerList[i].canvas, transform.left, transform.top);
		}
	}
}
