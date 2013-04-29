import "js/web.jsx";
import "js.jsx";

import "Shape.jsx";
import "Layer.jsx";
import "DisplayGroup.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

class DisplayNode {
	
	// TODO: calclate client positions
	var clientRect: Rect;
	var compositeTransform: Transform;
	
	var shape: Shape;
	var transform: Transform;
	var parent = null: DisplayGroup;
	var layer = null: Layer;
	var isTouchable = false;
	
	function constructor(shape: Shape, left: number, top: number, scale: number, rotation: number) {
		this.shape = shape;
		this.transform = new Transform(left, top, scale, rotation);
	}
	function constructor(shape: Shape, left: number, top: number, scale: number) {
		this.shape = shape;
		this.transform = new Transform(left, top, scale);
	}
	function constructor(shape: Shape, left: number, top: number) {
		this.shape = shape;
		this.transform = new Transform(left, top);
	}
	function constructor(shape: Shape, matrix: number[]) {
		this.shape = shape;
		this.transform = new Transform(matrix);
	}
	
	function setPosition(left: number, top: number): void {
		this.transform.setPosition(left, top);
		this.calcClientRect();
		// todo: set dirty flag
	}
	function setScale(scale: number): void {
		this.transform.setScale(scale);
		this.calcClientRect();
		// todo: set dirty flag
	}
	function setRotation(rotation: number): void {
		this.transform.setRotation(rotation);
		this.calcClientRect();
		// todo: set dirty flag
	}
	function setMatrix(matrix: number[]): void {
		this.transform.setMatrix(matrix);
		this.calcClientRect();
		// todo: set dirty flag
	}
	
	function setLayer(layer: Layer): void {
		if(this.layer) {
			// remove
			if(this.isTouchable) {
				this.layer.removeTouchableNode(this);
			}
		}
		this.layer = layer;
		if(layer) {
			// add
			if(this.isTouchable) {
				layer.addTouchableNode(this);
			}
		}
	}
	function setParent(parent: DisplayGroup): void {
		this.parent = parent;
		this.calcClientRect();
	}
	
	
	function setTouchable(touchable: boolean): void {
		if(this.isTouchable && !touchable && this.layer) {
			this.layer.removeTouchableNode(this);
		} else if(!this.isTouchable && touchable && this.layer) {
			this.layer.addTouchableNode(this);
		}
		this.isTouchable = touchable;
	}
	
	function calcClientRect(): void {
		// todo: lazy eval using dirty flag
		if(!this.parent) {
			return;
		}
		// calculate transform
		if(this.parent) {
			this.compositeTransform = Transform.mul(this.parent.transform, this.transform);
		} else {
			this.compositeTransform = this.transform;
		}
		this.clientRect = this.compositeTransform.transformRect(this.shape.bounds);
	}
	
	function render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		var matrix = this.transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		this.shape.draw(ctx);
		
		ctx.restore();
	}
}
