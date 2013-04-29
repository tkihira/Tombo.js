import "js/web.jsx";

import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "../Tombo.jsx";

class Layer {
	var canvas: HTMLCanvasElement;
	var ctx: CanvasRenderingContext2D;
	var layout: LayoutInformation;
	
	var width: number; // final
	var height: number; // final
	var isChild = false;
	
	var displayList = []: DisplayNode[];
	
	function constructor(width: number, height: number) {
		var layout = new LayoutInformation();
		this.initialize(width, height, layout);
	}
	function constructor(width: number, height: number, layout: LayoutInformation) {
		this.initialize(width, height, layout);
	}
	function initialize(width: number, height: number, layout: LayoutInformation): void {
		this.layout = layout;
		this.width = width;
		this.height = height;
		
		if(layout.layoutMode & LayoutInformation.FIXED_SCALE) {
			// create canvas now
			this.modifyCanvas();
		}
	}
	
	function modifyCanvas(): void {
		var scale = this.layout.scale;
		var width = scale * this.width;
		var height = scale * this.height;
		if(!this.canvas) {
			this.canvas = dom.createElement("canvas") as HTMLCanvasElement;
		}
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
	}
	function setLayoutScale(scale: number): void {
		this.layout.scale = scale;
		this.modifyCanvas();
		// todo: set proper dirty flag
	}
	
	function render(): void {
		if(!this.canvas) {
			Tombo.warn("Layer's canvas is not created");
			this.modifyCanvas();
		}
		// todo: check zIndex(depth)
		for(var i = 0; i < this.displayList.length; i++) {
			// TODO: set proper matrix
			var node = this.displayList[i];
			node.render();
		}
	}
}
