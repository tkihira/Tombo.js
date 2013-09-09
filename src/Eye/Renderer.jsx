import 'js/web.jsx';
import "js.jsx";

import "../BasicTypes.jsx";
import "../Tombo.jsx";

// An interface that provides functions used by DisplayNode objects to render
// their shapes.
interface RenderLayer {
	function save(): void;
	function restore(): void;
	function beginPath(): void;
	function rect(x: number, y: number, width: number, height: number): void;
	function clearRect(x: number, y: number, width: number, height: number): void;
	function clip(): void;
	function fillRect(x: number, y: number, width: number, height: number, color: number): void;
	function drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void;
	function drawPartialImage(image: HTMLImageElement,
                              srcX: number, srcY: number, srcWidth: number, srcHeight: number,
                              x: number, y: number, width: number, height: number): void;
	function setAlpha(alpha: number): void;
	function setCompositeOperation(compositeOperation: string): void;
	function setTransform(transform: Transform): void;
	function beginPaint(): void;
	function endPaint(): void;
	function paint(context: CanvasRenderingContext2D, compositeOperation: string, left: number, top: number): void;
}

// A class that implements the RenderLayer interface with the Canvas 2D API.
class CanvasRenderLayer implements RenderLayer {
	var _canvas: HTMLCanvasElement;
	var _context: CanvasRenderingContext2D;
	var _width: number;
	var _height: number;
	var _alpha: number;
	var _compositeOperation: string;

	function constructor(canvas: HTMLCanvasElement, width: number, height: number, scale: number) {
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext("2d") as CanvasRenderingContext2D;
		context.setTransform(scale, 0, 0, scale,0, 0);
		this._canvas = canvas;
		this._context = context;
		this._width = width;
		this._height = height;
		this._alpha = 1;
		this._compositeOperation = "source-over";
	}

	override function save(): void {
		this._context.save();
	}

	override function restore(): void {
		this._context.restore();
	}

	override function beginPath(): void {
		this._context.beginPath();
	}

	override function rect(x: number, y: number, width: number, height: number): void {
		this._context.rect(x, y, width, height);
	}

	override function clearRect(x: number, y: number, width: number, height: number): void {
		this._context.clearRect(x, y, width, height);
	}

	override function clip(): void {
		this._context.clip();
	}

	override function fillRect(x: number, y: number, width: number, height: number, color: number): void {
		this._context.fillStyle = Color.stringify(color);
		this._context.fillRect(x, y, width, height);
	}

	override function drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
		this._context.drawImage(image, x, y, width, height);
	}

	override function drawPartialImage(image: HTMLImageElement,
                                       srcX: number, srcY: number, srcWidth: number, srcHeight: number,
                                       x: number, y: number, width: number, height: number): void {
		this._context.drawImage(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
	}

	override function setAlpha(alpha: number): void {
		if(this._alpha != alpha) {
			this._alpha = alpha;
			this._context.globalAlpha = alpha;
		}
	}

	override function setCompositeOperation(compositeOperation: string): void {
		if(!compositeOperation) {
			compositeOperation = "source-over";
		}
		if(this._compositeOperation != compositeOperation) {
			this._compositeOperation = compositeOperation;
			this._context.globalCompositeOperation = compositeOperation;
		}
	}

	override function setTransform(transform: Transform): void {
		var matrix = transform.getMatrix();
		js.invoke(this._context, "setTransform", matrix as __noconvert__ variant[]);
	}

	override function beginPaint(): void {
	}

	override function endPaint(): void {
	}

	override function paint(context: CanvasRenderingContext2D, compositeOperation: string, left: number, top: number): void {
		context.globalCompositeOperation = compositeOperation;
		context.drawImage(this._canvas, left, top);
	}
}

class WebGL {
	/* ClearBufferMask */
	static const DEPTH_BUFFER_BIT = 0x00000100;
	static const STENCIL_BUFFER_BIT = 0x00000400;
	static const COLOR_BUFFER_BIT = 0x00004000;

	/* BeginMode */
	static const POINTS = 0x0000;
	static const LINES = 0x0001;
	static const LINE_LOOP = 0x0002;
	static const LINE_STRIP = 0x0003;
	static const TRIANGLES = 0x0004;
	static const TRIANGLE_STRIP = 0x0005;
	static const TRIANGLE_FAN = 0x0006;

	/* BlendingFactor */
	static const ZERO = 0;
	static const ONE = 1;
	static const SRC_COLOR = 0x0300;
	static const ONE_MINUS_SRC_COLOR = 0x0301;
	static const SRC_ALPHA = 0x0302;
	static const ONE_MINUS_SRC_ALPHA = 0x0303;
	static const DST_ALPHA = 0x0304;
	static const ONE_MINUS_DST_ALPHA = 0x0305;
	static const DST_COLOR = 0x0306;
	static const ONE_MINUS_DST_COLOR = 0x0307;
	static const SRC_ALPHA_SATURATE = 0x0308;

	/* BlendEquationSeparate */
	static const FUNC_ADD = 0x8006;
	static const BLEND_EQUATION = 0x8009;
	static const BLEND_EQUATION_RGB = 0x8009;  /* same as BLEND_EQUATION */
	static const BLEND_EQUATION_ALPHA = 0x883D;

	/* BlendSubtract */
	static const FUNC_SUBTRACT = 0x800A;
	static const FUNC_REVERSE_SUBTRACT = 0x800B;
    
	/* Separate Blend Functions */
	static const BLEND_DST_RGB = 0x80C8;
	static const BLEND_SRC_RGB = 0x80C9;
	static const BLEND_DST_ALPHA = 0x80CA;
	static const BLEND_SRC_ALPHA = 0x80CB;
	static const CONSTANT_COLOR = 0x8001;
	static const ONE_MINUS_CONSTANT_COLOR = 0x8002;
	static const CONSTANT_ALPHA = 0x8003;
	static const ONE_MINUS_CONSTANT_ALPHA = 0x8004;
	static const BLEND_COLOR = 0x8005;

