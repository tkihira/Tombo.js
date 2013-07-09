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
	var _compositeColor = -1; // -1 if not initialized
	var _compositeAlpha = -1; // -1 if not initialized
	
	/** READONLY: the associated shape */
	var shape: Shape;
	/** READONLY: parent node group */
	var parent = null: DisplayGroup;
	
	var _color = 0;
	var _alpha = 1;
	
	var _drawBin = 0 as int;
	var _drawOrder = 0 as number;
	
	var _layer = null: Layer;
	var _isTouchable = false;
	var _transform: Transform;
	
	var _dirtyRect = true;
	var _dirty = true;

	var _id: number;
	static var _counter = 0;

	var _visible = true;
	var _anchorX = 0;
	var _anchorY = 0;

	/**
	 * create new node with shape, position, scale and rotation
	 */
	function constructor(shape: Shape, left: number, top: number, scaleX: number, scaleY: number, rotation: number) {
		this.shape = shape;
		this._transform = new Transform(left, top, scaleX, scaleY, rotation);
		this._id = DisplayNode._counter++;
	}
	/**
	 * create new node with shape, position and scale
	 */
	function constructor(shape: Shape, left: number, top: number, scaleX: number, scaleY: number) {
		this.shape = shape;
		this._transform = new Transform(left, top, scaleX, scaleY);
		this._id = DisplayNode._counter++;
	}
	/**
	 * create new node with shape and position
	 */
	function constructor(shape: Shape, left: number, top: number) {
		this.shape = shape;
		this._transform = new Transform(left, top);
		this._id = DisplayNode._counter++;
	}
	/**
	 * create new node with shape
	 */
	function constructor(shape: Shape) {
		this.shape = shape;
		this._transform = new Transform(0, 0);
		this._id = DisplayNode._counter++;
	}
	/**
	 * create new node with shape and matrix
	 */
	function constructor(shape: Shape, matrix: number[]) {
		this.shape = shape;
		this._transform = new Transform(matrix);
		this._id = DisplayNode._counter++;
	}
	
	/**
	 * set visible of the node
	 */
	function setVisible(enable: boolean): void {
		this._visible = enable;
	}
	/**
	 * set position of the node
	 */
	function setPosition(left: number, top: number): void {
		if(Layer.USE_NEW_RENDERER) {
			if(left != this._transform.left || top != this._transform.top) {
				this._addDirtyRectangle();
				this._transform.setPosition(left + this._anchorX, top + this._anchorY);
			}
			return;
		}
		this._transform.setPosition(left + this._anchorX, top + this._anchorY);
		this._setDirtyRect(true);
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
		this._setDirtyRect(true);
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
			if(Layer.USE_NEW_RENDERER) {
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
			if(Layer.USE_NEW_RENDERER) {
				this._addDirtyRectangle();
			}
		}
	}
	function _setParent(parent: DisplayGroup): void {
		this.parent = parent;
		this._setDirtyRect(true);
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
		var oldBin = this._drawBin;
		this._drawBin = value;
		if(this._layer) {
			this._layer._moveDrawBin(this, oldBin);
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
		this._compositeColor = -1;
		this._color = value;
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
		this._compositeAlpha = -1;
		this._alpha = value;
	}
	
	/**
	 * set scale of the node
	 */
	function setAnchor(anchorX: number, anchorY: number): void {
		var left = this._transform.left - this._anchorX;
		var top = this._transform.top - this._anchorY;
		this._anchorX = anchorX;
		this._anchorY = anchorY;
		this._transform.setPosition(left + anchorX, top + anchorY);
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
		if(Layer.USE_NEW_RENDERER) {
			this._compositeTransform = this._calcCompositeTransform();
			return this._compositeTransform;
		}
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
	
	function _addDirtyRectangle(): void {
		if(this._layer) {
			this._clientRect = this.getCompositeTransform().transformRect(this.shape.bounds);
			this._layer.addDirtyRectangle(this._clientRect);
			this._dirty = true;
		}
	}

	function _render(ctx: CanvasRenderingContext2D): void {
		if(!this._visible) {
			return;
		}
		var canvas = null: HTMLCanvasElement;
		var color = this._getCompositeColor();
		if(color != 0) {
			// TODO: caching
			var width = this.shape.bounds.width;
			var height = this.shape.bounds.height;
			
			var canvas = dom.createElement("canvas") as __noconvert__ HTMLCanvasElement;
			canvas.width = width;
			canvas.height = height;
			var cctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			this.shape.draw(cctx);
			
			// create alpha canvas
			var ac = dom.createElement("canvas") as __noconvert__ HTMLCanvasElement;
			ac.width = width;
			ac.height = height;
			var actx = ac.getContext("2d") as CanvasRenderingContext2D;
			actx.drawImage(canvas, 0, 0);
			actx.globalCompositeOperation = "source-atop";
			actx.fillStyle = "rgba(255,255,255,1)";
			actx.fillRect(0, 0, width, height);
			
			// create ouput canvas
			var oc = dom.createElement("canvas") as __noconvert__ HTMLCanvasElement;
			oc.width = width;
			oc.height = height;
			var octx = oc.getContext("2d") as CanvasRenderingContext2D;
			octx.globalCompositeOperation = "lighter";
			
			// breakdown RGB and compose
			var filters = [Color.createRGB(0, 0, 255), Color.createRGB(0, 255, 0), Color.createRGB(255, 0, 0)]; // order (B-> G-> R) is important
			
			for(var i = 0; i < 3; i++) {
				var ec = dom.createElement("canvas") as __noconvert__ HTMLCanvasElement;
				ec.width = width;
				ec.height = height;
				var ectx = ec.getContext("2d") as CanvasRenderingContext2D;
				ectx.drawImage(canvas, 0, 0);
				
				ectx.globalCompositeOperation = "darker";
				ectx.fillStyle = Color.stringify(filters[i]);
				ectx.fillRect(0, 0, width, height);
				
				color >>= 8;
				var alpha = 1 - (color & 0xFF) / 255;
				ectx.globalCompositeOperation = "source-over";
				ectx.globalAlpha = alpha;
				ectx.fillStyle = "#000";
				ectx.fillRect(0, 0, width, height);
				
				octx.drawImage(ec, 0, 0); // with lighter
			}
			// alpha mask
			octx.globalCompositeOperation = "destination-in";
			octx.globalAlpha = 1;
			octx.drawImage(ac, 0, 0);
			
			canvas = oc;
		}

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
			ctx.globalAlpha = this._getCompositeAlpha();
			var matrix = this.getCompositeTransform().getMatrix();
			js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
			if(canvas) {
				ctx.drawImage(canvas, 0, 0);
			} else {
				this.shape.draw(ctx);
			}
			ctx.restore();
			return;
		}
		ctx.save();
		var matrix = this.getCompositeTransform().getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		ctx.globalAlpha = this._getCompositeAlpha();
		if(canvas) {
			ctx.drawImage(canvas, 0, 0);
		} else {
			this.shape.draw(ctx);
		}
		
		ctx.restore();
	}
}
