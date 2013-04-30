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
	function constructor(left: number, top: number, scale: number, rotation: number) {
		super(null, left, top, scale, rotation);
	}
	/**
	 * create new group with position and scale
	 */
	function constructor(left: number, top: number, scale: number) {
		super(null, left, top, scale);
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
	override function _setLayer(layer: Layer): void {
		super._setLayer(layer);
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._setLayer(layer);
		}
	}
	override function _calcClientRect(): void {
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._calcClientRect();
		}
	}
	override function _render(ctx: CanvasRenderingContext2D): void {
		if(this.shape) {
			Tombo.warn("[DisplayGroup#render] not implemented: clipping");
		}
		
		ctx.save();
		var matrix = this._transform.getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		for(var i = 0; i < this._children.length; i++) {
			this._children[i]._render(ctx);
		}
		
		ctx.restore();
	}
}