	/* Buffer Objects */
	static const ARRAY_BUFFER = 0x8892;
	static const ELEMENT_ARRAY_BUFFER = 0x8893;
	static const ARRAY_BUFFER_BINDING = 0x8894;
	static const ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

	static const STREAM_DRAW = 0x88E0;
	static const STATIC_DRAW = 0x88E4;
	static const DYNAMIC_DRAW = 0x88E8;

	static const BUFFER_SIZE = 0x8764;
	static const BUFFER_USAGE = 0x8765;

	static const CURRENT_VERTEX_ATTRIB = 0x8626;

	/* CullFaceMode */
	static const FRONT = 0x0404;
	static const BACK = 0x0405;
	static const FRONT_AND_BACK = 0x0408;

	/* DepthFunction */
	/* static const NEVER = 0x0200; */
	/* static const LESS = 0x0201; */
	/* static const EQUAL = 0x0202; */
	/* static const LEQUAL = 0x0203; */
	/* static const GREATER = 0x0204; */
	/* static const NOTEQUAL = 0x0205; */
	/* static const GEQUAL = 0x0206; */
	/* static const ALWAYS = 0x0207; */

	/* EnableCap */
	/* static const TEXTURE_2D = 0x0DE1; */
	static const CULL_FACE = 0x0B44;
	static const BLEND = 0x0BE2;
	static const DITHER = 0x0BD0;
	static const STENCIL_TEST = 0x0B90;
	static const DEPTH_TEST = 0x0B71;
	static const SCISSOR_TEST = 0x0C11;
	static const POLYGON_OFFSET_FILL = 0x8037;
	static const SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
	static const SAMPLE_COVERAGE = 0x80A0;

	/* ErrorCode */
	static const NO_ERROR = 0;
	static const INVALID_ENUM = 0x0500;
	static const INVALID_VALUE = 0x0501;
	static const INVALID_OPERATION = 0x0502;
	static const OUT_OF_MEMORY = 0x0505;

	/* FrontFaceDirection */
	static const CW = 0x0900;
	static const CCW = 0x0901;

	/* GetPName */
	static const LINE_WIDTH = 0x0B21;
	static const ALIASED_POINT_SIZE_RANGE = 0x846D;
	static const ALIASED_LINE_WIDTH_RANGE = 0x846E;
	static const CULL_FACE_MODE = 0x0B45;
	static const FRONT_FACE = 0x0B46;
	static const DEPTH_RANGE = 0x0B70;
	static const DEPTH_WRITEMASK = 0x0B72;
	static const DEPTH_CLEAR_VALUE = 0x0B73;
	static const DEPTH_FUNC = 0x0B74;
	static const STENCIL_CLEAR_VALUE = 0x0B91;
	static const STENCIL_FUNC = 0x0B92;
	static const STENCIL_FAIL = 0x0B94;
	static const STENCIL_PASS_DEPTH_FAIL = 0x0B95;
	static const STENCIL_PASS_DEPTH_PASS = 0x0B96;
	static const STENCIL_REF = 0x0B97;
	static const STENCIL_VALUE_MASK = 0x0B93;
	static const STENCIL_WRITEMASK = 0x0B98;
	static const STENCIL_BACK_FUNC = 0x8800;
	static const STENCIL_BACK_FAIL = 0x8801;
	static const STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
	static const STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
	static const STENCIL_BACK_REF = 0x8CA3;
	static const STENCIL_BACK_VALUE_MASK = 0x8CA4;
	static const STENCIL_BACK_WRITEMASK = 0x8CA5;
	static const VIEWPORT = 0x0BA2;
	static const SCISSOR_BOX = 0x0C10;
	/* static const SCISSOR_TEST = 0x0C11; */
	static const COLOR_CLEAR_VALUE = 0x0C22;
	static const COLOR_WRITEMASK = 0x0C23;
	static const UNPACK_ALIGNMENT = 0x0CF5;
	static const PACK_ALIGNMENT = 0x0D05;
	static const MAX_TEXTURE_SIZE = 0x0D33;
	static const MAX_VIEWPORT_DIMS = 0x0D3A;
	static const SUBPIXEL_BITS = 0x0D50;
	static const RED_BITS = 0x0D52;
	static const GREEN_BITS = 0x0D53;
	static const BLUE_BITS = 0x0D54;
	static const ALPHA_BITS = 0x0D55;
	static const DEPTH_BITS = 0x0D56;
	static const STENCIL_BITS = 0x0D57;
	static const POLYGON_OFFSET_UNITS = 0x2A00;
	/* static const POLYGON_OFFSET_FILL = 0x8037; */
	static const POLYGON_OFFSET_FACTOR = 0x8038;
	static const TEXTURE_BINDING_2D = 0x8069;
	static const SAMPLE_BUFFERS = 0x80A8;
	static const SAMPLES = 0x80A9;
	static const SAMPLE_COVERAGE_VALUE = 0x80AA;
	static const SAMPLE_COVERAGE_INVERT = 0x80AB;

	/* DataType */
	static const BYTE = 0x1400;
	static const UNSIGNED_BYTE = 0x1401;
	static const SHORT = 0x1402;
	static const UNSIGNED_SHORT = 0x1403;
	static const INT = 0x1404;
	static const UNSIGNED_INT = 0x1405;
	static const FLOAT = 0x1406;

	/* PixelFormat */
	static const DEPTH_COMPONENT = 0x1902;
	static const ALPHA = 0x1906;
	static const RGB = 0x1907;
	static const RGBA = 0x1908;
	static const LUMINANCE = 0x1909;
	static const LUMINANCE_ALPHA = 0x190A;

	/* PixelType */
	/* static const UNSIGNED_BYTE = 0x1401; */
	static const UNSIGNED_SHORT_4_4_4_4 = 0x8033;
	static const UNSIGNED_SHORT_5_5_5_1 = 0x8034;
	static const UNSIGNED_SHORT_5_6_5 = 0x8363;

