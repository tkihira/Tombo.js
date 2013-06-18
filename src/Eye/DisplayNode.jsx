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
	
	var _dirtyRect = true;
	var _dirty : boolean;

	/**
	 * create new node with shape, position, scale and rotation
	 */
	function constructor(shape: Shape, left: number, top: number, scaleX: number, scaleY: number, rotation: number) {
		this.shape = shape;
		this._transform = new Transform(left, top, scaleX, scaleY, rotation);
		this._dirty = true;
	}
	/**
	 * create new node with shape, position and scale
	 */
	function constructor(shape: Shape, left: number, top: number, scaleX: number, scaleY: number) {
		this.shape = shape;
		this._transform = new Transform(left, top, scaleX, scaleY);
		this._dirty = true;
	}
	/**
	 * create new node with shape and position
	 */
	function constructor(shape: Shape, left: number, top: number) {
		this.shape = shape;
		this._transform = new Transform(left, top);
		this._dirty = true;
	}
	/**
	 * create new node with shape
	 */
	function constructor(shape: Shape) {
		this.shape = shape;
		this._transform = new Transform(0, 0);
		this._dirty = true;
	}
	/**
	 * create new node with shape and matrix
	 */
	function constructor(shape: Shape, matrix: number[]) {
		this.shape = shape;
		this._transform = new Transform(matrix);
		this._dirty = true;
	}
	
	/**
	 * set position of the node
	 */
	function setPosition(left: number, top: number): void {
		if(Layer.USE_NEW_RENDERER) {
			if(left != this._transform.left || top != this._transform.top) {
				this._addDirtyRectangle();
				this._transform.setPosition(left, top);
			}
			return;
		}
		this._transform.setPosition(left, top);
		this._dirtyRect = true;
	}
	/**
	 * set scale of the node
	 */
	function setScale(scaleX: number, scaleY: number): void {
		if(Layer.USE_NEW_RENDERER) {
			if(scaleX != this._transform.scaleX || scaleY != this._transform.scaleY) {
				this._addDirtyRectangle();
				this._transform.setScale(scaleX, scaleY);
			}
			return;
		}
		this._transform.setScale(scaleX, scaleY);
		this._dirtyRect = true;
	}
	/**
	 * set rotation of the node
	 *
	 * @param rotation radian, not degree
	 */
	function setRotation(rotation: number): void {
		if(Layer.USE_NEW_RENDERER) {
			if(rotation != this._transform.rotation) {
				this._addDirtyRectangle();
				this._transform.setRotation(rotation);
			}
			return;
		}
		this._transform.setRotation(rotation);
		this._dirtyRect = true;
	}
	/**
	 * set matrix of the node
	 * once matrix is set, the position/scale/rotation will be ignored
	 *
	 * @param matrix [sx, r0, r1, sy, tx, ty] as the same order of ctx.transform argument
	 */
	function setMatrix(matrix: number[]): void {
		this._transform.setMatrix(matrix);
		this._dirtyRect = true;
	}
	
	function _setLayer(layer: Layer): void {
		if(this._layer) {
			// remove
			if(this._isTouchable) {
				this._layer._removeTouchableNode(this);
			}
			if(Layer.USE_NEW_RENDERER) {
				this._addDirtyRectangle();
			}
		}
		this._layer = layer;
		if(layer) {
			// add
			if(this._isTouchable) {
				layer._addTouchableNode(this);
			}
			if(Layer.USE_NEW_RENDERER) {
				this._addDirtyRectangle();
			}
		}
	}
	function _setParent(parent: DisplayGroup): void {
		this.parent = parent;
		this._dirtyRect = true;
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

	function getClientRect(): Rect {
		if(this._dirtyRect) {
			this._calcClientRect();
		}
		return this._clientRect;
	}

	function getCompositeTransform(): Transform {
		// TODO: dirty flag
		this._compositeTransform = this._calcCompositeTransform();
		return this._compositeTransform;
	}

	function _calcCompositeTransform(): Transform {
		if(this.parent) {
			return Transform.mul(this.parent.getCompositeTransform(), this._transform);
		} else {
			return this._transform;
		}
	}

	function _calcClientRect(): void {
		// calculate transform
		this._clientRect = this.getCompositeTransform().transformRect(this.shape.bounds);
		this._dirtyRect = false;
	}
	
	function _addDirtyRectangle(): void {
		if(this._layer) {
			this._clientRect = this.getCompositeTransform().transformRect(this.shape.bounds);
			this._layer.addDirtyRectangle(this._clientRect);
			this._dirty = true;
		}
	}

	function _render(ctx: CanvasRenderingContext2D): void {
		if(Layer.USE_NEW_RENDERER) {
			// We have to draw this object:
			// * when this object is marked as dirty, or;
			// * when this object has an intersection with dirty rectangles.
			// It may take long time to check if an object has an intersection
			// with the dirty rectangles and this code skips checking whether a
			// dirty object has an intersection with the dirty rectangles, which
			// is obviously true.
			if(!this._dirty && !this._layer.hasIntersection(this._clientRect)) {
				return;
			}
			this._dirty = false;
			ctx.save();
			var matrix = this._transform.getMatrix();
			js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
			this.shape.draw(ctx);
			ctx.restore();
			return;
		}
		ctx.save();
		var matrix = this._transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		this.shape.draw(ctx);
		
		ctx.restore();
	}
}
