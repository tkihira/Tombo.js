import "js.jsx";
import "js/web.jsx";

import "../Tombo.jsx";
import "../BasicTypes.jsx";
import "DisplayNode.jsx";
import "Layer.jsx";

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
	
	/**
	 * append child. You can also append DisplayGroup
	 */
	function appendChild(node: DisplayNode): void {
		this._children.push(node);
		node._setParent(this);
		node._setLayer(this._layer);
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
            if(this._children[i] instanceof DisplayGroup){
                var nodeGroup = this._children[i] as DisplayGroup;
                nodeGroup.removeAllChildren();
            }
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
	override function _render(ctx: CanvasRenderingContext2D): void {
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
