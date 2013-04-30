import "js/web.jsx";

import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "DisplayGroup.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

/**
 * Layer class
 * 
 * <p>Each layer has one internal on-memory canvas, but you don't need to care the canvas.
 * Layer's stage size is virtual, and the actual canvas's size is determined when the layer is appended.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class Layer {
	var _canvas: HTMLCanvasElement;
	var _ctx: CanvasRenderingContext2D;
	
	/**
	 * READONLY: the width of layer stage size
	 */
	var width: number; // final
	/**
	 * READONLY: the height of layer stage size
	 */
	var height: number; // final
	
	/**
	 * READONLY: the root group. you can add DisplayNodes into this.
	 */
	var root: DisplayGroup = new DisplayGroup(0, 0);
	
	/**
	 * READONLY: layout information which is belonged to this layer
	 */
	var layout: LayoutInformation;
	
	var _isChild = false;
	var _touchableNodeList = []: DisplayNode[];
	
	/**
	 * create new layer with the stage size (width, height) and default layout (CENTER and AUTO_SCALE)
	 */
	function constructor(width: number, height: number) {
		var layout = new LayoutInformation();
		this._initialize(width, height, layout);
	}
	/**
	 * create new layer with the stage size (width, height) and layout information
	 */
	function constructor(width: number, height: number, layout: LayoutInformation) {
		this._initialize(width, height, layout);
	}
	function _initialize(width: number, height: number, layout: LayoutInformation): void {
		this.layout = layout;
		this.width = width;
		this.height = height;
		this.root._setLayer(this);
		
		if(layout.layoutMode & LayoutInformation.FIXED_SCALE) {
			// create canvas now
			this._modifyCanvas();
		}
	}
	
	function _modifyCanvas(): void {
		var scale = this.layout.scale;
		var width = scale * this.width;
		var height = scale * this.height;
		if(!this._canvas) {
			this._canvas = dom.createElement("canvas") as HTMLCanvasElement;
		}
		this._canvas.width = width;
		this._canvas.height = height;
		this.layout.clientWidth = width;
		this.layout.clientHeight = height;
		this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._ctx.setTransform(scale, 0, 0, scale, 0, 0);
	}
	function _setLayoutScale(scale: number): void {
		this.layout.scale = scale;
		this._modifyCanvas();
		// todo: set proper dirty flag
	}
	function _addTouchableNode(node: DisplayNode): void {
		this._touchableNodeList.push(node);
	}
	function _removeTouchableNode(node: DisplayNode): void {
		for(var i = 0; i < this._touchableNodeList.length; i++) {
			if(this._touchableNodeList[i] == node) {
				this._touchableNodeList.splice(i, 1);
				return;
			}
		}
	}
	function _findTouchedNode(transform: Transform, x: number, y: number): DisplayNode {
//		if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
//			// return null;
//		}
		// todo: implement the proper check
		for(var i = 0; i < this._touchableNodeList.length; i++) {
			var node = this._touchableNodeList[i];
			// todo: check node's dirty flag and recalculation the rect if dirty
			if(!node._clientRect) {
				Tombo.warn("[Layer#findTouchedNode] node#clientRect is not set");
			}
			//log node.clientRect.left, node.clientRect.top, node.clientRect.width, node.clientRect.height, x, y;
			if(node._clientRect && transform.transformRect(node._clientRect).isInside(x, y)) {
				return node;
			}
		}
		return null;
	}
	
	function _render(): void {
		if(!this._canvas) {
			Tombo.warn("[Layer#render] Layer's canvas is not created");
			this._modifyCanvas();
		}
		this._ctx.clearRect(0, 0, this.width, this.height);
		this.root._render(this._ctx);
	}
}
