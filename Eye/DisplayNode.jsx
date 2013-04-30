import "js/web.jsx";
import "js.jsx";

import "Shape.jsx";
import "Layer.jsx";
import "DisplayGroup.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

/**
 * DisplayNode class
 * 
 * <p>The DOM-structure node class.
 * Node always has one shape which will be drawn when render is called.
 * Node is just shape container. You can control position, scale, rotation of the Node.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class DisplayNode {
	
	var _clientRect: Rect;
	var _compositeTransform: Transform;
	
	/** READONLY: the associated shape */
	var shape: Shape;
	/** READONLY: parent node group */
	var parent = null: DisplayGroup;
	
	
	var _layer = null: Layer;
	var _isTouchable = false;
	var _transform: Transform;
	
	/**
	 * create new node with shape, position, scale and rotation
	 */
	function constructor(shape: Shape, left: number, top: number, scale: number, rotation: number) {
		this.shape = shape;
		this._transform = new Transform(left, top, scale, rotation);
	}
	/**
	 * create new node with shape, position and scale
	 */
	function constructor(shape: Shape, left: number, top: number, scale: number) {
		this.shape = shape;
		this._transform = new Transform(left, top, scale);
	}
	/**
	 * create new node with shape and position
	 */
	function constructor(shape: Shape, left: number, top: number) {
		this.shape = shape;
		this._transform = new Transform(left, top);
	}
	/**
	 * create new node with shape
	 */
	function constructor(shape: Shape) {
		this.shape = shape;
		this._transform = new Transform(0, 0);
	}
	/**
	 * create new node with shape and matrix
	 */
	function constructor(shape: Shape, matrix: number[]) {
		this.shape = shape;
		this._transform = new Transform(matrix);
	}
	
	/**
	 * set position of the node
	 */
	function setPosition(left: number, top: number): void {
		this._transform.setPosition(left, top);
		this._calcClientRect();
		// todo: set dirty flag
	}
	/**
	 * set scale of the node
	 */
	function setScale(scale: number): void {
		this._transform.setScale(scale);
		this._calcClientRect();
		// todo: set dirty flag
	}
	/**
	 * set rotation of the node
	 *
	 * @param rotation radian, not degree
	 */
	function setRotation(rotation: number): void {
		this._transform.setRotation(rotation);
		this._calcClientRect();
		// todo: set dirty flag
	}
	/**
	 * set matrix of the node
	 * once matrix is set, the position/scale/rotation will be ignored
	 *
	 * @param matrix [sx, r0, r1, sy, tx, ty] as the same order of ctx.transform argument
	 */
	function setMatrix(matrix: number[]): void {
		this._transform.setMatrix(matrix);
		this._calcClientRect();
		// todo: set dirty flag
	}
	
	function _setLayer(layer: Layer): void {
		if(this._layer) {
			// remove
			if(this._isTouchable) {
				this._layer._removeTouchableNode(this);
			}
		}
		this._layer = layer;
		if(layer) {
			// add
			if(this._isTouchable) {
				layer._addTouchableNode(this);
			}
		}
	}
	function _setParent(parent: DisplayGroup): void {
		this.parent = parent;
		this._calcClientRect();
	}
	
	
	/**
	 * indicate that this node is touch sensitive or not
	 */
	function setTouchable(touchable: boolean): void {
		if(this._isTouchable && !touchable && this._layer) {
			this._layer._removeTouchableNode(this);
		} else if(!this._isTouchable && touchable && this._layer) {
			this._layer._addTouchableNode(this);
		}
		this._isTouchable = touchable;
	}
	
	function _calcClientRect(): void {
		// todo: lazy eval using dirty flag
		if(!this.parent) {
			return;
		}
		// calculate transform
		if(this.parent) {
			this._compositeTransform = Transform.mul(this.parent._transform, this._transform);
		} else {
			this._compositeTransform = this._transform;
		}
		this._clientRect = this._compositeTransform.transformRect(this.shape.bounds);
	}
	
	function _render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		var matrix = this._transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		this.shape.draw(ctx);
		
		ctx.restore();
	}
}