	/* Shaders */
	static const FRAGMENT_SHADER = 0x8B30;
	static const VERTEX_SHADER = 0x8B31;
	static const MAX_VERTEX_ATTRIBS = 0x8869;
	static const MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
	static const MAX_VARYING_VECTORS = 0x8DFC;
	static const MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
	static const MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
	static const MAX_TEXTURE_IMAGE_UNITS = 0x8872;
	static const MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
	static const SHADER_TYPE = 0x8B4F;
	static const DELETE_STATUS = 0x8B80;
	static const LINK_STATUS = 0x8B82;
	static const VALIDATE_STATUS = 0x8B83;
	static const ATTACHED_SHADERS = 0x8B85;
	static const ACTIVE_UNIFORMS = 0x8B86;
	static const ACTIVE_ATTRIBUTES = 0x8B89;
	static const SHADING_LANGUAGE_VERSION = 0x8B8C;
	static const CURRENT_PROGRAM = 0x8B8D;

	/* StencilFunction */
	static const NEVER = 0x0200;
	static const LESS = 0x0201;
	static const EQUAL = 0x0202;
	static const LEQUAL = 0x0203;
	static const GREATER = 0x0204;
	static const NOTEQUAL = 0x0205;
	static const GEQUAL = 0x0206;
	static const ALWAYS = 0x0207;
    
	/* StencilOp */
	/* static const ZERO = 0; */
	static const KEEP = 0x1E00;
	static const REPLACE = 0x1E01;
	static const INCR = 0x1E02;
	static const DECR = 0x1E03;
	static const INVERT = 0x150A;
	static const INCR_WRAP = 0x8507;
	static const DECR_WRAP = 0x8508;
    
	/* StringName */
	static const VENDOR = 0x1F00;
	static const RENDERER = 0x1F01;
	static const VERSION = 0x1F02;

	/* TextureMagFilter */
	static const NEAREST = 0x2600;
	static const LINEAR = 0x2601;

	/* TextureMinFilter */
	/* static const NEAREST = 0x2600; */
	/* static const LINEAR = 0x2601; */
	static const NEAREST_MIPMAP_NEAREST = 0x2700;
	static const LINEAR_MIPMAP_NEAREST = 0x2701;
	static const NEAREST_MIPMAP_LINEAR = 0x2702;
	static const LINEAR_MIPMAP_LINEAR = 0x2703;

	/* TextureParameterName */
	static const TEXTURE_MAG_FILTER = 0x2800;
	static const TEXTURE_MIN_FILTER = 0x2801;
	static const TEXTURE_WRAP_S = 0x2802;
	static const TEXTURE_WRAP_T = 0x2803;

	/* TextureTarget */
	static const TEXTURE_2D = 0x0DE1;
	static const TEXTURE = 0x1702;

	static const TEXTURE_CUBE_MAP = 0x8513;
	static const TEXTURE_BINDING_CUBE_MAP = 0x8514;
	static const TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
	static const TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
	static const TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
	static const TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
	static const TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
	static const TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
	static const MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;

	/* TextureUnit */
	static const TEXTURE0 = 0x84C0;
	static const TEXTURE1 = 0x84C1;
	static const TEXTURE2 = 0x84C2;
	static const TEXTURE3 = 0x84C3;
	static const TEXTURE4 = 0x84C4;
	static const TEXTURE5 = 0x84C5;
	static const TEXTURE6 = 0x84C6;
	static const TEXTURE7 = 0x84C7;
	static const TEXTURE8 = 0x84C8;
	static const TEXTURE9 = 0x84C9;
	static const TEXTURE10 = 0x84CA;
	static const TEXTURE11 = 0x84CB;
	static const TEXTURE12 = 0x84CC;
	static const TEXTURE13 = 0x84CD;
	static const TEXTURE14 = 0x84CE;
	static const TEXTURE15 = 0x84CF;
	static const TEXTURE16 = 0x84D0;
	static const TEXTURE17 = 0x84D1;
	static const TEXTURE18 = 0x84D2;
	static const TEXTURE19 = 0x84D3;
	static const TEXTURE20 = 0x84D4;
	static const TEXTURE21 = 0x84D5;
	static const TEXTURE22 = 0x84D6;
	static const TEXTURE23 = 0x84D7;
	static const TEXTURE24 = 0x84D8;
	static const TEXTURE25 = 0x84D9;
	static const TEXTURE26 = 0x84DA;
	static const TEXTURE27 = 0x84DB;
	static const TEXTURE28 = 0x84DC;
	static const TEXTURE29 = 0x84DD;
	static const TEXTURE30 = 0x84DE;
	static const TEXTURE31 = 0x84DF;
	static const ACTIVE_TEXTURE = 0x84E0;

	/* TextureWrapMode */
	static const REPEAT = 0x2901;
	static const CLAMP_TO_EDGE = 0x812F;
	static const MIRRORED_REPEAT = 0x8370;

	/* Uniform Types */
	static const FLOAT_VEC2 = 0x8B50;
	static const FLOAT_VEC3 = 0x8B51;
	static const FLOAT_VEC4 = 0x8B52;
	static const INT_VEC2 = 0x8B53;
	static const INT_VEC3 = 0x8B54;
	static const INT_VEC4 = 0x8B55;
	static const BOOL = 0x8B56;
	static const BOOL_VEC2 = 0x8B57;
	static const BOOL_VEC3 = 0x8B58;
	static const BOOL_VEC4 = 0x8B59;
	static const FLOAT_MAT2 = 0x8B5A;
	static const FLOAT_MAT3 = 0x8B5B;
	static const FLOAT_MAT4 = 0x8B5C;
	static const SAMPLER_2D = 0x8B5E;
	static const SAMPLER_CUBE = 0x8B60;
    
	/* Vertex Arrays */
	static const VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
	static const VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
	static const VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
	static const VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
	static const VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
	static const VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
	static const VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

	/* Shader Source */
	static const COMPILE_STATUS = 0x8B81;

	/* Shader Precision-Specified Types */
	static const LOW_FLOAT = 0x8DF0;
	static const MEDIUM_FLOAT = 0x8DF1;
	static const HIGH_FLOAT = 0x8DF2;
	static const LOW_INT = 0x8DF3;
	static const MEDIUM_INT = 0x8DF4;
	static const HIGH_INT = 0x8DF5;
    
