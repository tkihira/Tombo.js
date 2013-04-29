import "js/web.jsx";
import "js.jsx";

import "Shape.jsx";
import "Layer.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

class DisplayNode {
	
	// TODO: calclate client positions
	//var clientRect: Rect;
	
	var shape: Shape;
	var transform: Transform;
	var parent = null: DisplayNode;
	var layer = null: Layer;
	
	function constructor(shape: Shape, left: number, top: number, scale: number, rotation: number) {
		this.shape = shape;
		this.transform = new Transform(left, top, scale, rotation);
		// todo: calcClientRect
	}
	function constructor(shape: Shape, left: number, top: number, scale: number) {
		this.shape = shape;
		this.transform = new Transform(left, top, scale);
		// todo: calcClientRect
	}
	function constructor(shape: Shape, left: number, top: number) {
		this.shape = shape;
		this.transform = new Transform(left, top);
		// todo: calcClientRect
	}
	function constructor(shape: Shape, matrix: number[]) {
		this.shape = shape;
		this.transform = new Transform(matrix);
		// todo: calcClientRect
	}
	
	function setPosition(left: number, top: number): void {
		this.transform.setPosition(left, top);
		// todo: calcClientRect
		// todo: set dirty flag
	}
	function setScale(scale: number): void {
		this.transform.setScale(scale);
		// todo: calcClientRect
		// todo: set dirty flag
	}
	function setRotation(rotation: number): void {
		this.transform.setRotation(rotation);
		// todo: calcClientRect
		// todo: set dirty flag
	}
	function setMatrix(matrix: number[]): void {
		this.transform.setMatrix(matrix);
		// todo: calcClientRect
		// todo: set dirty flag
	}
	
	function setLayer(layer: Layer): void {
		this.layer = layer;
	}
	
	function render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		var matrix = this.transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		this.shape.draw(ctx);
		
		ctx.restore();
	}
}
