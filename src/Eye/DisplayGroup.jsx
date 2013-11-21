import "js.jsx";
import "js/web.jsx";

import "../Tombo.jsx";
import "../BasicTypes.jsx";
import "DisplayNode.jsx";
import "Layer.jsx";
import "Stream.jsx";
import "RenderingContext.jsx";

/**
 * DisplayGroup class
 * 
 * <p>The DOM-structure node group class.
 * Node is not permitted to have children. Group is not permitted to have shape.
 * Group can have matrix which will be affected to Group's children.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class DisplayGroup extends DisplayNode {
	// todo: support clipping
	var _children = []: DisplayNode[];
	
	/**
	 * create new group with position, scale and rotation
	 */
	function constructor(left: number, top: number, scaleX: number, scaleY: number, rotation: number) {
		super(null, left, top, scaleX, scaleY, rotation);
	}
	/**
	 * create new group with position and scale
	 */
	function constructor(left: number, top: number, scaleX: number, scaleY: number) {
		super(null, left, top, scaleX, scaleY);
	}
	/**
	 * create new group with position
	 */
	function constructor(left: number, top: number) {
		super(null, left, top);
	}
	/**
	 * create new group with matrix
	 */
	function constructor(matrix: number[]) {
		super(null, matrix);
	}
	/**
	 * create new group
	 */
	function constructor() {
		super(null);
	}
	
	var _groupDrawBin = 0;
	var _groupDrawOrder = 0;
	
	/**
	 * append child. You can also append DisplayGroup
	 */
	function appendChild(node: DisplayNode): void {
		this._children.push(node);
		node._setParent(this);
		node._setLayer(this._layer);
		
		if(this._groupDrawBin && !node._drawBin) {
			node.setDrawBin(this._groupDrawBin);
		}
		if(this._groupDrawOrder && !node._drawOrder) {
			node.setDrawOrder(this._groupDrawOrder);
		}
	}
	/**
	 * remove child
	 */
	function removeChild(node: DisplayNode): void {
		for(var i = 0; i < this._children.length; i++) {
			if(this._children[i] == node) {
				this._children.splice(i, 1);
				node._setParent(null);
				node._setLayer(null);
			}
		}
	}
	function removeAllChildren(): void {
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._setParent(null);
			this._children[i]._setLayer(null);
		}
		this._children = [];
	}
	function hasChildren(): boolean {
		return this._children.length > 0;
	}
	function invalidateAll(): void {
		if(this._layer) {
			this._layer.addDirtyRectangle(new Rect(0, 0, this._layer.width, this._layer.height));
		}
	}
	function addDirtyRectangles(rectangles: Array.<number>): void {
		if(this._layer) {
			var transform = this.getCompositeTransform();
			for(var i = 0; i < rectangles.length; i += 4) {
				var x = rectangles[i];
				var y = rectangles[i + 1];
				var width = rectangles[i + 2];
				var height = rectangles[i + 3];
				this._layer.addDirtyRectangle(transform.transformRect(new Rect(x, y, width, height)));
			}
		}
	}
	/**
	 * set the primary z-order
	 * @param value the primary z-order value. the smaller, the more behind
	 */
	override function setDrawBin(value: int): void {
		this._groupDrawBin = value;
		for(var i = 0; i < this._children.length; i++) {
			this._children[i].setDrawBin(value);
		}
	}
	/**
	 * set the secondary z-order
	 * @param value the secondary z-order value. the smaller, the more behind
	 */
	override function setDrawOrder(value: number): void {
		this._groupDrawOrder = value;
		for(var i = 0; i < this._children.length; i++) {
			this._children[i].setDrawOrder(value);
		}
	}

	override function _setLayer(layer: Layer): void {
		super._setLayer(layer);
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._setLayer(layer);
		}
	}
	override function _setDirtyRect(value: boolean): void {
		super._setDirtyRect(value);
		if(value) {
			for(var i = 0; i < this._children.length; i++) {
				this._children[i]._setDirtyRect(value);
			}
		}
	}
	override function _clearCompositeAlpha(): void {
		super._clearCompositeAlpha();
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._clearCompositeAlpha();
		}
	}
	override function _clearCompositeColor(): void {
		super._clearCompositeColor();
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._clearCompositeColor();
		}
	}
	override function _calcClientRect(): void {
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._calcClientRect();
		}
	}
	override function _addDirtyRectangle(): void {
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._addDirtyRectangle();
		}
	}
	override function _render(context: RenderingContext): void {
		/*
		if(this.shape) {
			Tombo.warn("[DisplayGroup#render] not implemented: clipping");
		}
		
		ctx.save();
		var matrix = this._transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._render(ctx);
		}
		
		ctx.restore();*/
	}
}
