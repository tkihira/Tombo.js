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
	
	var _dirtyRegions : Array.<Array.<number>>;
	static const USE_NEW_RENDERER = false;

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
		this._dirtyRegions = [] : Array.<Array.<number>>;
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
			var clientRect = node.getClientRect();
			//log node.clientRect.left, node.clientRect.top, node.clientRect.width, node.clientRect.height, x, y;
			if(clientRect && transform.transformRect(clientRect).isInside(x, y)) {
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
		if(Layer.USE_NEW_RENDERER) {
			// Erase the region covered by the dirty rectangles and redraw
			// objects that have intersections with the rectangles.
			if(this._dirtyRegions.length == 0) {
				return;
			}
			var context = this._ctx;
			// Clean up this layer and return now without saving or restoring
			// the context if it does not have any nodes. (It is better to avoid
			// unnecessary calls for Canvas APIs.)
			if (!this.root.hasChildren()) {
				context.clearRect(0, 0, this.width, this.height);
				this._dirtyRegions = [] : Array.<Array.<number>>;
				return;
			}
			context.save();
			context.beginPath();
			var length = this._dirtyRegions.length;
			for(var i = 0; i < length; ++i) {
				var region = this._dirtyRegions[i];
				var x = region[0];
				var y  = region[1];
				var width = region[2] - x;
				var height = region[3] - y;
				context.rect(x, y, width, height);
			}
			context.clip();
			context.clearRect(0, 0, this.width, this.height);
			this.root._render(context);
			context.restore();
			this._dirtyRegions = [] : Array.<Array.<number>>;
			return;
		}
		this._ctx.clearRect(0, 0, this.width, this.height);
		this.root._render(this._ctx);
	}

	function addDirtyRectangle(rectangle: Rect) : void {
		// Add a couple of points (a top-left corner and a bottom-right corner)
		// of the specified rectangle to the list of dirty regions for easier
		// calculation of separation lines.
		this._dirtyRegions.push([rectangle.left, rectangle.top, rectangle.left + rectangle.width, rectangle.top + rectangle.height]);
	}

	function hasIntersection(rectangle : Rect): boolean {
		// Use the hyperplane-separation theorem to filter out rectangles that
		// do not have intersections with dirty ones. Even though this code has
		// true-negative cases (i.e. it does not filter out rectangles that do
		// not have intersections with the dirty ones) it is sufficient for
		// this use case.
		var minX = rectangle.left;
		var minY = rectangle.top;
		var maxX = minX + rectangle.width;
		var maxY = minY + rectangle.height;
		if(maxX < 0 || maxY < 0 || minX >= this.width || minY >= this.height) {
			return false;
		}
		var length = this._dirtyRegions.length;
		for(var i = 0; i < length; ++i) {
			var region = this._dirtyRegions[i];
			if(Math.max(minX, region[0]) < Math.min(maxX, region[2]) && Math.max(minY, region[1]) < Math.min(maxY, region[3])) {
				return true;
			}
		}
		return false;
	}
}
