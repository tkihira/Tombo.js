import "js/web.jsx";
import "util.jsx";
import "Stream.jsx";
import "Eye/Layer.jsx";
import "Tombo.jsx";
import "Eye/Eye.jsx";

/**
 * Rendering context abstraction (HTMLCanvas | Stream)
 */
__export__ abstract class RenderingContext {
	var width: number;
	var height: number;

	abstract function clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;
	abstract function fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void;

	var fillStyle: variant;

	__noexport__ function constructor() {
		var value = "#ffffff";

		Util.defineProperty(this, "fillStyle", {
			get: function(): string {
				return value;
			},
			set: function(v: string): void {
				value = v;

				this._setFillStyle(v);
			},
			enumerable: false
		} : Map.<variant>);
	}

	function constructor(width: number, height: number) {
		this();
		this.width = width;
		this.height = height;
	}

	abstract function _setFillStyle(style: string): void;

	abstract function draw(layer: Layer): void;
	abstract function flush(): void;
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

	override function _setFillStyle(style: string): void {
		this._ctx.fillStyle = style;
	}

	override function draw(layer: Layer): void {
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

	override function flush(): void {
		// nothing has to be done here
	}
}

class StreamRenderingContext extends RenderingContext {
	var _stream: Stream;
	var _fillStyle: string;

	function constructor(width: number, height: number) {
		super(width, height);
	}

	function setStream(stream: Stream): void {
		this._stream = stream;
	}

	override function clearRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		// TODO: rename it to clearRect
		// send Eye.renderBegin message to stream.
		this._stream.beginEyeRender();
	}

	override function fillRect(x : number/*unrestricted double*/, y : number/*unrestricted double*/, w : number/*unrestricted double*/, h : number/*unrestricted double*/) : void {
		// TODO: send fillRect command to stream with fillStyle
	}

	override function _setFillStyle(style: string): void {
		this._fillStyle = style;
	}

	override function draw(layer: Layer): void {
		// TODO
	}

	override function flush(): void {
		this._stream.endEyeRender();
	}
}

// vim: set tabstop=2 shiftwidth=2 noexpandtab:
