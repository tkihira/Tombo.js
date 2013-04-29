import "js/web.jsx";

import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "DisplayGroup.jsx";
import "../Tombo.jsx";

class Layer {
	var canvas: HTMLCanvasElement;
	var ctx: CanvasRenderingContext2D;
	var layout: LayoutInformation;
	
	var width: number; // final
	var height: number; // final
	var isChild = false;
	
	var root: DisplayGroup = new DisplayGroup(0, 0);
	var touchableNodeList = []: DisplayNode[];
	
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
		this.root.setLayer(this);
		
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
		this.layout.clientWidth = width;
		this.layout.clientHeight = height;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
	}
	function setLayoutScale(scale: number): void {
		this.layout.scale = scale;
		this.modifyCanvas();
		// todo: set proper dirty flag
	}
	function addTouchableNode(node: DisplayNode): void {
		this.touchableNodeList.push(node);
	}
	
	function render(): void {
		if(!this.canvas) {
			Tombo.warn("[Layer#render] Layer's canvas is not created");
			this.modifyCanvas();
		}
		this.root.render(this.ctx);
	}
}
