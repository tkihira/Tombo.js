import "js/web.jsx";
import "js.jsx";

import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "DisplayGroup.jsx";
import "Eye.jsx";
import "RenderingContext.jsx";
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
	
	/**
	 * READONLY: redraw all nodes
	 */
	var forceRedraw = true;
	
	static var _counter = 0;
	var _id: number;
	var _isChild = false;
	var _touchableNodeList = []: DisplayNode[];
	
	var _dirtyRegions : Array.<Array.<number>>;
	static const USE_NEW_RENDERER = true;
	
	var _drawBins = {}: Map.<Array.<DisplayNode>>;
	var _orderDrawBins = []: Array.<int>;
	var _dirtyDrawBins = {}: Map.<boolean>;
	var _dirtyOrderDrawBins = false;

	var _alpha: number;
	var _compositeOperation: string;

	/**
	 * create new layer with the stage size (width, height) and default layout (CENTER and AUTO_SCALE)
	 */
	function constructor(width: number, height: number, id: number = -1) {
		var layout = new LayoutInformation();
		this._initialize(width, height, layout, id);
	}
	/**
	 * create new layer with the stage size (width, height) and layout information
	 */
	 function constructor(width: number, height: number, layout: LayoutInformation, id: number = -1) {
		this._initialize(width, height, layout, id);
	}
	function _initialize(width: number, height: number, layout: LayoutInformation, id: number): void {
		if(id < 0) {
			this._id = Layer._counter++;
		} else {
			this._id = id;
			if(id >= Layer._counter) {
				Layer._counter = id + 1;
			}
		}
		this.layout = layout;
		this.width = width;
		this.height = height;
		this.root._setLayer(this);
		
		if(layout.layoutMode & LayoutInformation.FIXED_SCALE) {
			// create canvas now
			this._modifyCanvas();
		}
		this._dirtyRegions = [] : Array.<Array.<number>>;
		if(this.forceRedraw) {
			this._dirtyRegions = [[0, 0, this.width, this.height]];
		}
		this._alpha = 1;
		this._compositeOperation = "source-over";
	}
	
	function _modifyCanvas(): void {
		var scale = this.layout.scale;
		var width = scale * this.width;
		var height = scale * this.height;
		if(!Eye.useStreaming()) {
			if(!this._canvas) {
				this._canvas = dom.createElement("canvas") as HTMLCanvasElement;
			}
			this._canvas.width = width;
			this._canvas.height = height;
		}
		this.layout.clientWidth = width;
		this.layout.clientHeight = height;
		if(!Eye.useStreaming()) {
			this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
			this._ctx.setTransform(scale, 0, 0, scale, 0, 0);
		}
	}
	function _setLayoutScale(scale: number): void {
		this.layout.scale = scale;
		this._modifyCanvas();
		// todo: set proper dirty flag
	}
	function _addNode(node: DisplayNode): void {
		this._addNodeToBin(node);
	}
	function _getDrawBin(drawBin: int): Array.<DisplayNode> {
		var key = drawBin as string;
		var bin = this._drawBins[key];
		if(bin) {
			return bin;
		}
		// Create a new bin and insert it to the bin list, in which bins
		// are sorted in the ascending order. (Bins are never deleted
		// even when they become empty.)
		bin = []: Array.<DisplayNode>;
		this._drawBins[key] = bin;
		this._dirtyDrawBins[key] = false;
		var length = this._orderDrawBins.length;
		if(length == 0) {
			this._orderDrawBins.push(drawBin);
			return bin;
		}
		// Add this bin at the beginning of this bin list or its end
		// without marking the list as dirty if we can add the bin
		// without sorting the list.
		if(!this._dirtyOrderDrawBins) {
			var lastDrawBin = this._orderDrawBins[--length];
			if (lastDrawBin <= drawBin) {
				this._orderDrawBins.push(drawBin);
				return bin;
			}
			var firstDrawBin = this._orderDrawBins[0];
			if (drawBin <= firstDrawBin) {
				this._orderDrawBins.unshift(drawBin);
				return bin;
			}
		}
		this._orderDrawBins.push(drawBin);
		this._dirtyOrderDrawBins = true;
		return bin;
	}
	function _addNodeToBin(node: DisplayNode): void {
		// Add this node to a draw bin associated with the node and mark
		// the bin as dirty if it needs to be sorted. (To avoid sorting
		// nodes too often, this function adds the node to the bin
		// without marking it as dirty if it can add the node at the
		//  beginning of the bin or its end.)
		var bin = this._getDrawBin(node._drawBin);
		var length = bin.length;
		if(length == 0) {
			bin.push(node);
			return;
		}
		if(!this._dirtyDrawBins[node._drawBin as string]) {
			--length;
			var lastOrder = bin[length]._drawOrder;
			var lastId = bin[length]._id;
			if(lastOrder < node._drawOrder || lastOrder == node._drawOrder && lastId <= node._id) {
				bin.push(node);
				return;
			}
			var firstOrder = firstOrder = bin[0]._drawOrder;
			var firstId = bin[0]._id;
			if(node._drawOrder < firstOrder || node._drawOrder == firstOrder && node._id <= firstId) {
				bin.unshift(node);
				return;
			}
		}
		bin.push(node);
		this._dirtyDrawBin(node._drawBin);
	}
	function _removeNode(node: DisplayNode): void {
		this._removeNodeFromBin(node, node._drawBin as string);
	}
	function _removeNodeFromBin(node: DisplayNode, index: string): void {
		var bin = this._drawBins[index];
		for(var i = 0; i < bin.length; i++) {
			if(bin[i] == node) {
				bin.splice(i, 1);
				// no need to set dirty flag because it's not affected to drawing order by removing an item
				return;
			}
		}
	}
	function _moveDrawBin(node: DisplayNode, oldBin: int): void {
		// move node from oldBin to node._drawBin
		this._removeNodeFromBin(node, oldBin as string);
		this._addNodeToBin(node);
	}
	function _dirtyDrawBin(index: int): void {
		this._dirtyDrawBins[index as string] = true;
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
		var nodes = []: DisplayNode[];
		// todo: implement the proper check
		for(var i = 0; i < this._touchableNodeList.length; i++) {
			var node = this._touchableNodeList[i];
			var clientRect = node.getClientRect();
			//log node.clientRect.left, node.clientRect.top, node.clientRect.width, node.clientRect.height, x, y;
			if(clientRect && transform.transformRect(clientRect).isInside(x, y)) {
				var ret = node;
				while(node) {
					if(!node._visible) {
						break;
					}
					node = node.parent;
				}
				if(!node) {
					nodes.push(ret);
				}
			}
		}
		if(nodes.length) {
			if(nodes.length == 1) {
				return nodes[0];
			} else {
				nodes.sort((a, b) -> {
					return (b._drawBin - a._drawBin)?: ((b._drawOrder - a._drawOrder) ?: (b._id - a._id));
				});
				return nodes[0];
			}
		}
		return null;
	}
	
	function _render(context: RenderingContext): void {
		if(Layer.USE_NEW_RENDERER) {
			// Erase the region covered by the dirty rectangles and redraw
			// objects that have intersections with the rectangles.
			if(this._dirtyRegions.length == 0) {
				return;
			}

			// Clean up this layer and return now without saving or restoring
			// the context if it does not have any nodes. (It is better to avoid
			// unnecessary calls for Canvas APIs.)
			if (!this.root.hasChildren()) {
				context.clearRect(0, 0, this.width, this.height);
				this._dirtyRegions = [] : Array.<Array.<number>>;
				if(this.forceRedraw) {
					this._dirtyRegions = [[0, 0, this.width, this.height]];
				}
				return;
			}

			context.clipDirtyRegions(this);

			if (this._dirtyOrderDrawBins) {
				this._orderDrawBins.sort((a, b) -> { return a - b; });
				this._dirtyOrderDrawBins = false;
			}

			var bins = []: Array.<Array.<DisplayNode>>;

			for(var i = 0; i < this._orderDrawBins.length; i++) {
				var binIndex = this._orderDrawBins[i] as string;
				var bin = this._drawBins[binIndex];

				if(this._dirtyDrawBins[binIndex]) {
					bin.sort((a, b) -> { return (a._drawOrder - b._drawOrder)? (a._drawOrder - b._drawOrder): (a._id - b._id); });
					this._dirtyDrawBins[binIndex] = false;
				}

				bins.push(bin.filter(function(x) {
					if (!x.shape || x._invisible()) {
						return false;
					}

					// update DisplayNode._renderRect here.
					x._calcRenderRect();
					return this.hasIntersection(x._renderRect);
				}));
			}

			context.renderBins(bins);

			this._dirtyRegions = [] : Array.<Array.<number>>;
			if(this.forceRedraw) {
				this._dirtyRegions = [[0, 0, this.width, this.height]];
			}
			return;
		}

		this._ctx.clearRect(0, 0, this.width, this.height);
		
		if (this._dirtyOrderDrawBins) {
			this._orderDrawBins.sort((a, b) -> { return a - b; });
			this._dirtyOrderDrawBins = false;
		}
		for(var i = 0; i < this._orderDrawBins.length; i++) {
			var binIndex = this._orderDrawBins[i] as string;
			var bin = this._drawBins[binIndex];
			if(this._dirtyDrawBins[binIndex]) {
				bin.sort((a, b) -> { return (a._drawOrder - b._drawOrder)? (a._drawOrder - b._drawOrder): (a._id - b._id); });
				this._dirtyDrawBins[binIndex] = false;
			}
			for(var j = 0; j < bin.length; j++) {
				bin[j]._render(context);
			}
		}
		
		//this.root._render(this._ctx);
		this._dirtyRegions = [] : Array.<Array.<number>>;
		if(this.forceRedraw) {
			this._dirtyRegions = [[0, 0, this.width, this.height]];
		}
	}

	function setForceRedraw(forceRedraw: boolean): void {
		this.forceRedraw = forceRedraw;
	}

	function addDirtyRectangle(rectangle: Rect) : void {
		// Add a couple of points (a top-left corner and a bottom-right corner)
		// of the specified rectangle to the list of dirty regions for easier
		// calculation of separation lines. (The following code aligns the given
		// coordinates to 16-pixel boundaries to avoid adding small rectangles.)
		var minX = rectangle.left & ~15;
		var minY = rectangle.top & ~15;
		var maxX = (rectangle.left+ rectangle.width + 15) & ~15;
		var maxY = (rectangle.top + rectangle.height + 15) & ~15;
		minX = Math.max(minX, 0);
		minY = Math.max(minY, 0);
		maxX = Math.min(maxX, this.width);
		maxY = Math.min(maxY, this.height);
		if (this._dirtyRegions.length > 0) {
			var region = this._dirtyRegions[0];
			minX = Math.min(region[0], minX);
			minY = Math.min(region[1], minY);
			maxX = Math.max(region[2], maxX);
			maxY = Math.max(region[3], maxY);
		}
		if (minX < maxX && minY < maxY) {
			this._dirtyRegions = [[minX, minY, maxX, maxY]];
		}
	}

	function hasIntersection(rectangle : Rect): boolean {
		// Use the hyperplane-separation theorem to filter out rectangles that
		// do not have intersections with dirty ones. Even though this code has
		// true-negative cases (i.e. it does not filter out rectangles that do
		// not have intersections with the dirty ones) it is sufficient for
		// this use case.
		var minX, minY, maxX, maxY;

		if (rectangle.width < 0) { // flipped horizontally
			minX = rectangle.left + rectangle.width;
			maxX = rectangle.left;
		} else {
			minX = rectangle.left;
			maxX = rectangle.left + rectangle.width;
		}

		if (rectangle.height < 0) { // flipped vertically
			minY = rectangle.top + rectangle.height;
			maxY = rectangle.top;
		} else {
			minY = rectangle.top;
			maxY = minY + rectangle.height;
		}
		if(maxX < 0 || maxY < 0 || minX > this.width || minY > this.height) {
			return false;
		}
		if(this.forceRedraw) {
			return true;
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

	function setAlpha(alpha: number): void {
		if(this._alpha != alpha) {
			this._alpha = alpha;
			if(!Eye.useStreaming()) {
				this._ctx.globalAlpha = alpha;
			}
		}
	}

	function setCompositeOperation(compositeOperation: string): void {
		if(!compositeOperation) {
			compositeOperation = "source-over";
		}
		if(this._compositeOperation != compositeOperation) {
			this._compositeOperation = compositeOperation;
			if(!Eye.useStreaming()) {
				this._ctx.globalCompositeOperation = compositeOperation;
			}
		}
	}
}
