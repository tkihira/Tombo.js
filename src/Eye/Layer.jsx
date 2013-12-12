import "js/web.jsx";
import "js.jsx";

import "LayoutInformation.jsx";
import "DisplayNode.jsx";
import "DisplayGroup.jsx";
import "Eye.jsx";
import "RenderingContext.jsx";
import "../Tombo.jsx";
import "../BasicTypes.jsx";

class SubLayer {
	var _id: int;
	static var s_count = 0 as int;

	var bound: Rect;

	var _drawBins = {}: Map.<Array.<DisplayNode>>;
	var _orderDrawBins = []: Array.<int>;
	var _dirtyDrawBins = {}: Map.<boolean>;
	var _dirtyOrderDrawBins = false;

	function constructor(bound: Rect) {
		this.bound = bound;
		this._id = SubLayer.s_count++;
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
		assert !node._subLayer;
		node._subLayer = this;
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
		this._dirtyDrawBin(node);
	}

	function _dirtyDrawBin(node: DisplayNode): void {
		this._dirtyDrawBins[node._drawBin as string] = true;
	}

	function _removeNodeFromBin(node: DisplayNode, index: string): void {
		var bin = this._drawBins[index];
		assert bin;
		for(var i = 0; i < bin.length; i++) {
			if(bin[i] == node) {
				bin.splice(i, 1);
				node._subLayer = null;
				// no need to set dirty flag because it's not affected to drawing order by removing an item
				return;
			}
		}
		assert false; // should not come here
	}

	function _collect(context: RenderingContext, layer: Layer): Array.<DisplayNode> {
		if (this._dirtyOrderDrawBins) {
			this._orderDrawBins.sort((a, b) -> { return a - b; });
			this._dirtyOrderDrawBins = false;
		}

		var bins = []: Array.<DisplayNode>;

		// var early = 0;
		// var calced = 0;
		// var skipped = 0;
		// var total = 0 ;

		for(var i = 0; i < this._orderDrawBins.length; i++) {
			var binIndex = this._orderDrawBins[i] as string;
			var bin = this._drawBins[binIndex];

			if(this._dirtyDrawBins[binIndex]) {
				bin.sort((a, b) -> { return (a._drawOrder - b._drawOrder)? (a._drawOrder - b._drawOrder): (a._id - b._id); });
				this._dirtyDrawBins[binIndex] = false;
			}
			// total += bin.length;

			bin.forEach((x) -> {
				if (!x.shape || x._invisible()) {
					// early++;
					return;
				}

				// update DisplayNode._renderRect here.
				if (x._hierarchyUpdated || x.isGeometryUpdated() || !x._renderRect) {
					// calced++;
					x._calcRenderRect();
				// } else {
					// skipped++;
				}

				if (layer.hasIntersection(x._renderRect)) {
					bins.push(x);
				}
			});
		}

		// log 'SL[' + this._id + '] early, calced, skipped, pushed, total: ' + [early, calced, skipped, bins.length, total].join(' ');
		return bins;
	}

	function intersected(layer: Layer): boolean {
		var right  = this.bound.left + this.bound.width;
		var bottom = this.bound.top + this.bound.height;
		// log [right, bottom, this.bound.join(), layer.left, layer.top, layer.width, layer.height].join(' ');
		if (layer._viewport.left > right) {
			// log 'not intersected because right';
			return false;
		}
		if (layer._viewport.top > bottom ) {
			// log 'not intersected because bottom';
			return false;
		}
		if (layer._viewport.left + layer.width < this.bound.left) {
			// log 'not intersected because left';
			return false;
		}
		if (layer._viewport.top + layer.height < this.bound.top) {
			// log 'not intersected because top';
			return false;
		}
		return true;
	}

	function setViewportOffset(left: number, top: number): void {
		this.bound.left = left;
		this.bound.top = top;
	}

	function _onEndAllClients(): void {
		for (var iii in this._drawBins) {
			this._drawBins[iii].forEach((node) -> {
				node._geometryUpdated = false;
				node._hierarchyUpdated = false;
			});
		}
	}
}

