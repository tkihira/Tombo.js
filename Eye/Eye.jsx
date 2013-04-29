import "js/web.jsx";

import "Layer.jsx";
import "LayoutInformation.jsx";
import "../Tombo.jsx";

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
	
	function render(): void {
		// todo: render only if any layer is dirty
		
		// todo: check background-color
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// for debug
		this.ctx.fillStyle = "#505050";
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		for(var i = 0; i < this.layerList.length; i++) {
			this.layerList[i].render();
			
			// TODO: check layout and set proper transform
			this.ctx.drawImage(this.layerList[i].canvas, 0, 0);
		}
	}
}