	/* Framebuffer Object. */
	static const FRAMEBUFFER = 0x8D40;
	static const RENDERBUFFER = 0x8D41;

	static const RGBA4 = 0x8056;
	static const RGB5_A1 = 0x8057;
	static const RGB565 = 0x8D62;
	static const DEPTH_COMPONENT16 = 0x81A5;
	static const STENCIL_INDEX = 0x1901;
	static const STENCIL_INDEX8 = 0x8D48;
	static const DEPTH_STENCIL = 0x84F9;

	static const RENDERBUFFER_WIDTH = 0x8D42;
	static const RENDERBUFFER_HEIGHT = 0x8D43;
	static const RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
	static const RENDERBUFFER_RED_SIZE = 0x8D50;
	static const RENDERBUFFER_GREEN_SIZE = 0x8D51;
	static const RENDERBUFFER_BLUE_SIZE = 0x8D52;
	static const RENDERBUFFER_ALPHA_SIZE = 0x8D53;
	static const RENDERBUFFER_DEPTH_SIZE = 0x8D54;
	static const RENDERBUFFER_STENCIL_SIZE = 0x8D55;

	static const FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
	static const FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
	static const FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
	static const FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

	static const COLOR_ATTACHMENT0 = 0x8CE0;
	static const DEPTH_ATTACHMENT = 0x8D00;
	static const STENCIL_ATTACHMENT = 0x8D20;
	static const DEPTH_STENCIL_ATTACHMENT = 0x821A;

	static const NONE = 0;

	static const FRAMEBUFFER_COMPLETE = 0x8CD5;
	static const FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
	static const FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
	static const FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
	static const FRAMEBUFFER_UNSUPPORTED = 0x8CDD;

	static const FRAMEBUFFER_BINDING = 0x8CA6;
	static const RENDERBUFFER_BINDING = 0x8CA7;
	static const MAX_RENDERBUFFER_SIZE = 0x84E8;

	static const INVALID_FRAMEBUFFER_OPERATION = 0x0506;

	/* WebGL-specific enums */
	static const UNPACK_FLIP_Y_WEBGL = 0x9240;
	static const UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
	static const CONTEXT_LOST_WEBGL = 0x9242;
	static const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
	static const BROWSER_DEFAULT_WEBGL = 0x9244;
}

// A class representing a rectangle used in shader programs of WebGL.
class WebGLRectangle {
	var _buffer: WebGLBuffer;
	var _points: Float32Array;
	var _attribute: number;

	function constructor(context: WebGLRenderingContext, program: WebGLProgram, key: string, x: number, y: number, width: number, height: number) {
		var x0 = x;
		var y0 = y;
		var x1 = x + width;
		var y1 = y + height;
		this._buffer = context.createBuffer();
		this._points = new Float32Array([x0, y0, x1, y0, x0, y1, x1, y1]);
		context.bindBuffer(WebGL.ARRAY_BUFFER, this._buffer);
		context.bufferData(WebGL.ARRAY_BUFFER, this._points, WebGL.STATIC_DRAW);
		this._attribute = context.getAttribLocation(program, key);
		context.enableVertexAttribArray(this._attribute);
		context.vertexAttribPointer(this._attribute, 2, WebGL.FLOAT, false, 0, 0);
	}

	function set(x: number, y: number, width: number, height: number): void {
		var x0 = x;
		var y0 = y;
		var x1 = x + width;
		var y1 = y + height;
		this._points[0] = x0;
		this._points[1] = y0;
		this._points[2] = x1;
		this._points[3] = y0;
		this._points[4] = x0;
		this._points[5] = y1;
		this._points[6] = x1;
		this._points[7] = y1;
	}

	function bindContext(context: WebGLRenderingContext): void {
		context.bindBuffer(WebGL.ARRAY_BUFFER, this._buffer);
		context.bufferData(WebGL.ARRAY_BUFFER, this._points, WebGL.STATIC_DRAW);
		context.enableVertexAttribArray(this._attribute);
		context.vertexAttribPointer(this._attribute, 2, WebGL.FLOAT, false, 0, 0);
	}
}

// 
class WebGLVector {
	var _x: number;
	var _y: number;
	var _dirty: boolean;
	var _point: WebGLUniformLocation;

	function constructor(context: WebGLRenderingContext, program: WebGLProgram, key: string, x: number, y: number) {
		this._x = x;
		this._y = y;
		this._dirty = false;
		this._point = context.getUniformLocation(program, key);
		context.uniform2f(this._point, x, y);
	}

	function set(x: number, y: number): void {
		if(this._x != x || this._y != y) {
			this._x = x;
			this._y = y;
			this._dirty = true;
		}
	}

	function bindContext(context: WebGLRenderingContext): void {
		if(this._dirty) {
			context.uniform2f(this._point, this._x, this._y);
			this._dirty = false;
		}
	}
}

class WebGLColor {
	var _red: number;
	var _green: number;
	var _blue: number;
	var _alpha: number;
	var _dirty: boolean;
	var _color: WebGLUniformLocation;
	static const SCALE = 1 / 255;

	function constructor(context: WebGLRenderingContext, program: WebGLProgram, key: string, red: number, green: number, blue: number, alpha: number) {
		this._red = red;
		this._green = green;
		this._blue = blue;
		this._alpha = alpha;
		this._dirty = false;
		this._color = context.getUniformLocation(program, key);
		context.uniform4f(this._color, red, green, blue, alpha);
	}

	function setColor(color: number): void {
		var red = ((color >> 24) & 0xFF) * WebGLColor.SCALE;
		var green = ((color >> 16) & 0xFF) * WebGLColor.SCALE;
		var blue = ((color >> 8) & 0xFF) * WebGLColor.SCALE;
		var alpha = (color & 0xFF) * WebGLColor.SCALE;
		this.setColor(red, green, blue);
		this.setAlpha(alpha);
	}

	function setColor(red: number, green: number, blue: number): void {
		if(this._red != red || this._green != green || this._blue != blue) {
			this._red = red;
			this._green = green;
			this._blue = blue;
			this._dirty = true;
		}
	}

