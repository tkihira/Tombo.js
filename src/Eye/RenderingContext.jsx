import "js/web.jsx";
import "Stream.jsx";
import "Eye/Layer.jsx";
import "Eye/DisplayNode.jsx";
import "Tombo.jsx";
import "Eye/Eye.jsx";

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
	abstract function renderBins(layer: Layer, bins: Array.<Array.<DisplayNode>>): void;
	abstract function clipDirtyRegions(layer: Layer): void;

	abstract function clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function setFillStyle(style: string): void;
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

	override function renderBins(layer: Layer, bins: Array.<Array.<DisplayNode>>): void {
		bins.forEach(function(bin) {
			for(var j = 0; j < bin.length; j++) {
				bin[j]._render(layer._ctx, null);
			}
		});
		layer._ctx.restore();
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

	override function renderBins(layer: Layer, bins: Array.<Array.<DisplayNode>>): void {
		this._sendDisplayNodeIds(bins);

		bins.forEach(function(bin) {
			for(var j = 0; j < bin.length; j++) {
				bin[j]._render(layer._ctx, this._stream);
			}
		});

		bins.forEach(function(bin) {
			for(var j = 0; j < bin.length; j++) {
				bin[j]._sendTransformAndShape(layer._ctx, this._stream);
			}
		});
	}

	override function clipDirtyRegions(layer: Layer): void {
		// do nothing for stream
	}
}

// vim: set tabstop=2 shiftwidth=2 noexpandtab:
