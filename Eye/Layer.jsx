import "js/web.jsx";

import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "DisplayGroup.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

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
	function removeTouchableNode(node: DisplayNode): void {
		for(var i = 0; i < this.touchableNodeList.length; i++) {
			if(this.touchableNodeList[i] == node) {
				this.touchableNodeList.splice(i, 1);
				return;
			}
		}
	}
	function findTouchedNode(transform: Transform, x: number, y: number): DisplayNode {
//		if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
//			// return null;
//		}
		for(var i = 0; i < this.touchableNodeList.length; i++) {
			var node = this.touchableNodeList[i];
			// todo: check node's dirty flag and recalculation the rect if dirty
			if(!node.clientRect) {
				Tombo.warn("[Layer#findTouchedNode] node#clientRect is not set");
			}
			//log node.clientRect.left, node.clientRect.top, node.clientRect.width, node.clientRect.height, x, y;
			if(node.clientRect && transform.transformRect(node.clientRect).isInside(x, y)) {
				return node;
			}
		}
		return null;
	}
	
	function render(): void {
		if(!this.canvas) {
			Tombo.warn("[Layer#render] Layer's canvas is not created");
			this.modifyCanvas();
		}
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.root.render(this.ctx);
	}
}