	function setAlpha(alpha: number): void {
		if(this._alpha != alpha) {
			this._alpha = alpha;
			this._dirty = true;
		}
	}

	function bindContext(context: WebGLRenderingContext): void {
		if(this._dirty) {
			context.uniform4f(this._color, this._red, this._green, this._blue, this._alpha);
			this._dirty = false;
		}
	}
}

// A class encapsulating an Affine transform used in shader programs of WebGL.
class WebGLMatrix {
	var _scaleX: number;
	var _scaleY: number;
	var _matrix: Float32Array;
	var _dirty: boolean;
	var _transform: WebGLUniformLocation;

	function constructor(context: WebGLRenderingContext, program: WebGLProgram, key: string, scaleX: number, scaleY: number) {
		this._scaleX = scaleX;
		this._scaleY = scaleY;
		this._matrix = new Float32Array([1, 0, 0, 0, 1, 0, -1, 1, 1]);
		this._dirty = false;
		this._transform = context.getUniformLocation(program, key);
		context.uniformMatrix3fv(this._transform, false, this._matrix);
	}

	function setScale(scaleX: number, scaleY: number): void {
		this._scaleX = scaleX;
		this._scaleY = scaleY;
	}

	function setTransform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
		this._matrix[0] = a;
		this._matrix[1] = c;
		this._matrix[2] = 0;
		this._matrix[3] = b;
		this._matrix[4] = d;
		this._matrix[5] = 0;
		this._matrix[6] = -1 + tx * this._scaleX;
		this._matrix[7] = 1 - ty * this._scaleY;
		this._matrix[8] = 1;
		this._dirty = true;
	}

	function bindContext(context: WebGLRenderingContext): void {
		if(this._dirty) {
		    context.uniformMatrix3fv(this._transform, false, this._matrix);
			this._dirty = false;
		}
	}
}

class WebGLRenderShape {
	var context: WebGLRenderingContext;
	var vertex: WebGLShader;
	var fragment: WebGLShader;
	var program: WebGLProgram;

	function constructor(context: WebGLRenderingContext) {
		this.context = context;
		this.vertex = null;
		this.fragment = null;
		this.program = null;
	}

	function constructor(context: WebGLRenderingContext, vertex: string, fragment: string) {
		this.context = context;
		this.vertex = context.createShader(WebGL.VERTEX_SHADER);
		context.shaderSource(this.vertex, vertex);
		context.compileShader(this.vertex);
		if(!context.getShaderParameter(this.vertex, WebGL.COMPILE_STATUS)) {
			Tombo.error(context.getShaderInfoLog(this.vertex));
		}

		this.fragment = context.createShader(WebGL.FRAGMENT_SHADER);
		context.shaderSource(this.fragment, fragment);
		context.compileShader(this.fragment);
		if(!context.getShaderParameter(this.fragment, WebGL.COMPILE_STATUS)) {
			Tombo.error(context.getShaderInfoLog(this.vertex));
		}

		this.program = context.createProgram();
		context.attachShader(this.program, this.vertex);
		context.attachShader(this.program, this.fragment);
		context.linkProgram(this.program);
		context.useProgram(this.program);
	}

	function createProgram(vertex: string, fragment: string): void {
		var context = this.context;
		this.vertex = context.createShader(WebGL.VERTEX_SHADER);
		context.shaderSource(this.vertex, vertex);
		context.compileShader(this.vertex);
		if(!context.getShaderParameter(this.vertex, WebGL.COMPILE_STATUS)) {
			Tombo.error(context.getShaderInfoLog(this.vertex));
		}

		this.fragment = context.createShader(WebGL.FRAGMENT_SHADER);
		context.shaderSource(this.fragment, fragment);
		context.compileShader(this.fragment);
		if(!context.getShaderParameter(this.fragment, WebGL.COMPILE_STATUS)) {
			Tombo.error(context.getShaderInfoLog(this.vertex));
		}

		this.program = context.createProgram();
		context.attachShader(this.program, this.vertex);
		context.attachShader(this.program, this.fragment);
		context.linkProgram(this.program);
		context.useProgram(this.program);
	}
}