/**
 * Layer class
 * 
 * <p>Each layer has one internal on-memory canvas, but you don't need to care the canvas.
 * Layer's stage size is virtual, and the actual canvas's size is determined when the layer is appended.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class Layer {
	var _subLayers = []: Array.<Array.<SubLayer>>;
	var _subX = 1 as int;
	var _subY = 1 as int;
	/**
	 * The whole space where all DisplayNodes exist. It can be larger than a layer size itself.
	 * It can be null if the size of the Eye is equal to the world.
	 */
	var _worldWidth: number;
	var _worldHeight: number;

	var _canvas: HTMLCanvasElement;
	var _ctx: CanvasRenderingContext2D;
	var _eye: Eye;
	
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
	 * for Viewport clipping
	 */
	 var _viewport: Rect;

	/**
	 * READONLY: redraw all nodes
	 */
	var forceRedraw = true;
	
	static var _counter = 0;
	var _id: number;
	var _isChild = false;
	var _touchableNodeList = []: DisplayNode[];
	
	var _dirtyRegions : Array.<Array.<number>>;
	
	var _alpha: number;
	var _compositeOperation: string;

	/**
	 * create new layer with the stage size (width, height) and default layout (CENTER and AUTO_SCALE)
	 */
	function constructor(width: number, height: number, id: number = -1, worldWidth: number = -1, worldHeight: number = -1, eye: Eye = null) {
		this(width, height, new LayoutInformation(), id, worldWidth, worldHeight, eye);
	}
	/**
	 * create new layer with the stage size (width, height) and layout information
	 */
	function constructor(width: number, height: number, layout: LayoutInformation, id: number = -1, worldWidth: number = -1, worldHeight: number = -1, eye: Eye = null) {
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

		if (worldWidth > 0 && worldHeight > 0 && eye) {
			this._subX = Math.ceil(worldWidth / eye._width);
			this._subY = Math.ceil(worldHeight / eye._height);

			// FIXME: the size of SubLayer at the boundary (subX, subY) might be too large.
			for (var i=0; i<this._subY; i++) {
				this._subLayers.push(new Array.<SubLayer>);
				for (var j=0; j<this._subX; j++) {
					this._subLayers[i].push(new SubLayer(new Rect(eye._width*j, eye._height*i, eye._width, eye._height)));
				}
			}
		} else {
			this._subLayers.push(new Array.<SubLayer>);
			this._subLayers[0].push(new SubLayer(new Rect(0, 0, width, height)));
		}

		// FIXME: better to use clientRect maybe
		this._viewport = eye ? new Rect(0, 0, eye._width, eye._height) : new Rect(0, 0, width, height);

		this.root._setLayer(this);
		
		if(layout.layoutMode & LayoutInformation.FIXED_SCALE) {
			// create canvas now
			this._modifyCanvas();
		}
		this._dirtyRegions = [] : Array.<Array.<number>>;
		if(this.forceRedraw) {
			this._dirtyRegions = [[this._viewport.left, this._viewport.top, this._viewport.left+this.width, this._viewport.top+this.height]];
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
	function _addNodeToBin(node: DisplayNode): void {
		var sl = this._subLayerForNode(node);
		sl._addNodeToBin(node);
	}
	function _removeNode(node: DisplayNode): void {
		this._removeNodeFromBin(node, node._drawBin as string);
	}
	function _removeNodeFromBin(node: DisplayNode, index: string): void {
		node._subLayer._removeNodeFromBin(node, index);
	}
	function _moveDrawBin(node: DisplayNode, oldBin: int): void {
		// move node from oldBin to node._drawBin
		this._removeNodeFromBin(node, oldBin as string);
		this._addNodeToBin(node);
	}
	function _dirtyDrawBin(node: DisplayNode): void {
		var sl = this._subLayerForNode(node);
		sl._dirtyDrawBin(node);
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
			var anchoredTransform = transform;
			if(node._anchorX != 0 || node._anchorY != 0) {
				anchoredTransform = Transform.mul(transform, new Transform(-node._anchorX, -node._anchorY));
			}
			//log node.clientRect.left, node.clientRect.top, node.clientRect.width, node.clientRect.height, x, y;
			if(clientRect && anchoredTransform.transformRect(clientRect).isInside(x, y)) {
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

	function _collectDisplayNodesToRender(context: RenderingContext): Array.<DisplayNode> {
		var bins = []: Array.<DisplayNode>;

		var xx = Math.floor(this._viewport.left / this._viewport.width);
		var yy = Math.floor(this._viewport.top / this._viewport.height);

		for (var i=-1; i<=1; i++) {
			if (yy + i < 0 || yy + i >= this._subY) {
				continue;
			}
			for (var j=-1; j<=1; j++) {
				if (xx + j < 0 || xx + j >= this._subX) {
					continue;
				}
				// TODO: we could omit 4 sublayers ([0,0], [0,1], [1,0], [1,1])
				// if (this._subLayers[yy+i][xx+j].intersected(this)) {
					bins = bins.concat(this._subLayers[yy+i][xx+j]._collect(context, this));
				// }
			}
		}

		return bins;
	}

	function _clearDirtyRegions(): void {
		this._dirtyRegions = [] : Array.<Array.<number>>;
		if(this.forceRedraw) {
			this._dirtyRegions = [[this._viewport.left, this._viewport.top, this._viewport.left+this._viewport.width, this._viewport.top+this._viewport.height]];
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
		if(maxX < this._viewport.left || maxY < this._viewport.top || minX > this._viewport.left+this.width || minY > this._viewport.top+this.height) {
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

	function setViewportOffset(left: number, top: number): void {
		this._viewport.left = left;
		this._viewport.top = top;
	}

	function _onEndAllClients(): void {
		this._subLayers.forEach((asl) -> {
			asl.forEach((sl) -> {
				sl._onEndAllClients();
			});
		});
	}

	function _subLayerForPosition(left: number, top: number): SubLayer {
		if (this._worldWidth < 0) {
			return this._subLayers[0][0];
		}

		left = Math.max(left, 0);
		top = Math.max(top, 0);

		var x = Math.min(Math.floor(left / this._viewport.width), this._subX-1);
		var y = Math.min(Math.floor(top / this._viewport.height), this._subY-1);
		return this._subLayers[y][x];
	}

	function _subLayerForNode(node: DisplayNode): SubLayer {
		if (this._worldWidth < 0) {
			return this._subLayers[0][0];
		}

		var left = node._transform.left;
		var top = node._transform.top;
		return this._subLayerForPosition(left, top);
	}

	function _updateSubLayer(node: DisplayNode): void {
		var transform = node.getCompositeTransform();
		// log 'DisplayNode[' + node._id + '] updatingSubLayers from ' + node._subLayer._id + ' transform=' + [transform.left, transform.top].join(' ');

		var slp = this._subLayerForPosition(transform.left, transform.top);
		if (slp != node._subLayer) {
			// log 'moving node ' + node._id + ' from ' + node._subLayer._id + ' to ' + slp._id;
			node._subLayer._removeNodeFromBin(node, node._drawBin as string);
			slp._addNodeToBin(node);

			if (node.shape == null) {
				var dg = node as DisplayGroup;
				dg._children.forEach((child) -> {
					this._updateSubLayer(child);
				});
			}
		}
	}
}
