import "js.jsx";
import "js/web.jsx";
import "Eye/Layer.jsx";
import "Eye/DisplayNode.jsx";
import "Eye/Eye.jsx";
import "BasicTypes.jsx";
import "Stream.jsx";
import "Tombo.jsx";

/**
 * Rendering context abstraction (HTMLCanvas | Stream)
 */
__export__ abstract class RenderingContext {
	static const USE_NEW_RENDERER = true;

	var width: number;
	var height: number;

	function constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	// Eye
	abstract function beginEye(eye: Eye): void;
	abstract function endEye(): void;

	// Layer
	function renderLayer(layer: Layer): void {
		this._beginLayer(layer);
		if (! this._toSkipRenderLayer(layer)) {
			this._renderLayerInternal(layer);
		}
		this._endLayer(layer);
	}
	abstract function _beginLayer(layer: Layer): void;

	function _toSkipRenderLayer(layer: Layer): boolean {
		// Clean up this layer and return now without saving or restoring
		// the context if it does not have any nodes. (It is better to avoid
		// unnecessary calls for Canvas APIs.)
		if (!layer.root.hasChildren()) {
			this._clearRect(0, 0, layer.width, layer.height);
			layer._clearDirtyRegions();
			return true;
		}
		return false;
	}

	function _renderLayerInternal(layer: Layer): void {
		this._clipDirtyRegions(layer);

		var nodes = layer._collectDisplayNodesToRender(this);
		this._renderDisplayNodes(nodes);

		nodes.forEach((node) -> {
			node._geometryUpdated = false;
			node._hierarchyUpdated = false;
		});

		layer._clearDirtyRegions();
	}

	abstract function _endLayer(layer: Layer): void;

	abstract function _clipDirtyRegions(layer: Layer): void;

	abstract function _clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function _fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function _setFillStyle(style: string): void;

	// DisplayNode
	abstract function _setDisplayNodeColor(node: DisplayNode, color: int): HTMLCanvasElement;
	abstract function _renderDisplayNodes(bin: Array.<DisplayNode>): void;

	function _renderDisplayNode(node: DisplayNode): void {
		if (node._invisible()) {
			return;
		}
		var color = node._getCompositeColor();
		var canvas = this._setDisplayNodeColor(node, color);

		if(RenderingContext.USE_NEW_RENDERER) {
			// We have to draw this object:
			// * when this object is marked as dirty, or;
			// * when this object has an intersection with dirty rectangles.
			// It may take long time to check if an object has an intersection
			// with the dirty rectangles and this code skips checking whether a
			// dirty object has an intersection with the dirty rectangles, which
			// is obviously true.
			if(!node._layer.hasIntersection(node._renderRect)) {
				return;
			}

			this._renderDisplayNode1st(node);
			this._renderDisplayNode2nd(node, canvas, color);
			return;
		}

		var ctx = node._layer._ctx;
		ctx.save();
		var oldOperation = node._compositeOperation? ctx.globalCompositeOperation: "";
		if(node._compositeOperation) {
			ctx.globalCompositeOperation = node._compositeOperation;
		}
		//log ctx.globalCompositeOperation;
		
		
		var matrix = node.getCompositeTransform().getMatrix();
		js.invoke(ctx, "transform", matrix as __noconvert__ variant[]);
		
		if(node._anchorX || node._anchorY) {
			ctx.transform(1, 0, 0, 1, -node._anchorX, -node._anchorY);
		}
		
		ctx.globalAlpha = node._getCompositeAlpha();
		this._drawShape(node, canvas, color);
		
		if(node._compositeOperation) {
			ctx.globalCompositeOperation = oldOperation;
		}
		ctx.restore();
	}

	abstract function _renderDisplayNode1st(node: DisplayNode): void;
	abstract function _renderDisplayNode2nd(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void;
	abstract function _setTransform(transform: Transform, layer: Layer, lastUpdatedFrame: int): void;
	abstract function _beginPaintDisplayNode(node: DisplayNode): void;
	abstract function _endPaintDisplayNode(node: DisplayNode): void;

	// Shape
	abstract function _drawShape(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void ;
}

class CanvasRenderingContext extends RenderingContext {
	var _canvas: HTMLCanvasElement;
	var _ctx: CanvasRenderingContext2D;

	function constructor(width: number, height: number) {
		super(width, height);
		this._canvas = dom.createElement("canvas") as HTMLCanvasElement;
		this._canvas.width  = width;
		this._canvas.height = height;
		this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
	}

	function constructor(canvas: HTMLCanvasElement) {
		super(canvas.width, canvas.height);
		this._canvas = canvas;
		this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
	}

	override function _clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		this._ctx.clearRect(x, y, w, h);
	}

	override function _fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		this._ctx.fillRect(x, y, w, h);
	}

	override function _setFillStyle(style: string): void {
		this._ctx.fillStyle = style;
	}

	override function _beginLayer(layer: Layer): void {
		if(!layer._canvas) {
			Tombo.warn("[Layer#render] Layer's canvas is not created");
			layer._modifyCanvas();
		}
	}

	override function _toSkipRenderLayer(layer: Layer): boolean {
		if(RenderingContext.USE_NEW_RENDERER) {
			// Erase the region covered by the dirty rectangles and redraw
			// objects that have intersections with the rectangles.
			if(layer._dirtyRegions.length == 0) {
				return true;
			}
			return super._toSkipRenderLayer(layer);
		}
		return false;
	}

	override function _renderLayerInternal(layer: Layer): void {
		if(RenderingContext.USE_NEW_RENDERER) {
			super._renderLayerInternal(layer);
			return;
		}

		/* TODO for !USE_NEW_RENDERER
		layer._ctx.clearRect(0, 0, layer.width, layer.height);
		
		if (layer._dirtyOrderDrawBins) {
			layer._orderDrawBins.sort((a, b) -> { return a - b; });
			layer._dirtyOrderDrawBins = false;
		}
		for(var i = 0; i < layer._orderDrawBins.length; i++) {
			var binIndex = layer._orderDrawBins[i] as string;
			var bin = layer._drawBins[binIndex];
			if(layer._dirtyDrawBins[binIndex]) {
				bin.sort((a, b) -> { return (a._drawOrder - b._drawOrder)? (a._drawOrder - b._drawOrder): (a._id - b._id); });
				layer._dirtyDrawBins[binIndex] = false;
			}
			for(var j = 0; j < bin.length; j++) {
				this._renderDisplayNode(bin[j]);
			}
		}
		
		//layer.root._render(layer._ctx);
		layer._dirtyRegions = [] : Array.<Array.<number>>;
		if(layer.forceRedraw) {
			layer._dirtyRegions = [[layer.left, layer.top, layer.left+layer.width, layer.top+layer.height]];
		}
		*/
	}

	override function _endLayer(layer: Layer): void {
		layer._ctx.restore();

		// check layout and set proper transform
		var width = layer.layout.clientWidth;
		var height = layer.layout.clientHeight;
		if(!width || !height) {
			Tombo.error("[Eye#render] layoutInformation.clientWidth/Height is not initialized");
		}

		// draw
		var transform = Eye._calculateLayoutTransform(this.width, this.height, layer);
		this._ctx.globalCompositeOperation = layer.layout.compositeOperation;
		this._ctx.drawImage(layer._canvas, transform.left, transform.top);
	}

	override function beginEye(eye: Eye): void {
		this._clearRect(0, 0, eye._width, eye._height - 1);
	}

	override function endEye(): void {
		// nothing has to be done here
	}

	override function _renderDisplayNodes(bin: Array.<DisplayNode>): void {
		bin.forEach(function(node) {
			this._renderDisplayNode(node);
		});
	}

	override function _clipDirtyRegions(layer: Layer): void {
		layer._ctx.save();
		layer._ctx.beginPath();

		var length = layer._dirtyRegions.length;
		for(var i = 0; i < length; ++i) {
			var region = layer._dirtyRegions[i];
			var x = region[0];
			var y  = region[1];
			var width = region[2] - x;
			var height = region[3] - y;

			layer._ctx.clearRect(x, y, width, height);
			layer._ctx.rect(x, y, width, height);
		}

		layer._ctx.clip();
	}

	override function _setDisplayNodeColor(node: DisplayNode, color: int): HTMLCanvasElement {
		if(!node.shape.isImage || color == Color.createRGB(255, 255, 255)) {
			return null;
		}

		// TODO: caching
		var width = node.shape.bounds.width;
		var height = node.shape.bounds.height;

		var canvas = dom.createElement("canvas") as __noconvert__ HTMLCanvasElement;
		canvas.width = width;
		canvas.height = height;
		var cctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		node.shape.draw(cctx, color);

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

		return oc;
	}

	override function _renderDisplayNode1st(node: DisplayNode): void {
		if(node._dirty) {
			node._calcRenderRect();
		}
	}

	override function _setTransform(transform: Transform, layer: Layer, lastUpdatedFrame: int): void {
		// TODO(hbono): Is it faster to cache the current transform?
		var matrix = transform.getMatrix();
		js.invoke(layer._ctx, "setTransform", matrix as __noconvert__ variant[]);
	}

	override function _beginPaintDisplayNode(node: DisplayNode): void {
		var context = node._layer._ctx;

		if(DisplayNode.USE_RENDER_TRANSFORM) {
			node._layer.setCompositeOperation(node._compositeOperation);
			node._layer.setAlpha(node._getCompositeAlpha());
			this._setTransform(node._getRenderTransform(), node._layer, node._lastChangedFrame);
			return;
		}

		context.save();
		node._oldOperation = node._compositeOperation? context.globalCompositeOperation: "";
		if(node._compositeOperation) {
			context.globalCompositeOperation = node._compositeOperation;
		}
		var matrix = node.getCompositeTransform().getMatrix();
		js.invoke(context, "transform", matrix as __noconvert__ variant[]);
		if(node._anchorX || node._anchorY) {
			context.transform(1, 0, 0, 1, -node._anchorX, -node._anchorY);
		}
		context.globalAlpha = node._getCompositeAlpha();
	}

	override function _endPaintDisplayNode(node: DisplayNode): void {
		if(DisplayNode.USE_RENDER_TRANSFORM) {
			return;
		}

		var context = node._layer._ctx;
		if(node._compositeOperation) {
			context.globalCompositeOperation = node._oldOperation;
		}
		context.restore();
	}

	override function _renderDisplayNode2nd(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
		node._dirty = false;
		this._beginPaintDisplayNode(node);
		this._drawShape(node, canvas, color);
		this._endPaintDisplayNode(node);
	}

	override function _drawShape(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
		var ctx = node._layer._ctx;
		if(canvas) {
			ctx.drawImage(canvas, 0, 0);
		} else {
			node.shape.draw(ctx, color);
		}
	}
}