class WebGLRenderFrame extends WebGLRenderShape {
	var scaleX: number;
	var scaleY: number;
	var _position: WebGLRectangle;
	var _texture: WebGLRectangle;
	var _width: number;
	var _height: number;
	var _clip: boolean;
	var _clipRect: Rect;
	var _frameTexture: WebGLTexture;
	var _frameBuffer: WebGLFramebuffer;
/*
	static const VERTEX =
		"attribute vec2 position;" +
		"attribute vec2 texture;" +
		"varying vec2 uvPoint;" +
		"void main() {" +
		"  gl_Position = vec4(2.0*position[0]-1.0, 2.0*position[1]-1.0, 0, 1);" +
		"  uvPoint = texture;" +
		"}";
	static const FRAGMENT =
		"precision mediump float;" +
		"varying vec2 uvPoint;" +
		"uniform sampler2D image;" +
		"void main() {" +
		"  gl_FragColor = texture2D(image, uvPoint);" +
		"}";
*/
	function constructor(context: WebGLRenderingContext, width: number, height: number) {
		//super(context, WebGLRenderFrame.VERTEX, WebGLRenderFrame.FRAGMENT);
		super(context);
		var VERTEX =
			"attribute vec2 position;" +
			"attribute vec2 texture;" +
			"varying vec2 uvPoint;" +
			"void main() {" +
			"  gl_Position = vec4(2.0*position[0]-1.0, 2.0*position[1]-1.0, 0, 1);" +
			"  uvPoint = texture;" +
			"}";
		var FRAGMENT =
			"precision mediump float;" +
			"varying vec2 uvPoint;" +
			"uniform sampler2D image;" +
			"void main() {" +
			"  gl_FragColor = texture2D(image, uvPoint);" +
			"}";
		this.createProgram(VERTEX, FRAGMENT);
		this.scaleX = 2 / width;
		this.scaleY = 2 / height;
		this._position = new WebGLRectangle(context, this.program, "position", 0, 0, 1, 1);
		this._texture = new WebGLRectangle(context, this.program, "texture", 0, 0, 1, 1);
		this._width = width;
		this._height = height;
		this._clip = false;
		this._clipRect = new Rect(0, 0, 0, 0);
		this._frameTexture = context.createTexture();
		context.bindTexture(WebGL.TEXTURE_2D, this._frameTexture);
		context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_WRAP_S, WebGL.CLAMP_TO_EDGE);
		context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_WRAP_T, WebGL.CLAMP_TO_EDGE);
		context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_MIN_FILTER, WebGL.LINEAR);
		context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_MAG_FILTER, WebGL.LINEAR);
		context.texImage2D(WebGL.TEXTURE_2D, 0, WebGL.RGBA, width, height, 0, WebGL.RGBA, WebGL.UNSIGNED_BYTE, null);
		this._frameBuffer = context.createFramebuffer();
		context.bindFramebuffer(WebGL.FRAMEBUFFER, this._frameBuffer);
		context.framebufferTexture2D(WebGL.FRAMEBUFFER, WebGL.COLOR_ATTACHMENT0, WebGL.TEXTURE_2D, this._frameTexture, 0);
	}

	function beginPaint(): void {
		this.context.bindFramebuffer(WebGL.FRAMEBUFFER, this._frameBuffer);
		this.context.viewport(0, 0, this._width, this._height);
	}

	function clearRect(x: number, y: number, width: number, height: number): void {
		y = this._height - y - height;

		// This function is called with or without a clipping rectangle.
		// If this frame already has a clipping rectangle, it
		// the intersection between the given rectangle and the clipping one
		// without changing the current clipping rectangle.
		if(!this._clip) {
			this.context.enable(WebGL.SCISSOR_TEST);
			this.context.scissor(x, y, width, height);
			this.context.clear(WebGL.COLOR_BUFFER_BIT);
			this.context.disable(WebGL.SCISSOR_TEST);
		} else {
			var minX = x;
			var minY = y;
			var maxX = minX + width;
			var maxY = minY + height;
			minX = Math.max(minX, this._clipRect.left);
			minY = Math.max(minY, this._clipRect.top);
			maxX = Math.min(maxX, this._clipRect.left + this._clipRect.width);
			maxY = Math.min(maxY, this._clipRect.top + this._clipRect.height);
			x = minX;
			y = minY;
			width = maxX - minX;
			height = maxY - minY;
			this.context.scissor(x, y, width, height);
			this.context.clear(WebGL.COLOR_BUFFER_BIT);
			this.context.scissor(this._clipRect.left, this._clipRect.top, this._clipRect.width, this._clipRect.height);
		}
	}

	function clipRect(x: number, y: number, width: number, height: number): void {
		y = this._height - y - height;
		this.context.enable(WebGL.SCISSOR_TEST);
		this.context.scissor(x, y, width, height);
		this._clip = true;
		this._clipRect.left = x;
		this._clipRect.top = y;
		this._clipRect.width = width;
		this._clipRect.height = height;
	}

	function endPaint(): void {
		if(this._clip) {
			// Disable the clipping rectangle.
			this.context.disable(WebGL.SCISSOR_TEST);
			this._clip = false;
		}
	}

	function draw(x: number, y: number, width: number, height: number): void {
		// Copy this frame buffer to the global context.
		this.context.bindFramebuffer(WebGL.FRAMEBUFFER, null);
		this.context.viewport(x, y, this._width, this._height);
		this.context.useProgram(this.program);
		this.context.bindTexture(WebGL.TEXTURE_2D, this._frameTexture);
		this._position.bindContext(this.context);
		this._texture.bindContext(this.context);
		this.context.drawArrays(WebGL.TRIANGLE_STRIP, 0, 4);
	}
}

class WebGLRenderRectangle extends WebGLRenderShape {
	var _screen: WebGLVector;
	var _anchor: WebGLVector;
	var _transform: WebGLMatrix;
	var _position: WebGLRectangle;
	var _color: WebGLColor;
/*
	static const VERTEX =
      "attribute vec2 position;" +
      "uniform vec2 anchor;" +
      "uniform vec2 screen;" +
      "uniform mat3 transform;" +
      "void main() {" +
      "  vec2 v0 = (position + anchor) * screen;" +
      "  vec3 v1 = transform * vec3(v0[0], -v0[1], 1);" +
      "  gl_Position = vec4(v1[0], v1[1], 0, 1);" +
      "}";
	static const FRAGMENT =
      "precision mediump float;" +
      "uniform vec4 color;" +
      "void main() {" +
      "  gl_FragColor = color;" +
      "}";
*/
	function constructor(context: WebGLRenderingContext, scaleX: number, scaleY: number) {
		//super(context, WebGLRenderRectangle.VERTEX, WebGLRenderRectangle.FRAGMENT);
		super(context);
		var VERTEX =
	      "attribute vec2 position;" +
	      "uniform vec2 anchor;" +
	      "uniform vec2 screen;" +
	      "uniform mat3 transform;" +
	      "void main() {" +
	      "  vec2 v0 = (position + anchor) * screen;" +
	      "  vec3 v1 = transform * vec3(v0[0], -v0[1], 1);" +
	      "  gl_Position = vec4(v1[0], v1[1], 0, 1);" +
	      "}";
		var FRAGMENT =
	      "precision mediump float;" +
	      "uniform vec4 color;" +
	      "void main() {" +
	      "  gl_FragColor = color;" +
	      "}";
		this.createProgram(VERTEX, FRAGMENT);
		this._screen = new WebGLVector(context, this.program, "screen", scaleX, scaleY);
		this._anchor = new WebGLVector(context, this.program, "anchor", 0, 0);
		this._transform = new WebGLMatrix(context, this.program, "transform", scaleY, scaleY);
		this._position = new WebGLRectangle(context, this.program, "position", 0, 0, 0, 0);
		this._color = new WebGLColor(context, this.program, "color", 1, 0, 0, 1);
	}

