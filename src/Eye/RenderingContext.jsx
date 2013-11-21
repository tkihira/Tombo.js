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
	abstract function beginLayer(layer: Layer): void;
	abstract function endLayer(layer: Layer): void;
	abstract function clipDirtyRegions(layer: Layer): void;

	abstract function clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function setFillStyle(style: string): void;

	// DisplayNode
	abstract function setDisplayNodeColor(node: DisplayNode, color: int): HTMLCanvasElement;
	abstract function renderBins(bins: Array.<Array.<DisplayNode>>): void;
	abstract function renderDisplayNode1st(node: DisplayNode): void;
	abstract function renderDisplayNode2nd(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void;
	abstract function setTransform(transform: Transform, layer: Layer, lastUpdatedFrame: int): void;
	abstract function _beginPaintDisplayNode(node: DisplayNode): void;
	abstract function _endPaintDisplayNode(node: DisplayNode): void;

	// Shape
	abstract function drawShape(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void ;
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

	override function clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		this._ctx.clearRect(x, y, w, h);
	}

	override function fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		this._ctx.fillRect(x, y, w, h);
	}

	override function setFillStyle(style: string): void {
		this._ctx.fillStyle = style;
	}

	override function beginLayer(layer: Layer): void {
		if(!layer._canvas) {
			Tombo.warn("[Layer#render] Layer's canvas is not created");
			layer._modifyCanvas();
		}
	}

	override function endLayer(layer: Layer): void {
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
		this.clearRect(0, 0, eye._width, eye._height - 1);
	}

	override function endEye(): void {
		// nothing has to be done here
	}

	override function renderBins(bins: Array.<Array.<DisplayNode>>): void {
		bins.forEach(function(bin) {
			for(var j = 0; j < bin.length; j++) {
				bin[j]._render(this);
			}
		});
	}

	override function clipDirtyRegions(layer: Layer): void {
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

	override function setDisplayNodeColor(node: DisplayNode, color: int): HTMLCanvasElement {
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

	override function renderDisplayNode1st(node: DisplayNode): void {
		if(node._dirty) {
			node._calcRenderRect();
		}
	}

	override function setTransform(transform: Transform, layer: Layer, lastUpdatedFrame: int): void {
		// TODO(hbono): Is it faster to cache the current transform?
		var matrix = transform.getMatrix();
		js.invoke(layer._ctx, "setTransform", matrix as __noconvert__ variant[]);
	}

	override function _beginPaintDisplayNode(node: DisplayNode): void {
		var context = node._layer._ctx;

		if(DisplayNode.USE_RENDER_TRANSFORM) {
			node._layer.setCompositeOperation(node._compositeOperation);
			node._layer.setAlpha(node._getCompositeAlpha());
			this.setTransform(node._getRenderTransform(), node._layer, node._lastChangedFrame);
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

	override function renderDisplayNode2nd(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
		node._dirty = false;
		this._beginPaintDisplayNode(node);
		this.drawShape(node, canvas, color);
		this._endPaintDisplayNode(node);
	}

	override function drawShape(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
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

	override function beginLayer(layer: Layer): void {
		this._stream.sendLayerInfo(layer._id, layer.width, layer.height, layer._alpha, layer._compositeOperation, layer.layout.layoutMode, layer.layout.scale);
	}

	override function endLayer(layer: Layer): void {
		this._stream.endLayer(layer._id);
	}

	override function clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		// TODO or no need to do clearRect for stream
	}

	override function fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		// TODO: send fillRect command to stream with fillStyle
	}

	override function setFillStyle(style: string): void {
		this._fillStyle = style;
	}

	function _sendDisplayNodeIds(bins: Array.<Array.<DisplayNode>>): void {
		var ids = []: Array.<int>;

		bins.forEach(function(bin) {
			ids = ids.concat(bin.map(function(x): int {
				return x._id;
			}));
		});

		this._stream.sendDisplayNodeIds(ids);
	}

	function _sendTransformAndShape(node: DisplayNode): void {
		if (node._invisible() || !node._layer.hasIntersection(node._renderRect)) {
			return;
		}
		node._dirty = false;
		this._beginPaintDisplayNode(node);
		this.drawShape(node, null, -1);
		node.shape.dirty = false;
		this._endPaintDisplayNode(node);
	}


	override function renderBins(bins: Array.<Array.<DisplayNode>>): void {
		this._sendDisplayNodeIds(bins);

		bins.forEach(function(bin) {
			for(var j = 0; j < bin.length; j++) {
				bin[j]._render(this);
			}
		});

		bins.forEach(function(bin) {
			for(var j = 0; j < bin.length; j++) {
				this._sendTransformAndShape(bin[j]);
			}
		});
	}

	override function clipDirtyRegions(layer: Layer): void {
		// do nothing for stream
	}

	override function setDisplayNodeColor(node: DisplayNode, color: int): HTMLCanvasElement {
		// this._json.push("transcolor:TODO");
		return null;
	}

	override function renderDisplayNode1st(node: DisplayNode): void {
		this._stream.sendDisplayNode(node);
	}

	override function renderDisplayNode2nd(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
	}

	override function setTransform(transform: Transform, layer: Layer, lastUpdatedFrame: int): void {
		// TODO(hbono): Is it faster to cache the current transform?
		var matrix = transform.getMatrix();
		this._stream.sendSetTransform(layer._id, lastUpdatedFrame, matrix[0] * layer.layout.scale, matrix[1] * layer.layout.scale, matrix[2] * layer.layout.scale, matrix[3] * layer.layout.scale, matrix[4] * layer.layout.scale, matrix[5] * layer.layout.scale);
	}

	override function _beginPaintDisplayNode(node: DisplayNode): void {
		if(DisplayNode.USE_RENDER_TRANSFORM) {
			this.setTransform(node._getRenderTransform(), node._layer, node._lastChangedFrame);
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

	override function drawShape(node: DisplayNode, canvas: HTMLCanvasElement, color: int): void {
		this._stream.sendShape(node._layer._id, node._id, node.shape);
	}
}

// vim: set tabstop=2 shiftwidth=2 noexpandtab:
