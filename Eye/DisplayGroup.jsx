import "js.jsx";
import "js/web.jsx";

import "../Tombo.jsx";
import "../BasicTypes.jsx";
import "DisplayNode.jsx";
import "Layer.jsx";

class DisplayGroup extends DisplayNode {
	// todo: support clipping
	var children = []: DisplayNode[];
	
	function constructor(left: number, top: number, scale: number, rotation: number) {
		super(null, left, top, scale, rotation);
	}
	function constructor(left: number, top: number, scale: number) {
		super(null, left, top, scale);
	}
	function constructor(left: number, top: number) {
		super(null, left, top);
	}
	function constructor(matrix: number[]) {
		super(null, matrix);
	}
	
	function appendChild(node: DisplayNode): void {
		this.children.push(node);
		node.setParent(this);
		node.setLayer(this.layer);
	}
	override function setLayer(layer: Layer): void {
		super.setLayer(layer);
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].setLayer(layer);
		}
	}
	override function calcClientRect(): void {
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].calcClientRect();
		}
	}
	override function render(ctx: CanvasRenderingContext2D): void {
		if(this.shape) {
			Tombo.warn("[DisplayGroup#render] not implemented: clipping");
		}
		
		ctx.save();
		var matrix = this.transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].render(ctx);
		}
		
		ctx.restore();
	}
}