	function beginPaint(frame: WebGLRenderFrame): void {
		var scaleX = frame.scaleX;
		var scaleY = frame.scaleY;
		this._screen.set(scaleX, scaleY);
		this._transform.setScale(scaleX, scaleY);
	}

	function fillRect(x: number, y: number, width: number, height: number, color: number): void {
		this._color.setColor(color);
		this._anchor.set(x, y);
		this._position.set(0, 0, width, height);

		this.context.useProgram(this.program);
		this._color.bindContext(this.context);
		this._anchor.bindContext(this.context);
		this._transform.bindContext(this.context);
		this._position.bindContext(this.context);
		this.context.drawArrays(WebGL.TRIANGLE_STRIP, 0, 4);
	}

	function beginPaint(scaleX: number, scaleY: number): void {
		this._screen.set(scaleX, scaleY);
		this._transform.setScale(scaleX, scaleY);
	}

	function setTransform(matrix: Array.<number>): void {
		this._transform.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
	}

	function endPaint(): void {
	}
}

class WebGLRenderSprite extends WebGLRenderShape {
	var _screen: WebGLVector;
	var _anchor: WebGLVector;
	var _transform: WebGLMatrix;
	var _position: WebGLRectangle;
	var _texture: WebGLRectangle;
	var _color: WebGLColor;
	var _spriteId: number;
	var _textures: Map.<WebGLTexture>;
/*
	static const VERTEX =
		"attribute vec2 position;" +
		"attribute vec2 texture;" +
		"uniform vec2 anchor;" +
		"uniform vec2 screen;" +
		"uniform mat3 transform;" +
		"varying vec2 uvPoint;" +
		"void main() {" +
		"  vec2 v0 = (position + anchor) * screen;" +
		"  vec3 v1 = transform * vec3(v0[0], -v0[1], 1);" +
		"  gl_Position = vec4(v1[0], v1[1], 0, 1);" +
		"  uvPoint = texture;" +
		"}";
	static const FRAGMENT =
		"precision mediump float;" +
		"varying vec2 uvPoint;" +
		"uniform vec4 color;" +
		"uniform sampler2D image;" +
		"void main() {" +
		"  gl_FragColor = color * texture2D(image, uvPoint);" +
		"}";
*/
	function constructor(context: WebGLRenderingContext, scaleX: number, scaleY: number) {
		//super(context, WebGLRenderSprite.VERTEX, WebGLRenderSprite.FRAGMENT);
		super(context);
		var VERTEX =
			"attribute vec2 position;" +
			"attribute vec2 texture;" +
			"uniform vec2 anchor;" +
			"uniform vec2 screen;" +
			"uniform mat3 transform;" +
			"varying vec2 uvPoint;" +
			"void main() {" +
			"  vec2 v0 = (position + anchor) * screen;" +
			"  vec3 v1 = transform * vec3(v0[0], -v0[1], 1);" +
			"  gl_Position = vec4(v1[0], v1[1], 0, 1);" +
			"  uvPoint = texture;" +
			"}";
		var FRAGMENT =
			"precision mediump float;" +
			"varying vec2 uvPoint;" +
			"uniform vec4 color;" +
			"uniform sampler2D image;" +
			"void main() {" +
			"  gl_FragColor = color * texture2D(image, uvPoint);" +
			"}";
		this.createProgram(VERTEX, FRAGMENT);
		this._screen = new WebGLVector(context, this.program, "screen", scaleX, scaleY);
		this._anchor = new WebGLVector(context, this.program, "anchor", 0, 0);
		this._transform = new WebGLMatrix(context, this.program, "transform", scaleX, scaleY);
		this._position = new WebGLRectangle(context, this.program, "position", 0, 0, 0, 0);
		this._texture = new WebGLRectangle(context, this.program, "texture", 0, 0, 1, 1);
		this._color = new WebGLColor(context, this.program, "color", 1, 1, 1, 1);
		this._spriteId = 0;
		this._textures = {} : Map.<WebGLTexture>;
	}

	function beginPaint(frame: WebGLRenderFrame): void {
		var scaleX = frame.scaleX;
		var scaleY = frame.scaleY;
		this._screen.set(scaleX, scaleY);
		this._transform.setScale(scaleX, scaleY);
	}

	function _setImage(image: HTMLImageElement): void {
		// It is very slow to create a texture from an image. To avoid creating
		// textures every time when this renderer renders the image, this
		// object caches the created textures and re-uses them.
		var id = image.id;
		if(!id) {
			id = (++this._spriteId) as string;
			image.id = id;
		}
		var texture = this._textures[id];
		if(texture) {
			this.context.bindTexture(WebGL.TEXTURE_2D, texture);
			return;
		}
		texture = this.context.createTexture();
		this.context.bindTexture(WebGL.TEXTURE_2D, texture);
		this.context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_WRAP_S, WebGL.CLAMP_TO_EDGE);
		this.context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_WRAP_T, WebGL.CLAMP_TO_EDGE);
		this.context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_MIN_FILTER, WebGL.LINEAR);
		this.context.texParameteri(WebGL.TEXTURE_2D, WebGL.TEXTURE_MAG_FILTER, WebGL.LINEAR);
		this.context.texImage2D(WebGL.TEXTURE_2D, 0, WebGL.RGBA, WebGL.RGBA, WebGL.UNSIGNED_BYTE, image);
		this._textures[id] = texture;
	}

	function drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
		this._anchor.set(x, y);
		this._position.set(0, 0, width, height);
		this._texture.set(0, 0, 1, 1);

		this.context.useProgram(this.program);
		this._setImage(image);
		this._screen.bindContext(this.context);
		this._color.bindContext(this.context);
		this._texture.bindContext(this.context);
		this._anchor.bindContext(this.context);
		this._transform.bindContext(this.context);
		this._position.bindContext(this.context);
		this.context.drawArrays(WebGL.TRIANGLE_STRIP, 0, 4);
	}

	function drawPartialImage(image: HTMLImageElement,
                              srcX: number, srcY: number, srcWidth: number, srcHeight: number,
                              x: number, y: number, width: number, height: number): void {
		this._anchor.set(x, y);
		this._position.set(0, 0, width, height);
		var scaleX = 1 / image.width;
		var scaleY = 1 / image.height;
		this._texture.set(srcX * scaleX, srcY * scaleY, srcWidth * scaleX, srcHeight * scaleY);

		this.context.useProgram(this.program);
		this._setImage(image);
		this._screen.bindContext(this.context);
		this._color.bindContext(this.context);
		this._texture.bindContext(this.context);
		this._anchor.bindContext(this.context);
		this._transform.bindContext(this.context);
		this._position.bindContext(this.context);
		this.context.drawArrays(WebGL.TRIANGLE_STRIP, 0, 4);
	}

	function drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number, color: number): void {
		this._color.setColor(color);
		this.drawImage(image, x, y, width, height);
	}

	function setTransform(matrix: Array.<number>): void {
		this._transform.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
	}

	function endPaint(): void {
	}
}

