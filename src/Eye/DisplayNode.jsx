import "js/web.jsx";
import "js.jsx";

import "Stream.jsx";
import "Shape.jsx";
import "Layer.jsx";
import "Eye.jsx";
import "DisplayGroup.jsx";
import "RenderingContext.jsx";
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
	
	var _clientRect: Rect; // cached if possible
	var _renderRect: Rect;
	var _compositeTransform: Transform; // cached if possible
	var _compositeColor = -1; // -1 if not initialized
	var _compositeAlpha = -1; // -1 if not initialized
	
	/** READONLY: the associated shape */
	var shape: Shape;
	/** READONLY: parent node group */
	var parent = null: DisplayGroup;
	
	var _color = Color.createRGB(255, 255, 255);
	var _alpha = 1;
	
	var _drawBin = 0 as int;
	var _drawOrder = 0 as number;
	
	var _layer = null: Layer;
	var _isTouchable = false;
	var _transform: Transform; // transform of itself
	
	var _dirtyRect = true;
	var _dirty = true;
	var _geometryUpdated = true;
	var _hierarchyUpdated = true;

	var _id: number;
	static var _counter = 0;

	var _visible = true;
	var _anchorX = 0;
	var _anchorY = 0;

	var _compositeOperation = "";

	var _oldOperation = "";
	var _renderTransform: Transform; // cache
	var _lastChangedFrame = 0 as int;

	static const USE_RENDER_TRANSFORM = true;

	/*
	 * Base constructor
	 */
	function constructor(shape: Shape, transform: Transform) {
		this.shape = shape;
		this._transform = transform;
		this._renderRect = null;
		this._renderTransform = null;
		this._id = DisplayNode._counter++;
	}
	/**
	 * create new node with shape, position, scale and rotation
	 */
	function constructor(shape: Shape, left: number, top: number, scaleX: number, scaleY: number, rotation: number) {
		this(shape, new Transform(left, top, scaleX, scaleY, rotation));
	}
	/**
	 * create new node with shape, position and scale
	 */
	function constructor(shape: Shape, left: number, top: number, scaleX: number, scaleY: number) {
		this(shape, new Transform(left, top, scaleX, scaleY));
	}
	/**
	 * create new node with shape and position
	 */
	function constructor(shape: Shape, left: number, top: number) {
		this(shape, new Transform(left, top));
	}
	/**
	 * create new node with shape
	 */
	function constructor(shape: Shape) {
		this(shape, new Transform(0, 0));
	}
	/**
	 * create new node with shape and matrix
	 */
	function constructor(shape: Shape, matrix: number[]) {
		this(shape, new Transform(matrix));
	}
	
	/**
	 * set visible of the node
	 */
	function setVisible(enable: boolean): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(enable != this._visible) {
				this._visible = enable;
				this._addDirtyRectangle();
			}
			return;
		}
		this._visible = enable;
	}
	/**
	 * set position of the node
	 */
	function setPosition(left: number, top: number): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(left != this._transform.left || top != this._transform.top) {
				this._transform.setPosition(left, top);
				this._setDirtyRect(true);
				this._addDirtyRectangle();
				this._geometryUpdated = true;
			} else {
			}
			return;
		}
		this._transform.setPosition(left, top);
		this._setDirtyRect(true);
	}
	/**
	 * set scale of the node
	 */
	function setScale(scaleX: number, scaleY: number): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(scaleX != this._transform.scaleX || scaleY != this._transform.scaleY) {
				this._transform.setScale(scaleX, scaleY);
				this._setDirtyRect(true);
				this._addDirtyRectangle();
				this._geometryUpdated = true;
			} else {
			}
			return;
		}
		this._transform.setScale(scaleX, scaleY);
		this._setDirtyRect(true);
	}
	/**
	 * set rotation of the node
	 *
	 * @param rotation radian, not degree
	 */
	function setRotation(rotation: number): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(rotation != this._transform.rotation) {
				this._transform.setRotation(rotation);
				this._setDirtyRect(true);
				this._addDirtyRectangle();
				this._geometryUpdated = true;
			} else {
			}
			return;
		}
		this._transform.setRotation(rotation);
		this._setDirtyRect(true);
	}
	/**
	 * set matrix of the node
	 * once matrix is set, the position/scale/rotation will be ignored
	 *
	 * @param matrix [sx, r0, r1, sy, tx, ty] as the same order of ctx.transform argument
	 */
	function setMatrix(matrix: number[]): void {
		this._transform.setMatrix(matrix);
		this._setDirtyRect(true);
		this._addDirtyRectangle();
		this._geometryUpdated = true;
	}
	
	function _setLayer(layer: Layer): void {
		if(this._layer == layer) {
			return;
		}
		if(this._layer) {
			// remove
			this._layer._removeNode(this);
			if(this._isTouchable) {
				this._layer._removeTouchableNode(this);
			}
			if(RenderingContext.USE_NEW_RENDERER) {
				this._addDirtyRectangle();
			}
		}
		this._layer = layer;
		if(layer) {
			// add
			this._layer._addNode(this);
			if(this._isTouchable) {
				layer._addTouchableNode(this);
			}
			if(RenderingContext.USE_NEW_RENDERER) {
				this._addDirtyRectangle();
			}
		}
	}
	function _setParent(parent: DisplayGroup): void {
		this.parent = parent;
		this._setDirtyRect(true);
		this._addDirtyRectangle();
		this._hierarchyUpdated = true;
	}
	function _setDirtyRect(value: boolean): void {
		this._dirtyRect = value;
		if(value) {
			this._compositeTransform = null;
		}
	}
	
	/**
	 * set the primary z-order
	 * @param value the primary z-order value. the smaller, the more behind
	 */
	function setDrawBin(value: int): void {
		if(this._drawBin == value) {
			return;
		}
		var oldBin = this._drawBin;
		this._drawBin = value;
		if(this._layer) {
			this._layer._moveDrawBin(this, oldBin);
		}
		if(RenderingContext.USE_NEW_RENDERER) {
			this._addDirtyRectangle();
		}
	}
	/**
	 * get the primary z-order
	 */
	function getDrawBin(): int {
		return this._drawBin;
	}
	/**
	 * set the secondary z-order
	 * @param value the secondary z-order value. the smaller, the more behind
	 */
	function setDrawOrder(value: number): void {
		if(this._drawOrder == value) {
			return;
		}
		this._drawOrder = value;
		if(this._layer) {
			this._layer._dirtyDrawBin(this._drawBin);
		}
	}
	/**
	 * get the secondary z-order
	 */
	function getDrawOrder(): number {
		return this._drawOrder;
	}
	
	/**
	 * get node color
	 */
	function getColor(): number {
		return this._color;
	}
	/**
	 * set node color
	 */
	function setColor(value: number): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(this._color != value) {
				this._addDirtyRectangle();
				this._clearCompositeColor();
				this._color = value;
			}
			return;
		}
		this._clearCompositeColor();
		this._color = value;
	}
	function _clearCompositeColor(): void {
		this._compositeColor = -1;
	}
	
	/**
	 * get node alpha value
	 */
	function getAlpha(): number {
		return this._alpha;
	}
	/**
	 * set node alpha value
	 */
	function setAlpha(value: number): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(this._alpha != value) {
				this._addDirtyRectangle();
				this._clearCompositeAlpha();
				this._alpha = value;
			}
			return;
		}
		this._clearCompositeAlpha();
		this._alpha = value;
	}
	
	function _clearCompositeAlpha(): void {
		this._compositeAlpha = -1;
	}
	
	/**
	 * set scale of the node
	 */
	function setAnchor(anchorX: number, anchorY: number): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			if(this._anchorX != anchorX || this._anchorY != anchorY) {
				this._anchorX = anchorX;
				this._anchorY = anchorY;
				this._addDirtyRectangle();
			}
			return;
		}
		this._anchorX = anchorX;
		this._anchorY = anchorY;
	}
	/**
	 * Sets the width or height of this node. This function changes the size of
	 * the shape attached to this node and redraws it.
	 */
	function setSize(width: number, height: number): void {
		if(this.shape) {
			if(RenderingContext.USE_NEW_RENDERER) {
				if(width != this.shape.bounds.width || height != this.shape.bounds.height) {
					this.shape.bounds.width = width;
					this.shape.bounds.height = height;
					this._addDirtyRectangle();
				}
				return;
			}
			this.shape.bounds.width = width;
			this.shape.bounds.height = height;
		}
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
		if(!this._compositeTransform) {
			this._compositeTransform = this._calcCompositeTransform();
		}
		return this._compositeTransform;
	}
	function _calcCompositeTransform(): Transform {
		if(this.parent) {
			return Transform.mul(this.parent.getCompositeTransform(), this._transform);
		} else {
			return this._transform;
		}
	}

	function _getCompositeColor(): number {
		if(this._compositeColor == -1) {
			this._compositeColor = this._calcCompositeColor();
		}
		return this._compositeColor;
	}
	function _calcCompositeColor(): number {
		if(this.parent) {
			var c1 = this._color;
			var c2 = this.parent._getCompositeColor();
			if(c1 == 0) {
				return c2;
			}
			if(c2 == 0) {
				return c1;
			}
			var r = ((c1 >> 24) & 0xFF) / 255 * ((c2 >> 24) & 0xFF);
			var g = ((c1 >> 16) & 0xFF) / 255 * ((c2 >> 16) & 0xFF);
			var b = ((c1 >> 8) & 0xFF) / 255 * ((c2 >> 8) & 0xFF);
			
			return Color.createRGB(r, g, b);
		} else {
			return this._color;
		}
	}

	function _getCompositeAlpha(): number {
		if(this._compositeAlpha == -1) {
			this._compositeAlpha = this._calcCompositeAlpha();
		}
		return this._compositeAlpha;
	}
	function _calcCompositeAlpha(): number {
		if(this.parent) {
			return this._alpha * this.parent._getCompositeAlpha();
		} else {
			return this._alpha;
		}
	}


	function _calcClientRect(): void {
		// calculate transform
		this._clientRect = this.getCompositeTransform().transformRect(this.shape.bounds);
		this._setDirtyRect(false);
	}
	
	function _getRenderTransform(): Transform {
		if(!this._renderTransform) {
			var transform = this._calcCompositeTransform();
			if(this._anchorX != 0 || this._anchorY != 0) {
				transform = Transform.mul(transform, new Transform(-this._anchorX, -this._anchorY));
			}
			this._renderTransform = transform;
		}
		return this._renderTransform;
	}
	// invalidate the cached _renderTransform
	function _calcRenderRect(): void {
		this._renderTransform = null;
		this._renderRect = this._getRenderTransform().transformRect(this.shape.bounds);
	}

	function _addDirtyRectangle(): void {
		if (! Eye.useStreaming()) {
			if(this._layer) {
				if(this._renderRect) {
					this._layer.addDirtyRectangle(this._renderRect);
				}
				this._calcRenderRect();
				this._layer.addDirtyRectangle(this._renderRect);
			}
		}
		this._dirty = true;
	}
	
	function _setCompositeOperation(operation: string): void {
		this._compositeOperation = operation;
	}

	function _invisible(): boolean {
		var node = this;
		while(node) {
			if(!node._visible) {
				return true;
			}
			node = node.parent;
		}
		return false;
	}

	function isGeometryUpdated():boolean {
		var geometryUpdated = this._geometryUpdated;
		var y = this.parent;
		while (y && !geometryUpdated) {
			geometryUpdated = geometryUpdated || y._geometryUpdated;
			y = y.parent;
		}
		return geometryUpdated;
	}
}
