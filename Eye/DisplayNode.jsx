import "js/web.jsx";
import "js.jsx";

import "Shape.jsx";
import "../Tombo.jsx";

class DisplayNode {
	// initial value
	var left = 0;
	var top = 0;
	var scale = 1;
	var rotation = 0;
	var matrix = null: number[];
	var userMatrix = false;
	
	// TODO: calclate client positions
	//var clientRect: Rect;
	
	var shape: Shape;
	
	function constructor(shape: Shape, left: number, top: number, scale: number, rotation: number) {
		this.shape = shape;
		this.left = left;
		this.top = top;
		this.scale = scale;
		this.rotation = rotation;
		if(this.rotation) {
			this.calcMatrix();
		}
		// todo: calcClientRect
	}
	function constructor(shape: Shape, left: number, top: number, scale: number) {
		this.shape = shape;
		this.left = left;
		this.top = top;
		this.scale = scale;
		// todo: calcClientRect
	}
	function constructor(shape: Shape, left: number, top: number) {
		this.shape = shape;
		this.left = left;
		this.top = top;
		// todo: calcClientRect
	}
	function constructor(shape: Shape, matrix: number[]) {
		this.shape = shape;
		this.matrix = matrix;
		this.userMatrix = true;
		// todo: calcClientRect
	}
	
	function setPosition(left: number, top: number): void {
		this.left = left;
		this.top = top;
		if(this.rotation) {
			this.calcMatrix();
		}
		// todo: calcClientRect
		// todo: set dirty flag
	}
	function setScale(scale: number): void {
		this.scale = scale;
		if(this.rotation) {
			this.calcMatrix();
		}
		// todo: calcClientRect
		// todo: set dirty flag
	}
	function setRotation(rotation: number): void {
		this.rotation = rotation;
		this.calcMatrix();
		// todo: calcClientRect
		// todo: set dirty flag
	}
	
	function calcMatrix(): void {
		if(this.userMatrix) {
			// current matrix is set by users. do not touch this
			return;
		}
		if(this.rotation) {
			// set proper matrix value
			var cos = Math.cos(this.rotation);
			var sin = Math.sin(this.rotation);
			this.matrix = [cos * this.scale, sin, -sin, cos * this.scale, this.left, this.top]: number[];
		} else {
			// clear matrix becuase rotation == 0
			this.matrix = null;
		}
	}
	function setMatrix(matrix: number[]): void {
		if(matrix) {
			this.userMatrix = true;
			this.matrix = matrix;
		} else {
			this.userMatrix = false;
			this.calcMatrix();
		}
		// todo: calcClientRect
	}
	
	function render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		if(this.matrix) {
			js.invoke(ctx, "transform", this.matrix as __noconvert__ variant[]);
		} else {
			ctx.transform(this.scale, 0, 0, this.scale, this.left, this.top);
		}
		
		this.shape.draw(ctx);
		
		ctx.restore();
	}
}