// A class that implements the RenderLayer interface with WebGL.
class WebGLRenderLayer implements RenderLayer {
	var _frame: WebGLRenderFrame;
	var _rectangle: WebGLRenderRectangle;
	var _sprite: WebGLRenderSprite;
	var _width: number;
	var _height: number;
	var _minX: number;
	var _minY: number;
	var _maxX: number;
	var _maxY: number;

	function constructor(frame: WebGLRenderFrame, rectangle: WebGLRenderRectangle, sprite: WebGLRenderSprite, width: number, height: number, scale: number) {
		this._frame = frame;
		this._rectangle = rectangle;
		this._sprite = sprite;
		this._width = width;
		this._height = height;
		this._minX = -1;
		this._minY = -1;
		this._maxX = -1;
		this._maxY = -1;
	}

	override function save(): void {
	}

	override function restore(): void {
	}

	override function beginPath(): void {
	}

	override function rect(x: number, y: number, width: number, height: number): void {
		var minX = x;
		var minY = y;
		var maxX = x + width;
		var maxY = y + height;
		if(this._minX >= 0) {
			minX = Math.min(this._minX, minX);
			minY = Math.min(this._minY, minY);
			maxX = Math.max(this._maxX, maxX);
			maxY = Math.max(this._maxY, maxY);
		}
		this._minX = minX;
		this._minY = minY;
		this._maxX = maxX;
		this._maxY = maxY;
	}

	override function clearRect(x: number, y: number, width: number, height: number): void {
		this._frame.clearRect(x, y, width, height);
	}

	override function clip(): void {
		var width = this._maxX - this._minX;
		var height = this._maxY - this._minY;
		if(width > 0 && height > 0) {
			var x = this._minX;
			var y = this._minY;
			//this._frame.clipRect(x, y, width, height);
		}
	}

	override function fillRect(x: number, y: number, width: number, height: number, color: number): void {
		this._rectangle.fillRect(x, y, width, height, color);
	}

	override function drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
		this._sprite.drawImage(image, x, y, width, height);
	}

	override function drawPartialImage(image: HTMLImageElement,
                                       srcX: number, srcY: number, srcWidth: number, srcHeight: number,
                                       x: number, y: number, width: number, height: number): void {
		this._sprite.drawPartialImage(image, srcX, srcY, srcWidth, srcHeight, x, y, image.width, image.height);
	}

	override function setAlpha(alpha: number): void {
	}

	override function setCompositeOperation(compositeOperation: string): void {
	}

	override function setTransform(transform: Transform): void {
		var matrix = transform.getMatrix();
		this._sprite.setTransform(matrix);
		this._rectangle.setTransform(matrix);
	}

	// Starts painting a frame. This function initializes the resources attached
	// to this object so DisplayNode objects can render shapes.
	override function beginPaint(): void {
		// Use this frame as the rendering target and attach this frame to
		// the renderers so they can render shapes to the frame.
		this._frame.beginPaint();
		this._sprite.beginPaint(this._frame);
		this._rectangle.beginPaint(this._frame);
	}

	override function endPaint(): void {
		this._rectangle.endPaint();
		this._sprite.endPaint();
		this._frame.endPaint();
		this._minX = -1;
		this._minY = -1;
		this._maxX = -1;
		this._maxY = -1;
	}

	override function paint(context: CanvasRenderingContext2D, compositeOperation: string, left: number, top: number): void {
		this._frame.draw(left, top, 640, 960);
	}
}

class Renderer {
	var _canvas: HTMLCanvasElement;
	var _context: CanvasRenderingContext2D;
	var _webgl: WebGLRenderingContext;
	var _rectangle: WebGLRenderRectangle;
	var _sprite: WebGLRenderSprite;

	static var _instance = null: Renderer;

	static function createInstance(canvas: HTMLCanvasElement): void {
		if(!Renderer._instance) {
			Renderer._instance = new Renderer(canvas);
		}
	}

	static function createRenderer(width: number, height: number, scale: number): RenderLayer {
		var instance = Renderer._instance;
		if(instance && instance._webgl) {
			var frame = new WebGLRenderFrame(instance._webgl, width, height);
			return new WebGLRenderLayer(frame, instance._rectangle, instance._sprite, width, height, scale);
		}
		var canvas = dom.createElement("canvas") as HTMLCanvasElement;
		return new CanvasRenderLayer(canvas, width, height, scale);
	}

	static function paintLayer(layer: RenderLayer, compositeOperation: string, left: number, top: number): void {
		if(Renderer._instance) {
			layer.paint(Renderer._instance._context, compositeOperation, left, top);
		}
	}

	function constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this._webgl = canvas.getContext("experimental-webgl") as WebGLRenderingContext;
		if(this._webgl) {
			var scaleX = 2 / canvas.width;
			var scaleY = 2 / canvas.height;
			this._context = null;
			this._rectangle = new WebGLRenderRectangle(this._webgl, scaleX, scaleY);
			this._sprite = new WebGLRenderSprite(this._webgl, scaleX, scaleY);
		} else {
			this._context = canvas.getContext("2d") as CanvasRenderingContext2D;
			this._rectangle = null;
			this._sprite = null;
		}
	}
}