class StreamRenderingContext extends RenderingContext {
	var _stream: Stream;
	var _fillStyle: string; // FIXME: not used

	function constructor(width: number, height: number) {
		super(width, height);
	}

	function setStream(stream: Stream): void {
		this._stream = stream;
	}

	override function beginEye(eye: Eye): void {
		this._stream.beginEyeRender();
	}

	override function endEye(): void {
		this._stream.endEyeRender();
	}

	override function _beginLayer(layer: Layer): void {
		if (layer.layout.scale != 1) {
			this._stream.sendLayerInfo(layer._id, layer.width, layer.height, layer._alpha, layer._compositeOperation, layer.layout.layoutMode, layer.layout.scale);
		} else {
			this._stream.sendLayerInfo(layer._id, layer._viewport.width, layer._viewport.height, layer._alpha, layer._compositeOperation, layer.layout.layoutMode, layer.layout.scale);
		}
	}

	override function _endLayer(layer: Layer): void {
		this._stream.endLayer(layer._id);
	}

	override function _clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		// TODO or no need to do clearRect for stream
	}

	override function _fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		// TODO: send fillRect command to stream with fillStyle
	}

	override function _setFillStyle(style: string): void {
		this._fillStyle = style;
	}

	function _sendDisplayNodeIds(bin: Array.<DisplayNode>): void {
		var ids = bin.map(function(node) {
			return node._id as int;
		}) as Array.<int>;

		this._stream.sendDisplayNodeIds(ids);
	}

	function _sendTransformAndShape(node: DisplayNode): void {
		if (node._invisible() || !node._layer.hasIntersection(node._renderRect)) {
			return;
		}
		node._dirty = false;
		this._beginPaintDisplayNode(node);
		this._drawShape(node, null, -1);
		node.shape.dirty = false;
		this._endPaintDisplayNode(node);
	}


	override function _renderDisplayNodes(bin: Array.<DisplayNode>): void {
		this._sendDisplayNodeIds(bin);

		bin.forEach(function(node) {
			this._renderDisplayNode(node);
		});

		bin.forEach(function(node) {
			this._sendTransformAndShape(node);
		});
	}

	override function _clipDirtyRegions(layer: Layer): void {
		// do nothing for stream
	}

	override function _setDisplayNodeColor(node: DisplayNode, color: int): HTMLCanvasElement {
		// this._json.push("transcolor:TODO");
		return null;
	}

	override function _renderDisplayNode1st(node: DisplayNode): void {
		this._stream.sendDisplayNode(node);
	}

	override function _renderDisplayNode2nd(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
	}

	override function _setTransform(transform: Transform, layer: Layer, lastUpdatedFrame: int): void {
		// TODO(hbono): Is it faster to cache the current transform?
		var matrix = transform.getMatrix();
		this._stream.sendSetTransform(layer._id, lastUpdatedFrame, matrix[0] * layer.layout.scale, matrix[1] * layer.layout.scale, matrix[2] * layer.layout.scale, matrix[3] * layer.layout.scale, matrix[4] * layer.layout.scale, matrix[5] * layer.layout.scale);
	}

	override function _beginPaintDisplayNode(node: DisplayNode): void {
		if(DisplayNode.USE_RENDER_TRANSFORM) {
			var matrix = node._getRenderTransform().getMatrix();
			var left = matrix[4] - node._layer._viewport.left;
			var top  = matrix[5] - node._layer._viewport.top;
			var translated = new Transform([matrix[0], matrix[1], matrix[2], matrix[3], left, top]);
			this._setTransform(translated, node._layer, node._lastChangedFrame);
			return;
		}

		this._stream.sendSave(node._layer._id);
		if(node._compositeOperation) {
			this._stream.sendCompositeOperation(node._layer._id, node._compositeOperation);
		}
		var matrix = node.getCompositeTransform().getMatrix();

		this._stream.sendMatrix(node._layer._id, matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
		if(node._anchorX || node._anchorY) {
			this._stream.sendMatrix(node._layer._id, 1, 0, 0, 1, -node._anchorX, -node._anchorY);
		}
		this._stream.sendAlpha(node._layer._id, node._getCompositeAlpha());
	}

	override function _endPaintDisplayNode(node: DisplayNode): void {
		if(DisplayNode.USE_RENDER_TRANSFORM) {
			return;
		}

		if(node._compositeOperation) {
			this._stream.sendCompositeOperation(node._layer._id, node._compositeOperation);
		}

		this._stream.sendRestore(node._layer._id);
	}

	override function _drawShape(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
		this._stream.sendShape(node._layer._id, node._id, node.shape);
	}
}

// vim: set tabstop=2 shiftwidth=2 noexpandtab:
