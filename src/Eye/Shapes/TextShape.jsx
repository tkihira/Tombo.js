import "js/web.jsx";
import "../Eye.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

/**
 * TextShape class
 * 
 * <p>TextShape is for drawing mutable text. It has features such as word-wrap or multiline.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class TextShape implements Shape {
	var bounds: Rect;
	var isMutable = true;
	var isImage = false;
	var _id: number;
	
	/** Whether to cache rendered text. */
	static const USE_CACHE = true;

	/** TextMargin: Left */
	static const LEFT = 0;
	/** TextMargin: Right */
	static const RIGHT = 1;
	/** TextMargin: Center */
	static const CENTER = 2;
	/** TextVerticleMargin: Top */
	static const TOP = 0;
	/** TextVerticleMargin: Bottom */
	static const BOTTOM = 1;
	/** TextVerticleMargin: Middle */
	static const MIDDLE = 2;
	
	/** Option class for TextShape */
	class Option {
		/** word wrap: default false */
		var wordWrap = false as boolean;
		/** multiline: default false */
		var multiline = false as boolean;
		/** border: default false */
		var border = false as boolean;
		/** textColor: default rgb(255,255,255) */
		var textColor = Color.createRGB(255, 255, 255) as int;
		/** borderColor: default rgb(0,0,0) */
		var borderColor = Color.createRGB(0, 0, 0) as int;
		/** borderWidth: default 1 */
		var borderWidth = 1 as int;
		/** maxLength: 0 if disable */
		var maxLength = 0 as int;
		/** font: font name*/
		var font = "" as string;
		//** fontClass: font class name*/
		//var fontClass = "";
		//var autoSize = false;
		/** leftMargin: default 0 */
		var leftMargin = 0 as int;
		/** rightMargin: default 0 */
		var rightMargin = 0 as int;
		/** align: default TextShape.LEFT */
		var align = TextShape.LEFT as int;
		/** valign: default TextShape.TOP */
		var valign = TextShape.TOP as int;
		/** fontHeight: default 30 */
		var fontHeight = 30 as int;
		function serialize(json: Array.<variant>): void {
			json.push("wordWrap:" + this.wordWrap as string);
			json.push("multiline:" + this.multiline as string);
			json.push("border:" + this.border as string);
			json.push("textColor:" + this.textColor as string);
			json.push("borderColor:" + this.borderColor as string);
			json.push("borderWidth:" + this.borderWidth as string);
			json.push("maxLength:" + this.maxLength as string);
			json.push("font:" + this.font as string);
			json.push("leftMargin:" + this.leftMargin as string);
			json.push("rightMargin:" + this.rightMargin as string);
			json.push("align:" + this.align as string);
			json.push("valign:" + this.valign as string);
			json.push("fontHeight:" + this.fontHeight as string);
		}

		function constructor() { }

		function constructor(ww: boolean, mul: boolean, brd: boolean, tc: int, bc: int, bw: int, ml: int, ft: string, lm: int, rm: int, al: int, val: int, fh: int) {
			this.wordWrap = ww;
			this.multiline = mul;
			this.border = brd;
			this.textColor = tc;
			this.borderColor = bc;
			this.borderWidth = bw;
			this.maxLength = ml;
			this.font = ft;
			this.leftMargin = lm;
			this.rightMargin = rm;
			this.align = al; this.valign = val;
			this.fontHeight = fh;
		}

		function isEqual(ww: boolean, mul: boolean, brd: boolean, tc: int, bc: int, bw: int, ml: int, ft: string, lm: int, rm: int, al: int, val: int, fh: int): boolean {
			if (this.wordWrap != ww) return false;
			if (this.multiline != mul) return false;
			if (this.border != brd) return false;
			if (this.textColor != tc) return false;
			if (this.borderColor != bc) return false;
			if (this.borderWidth != bw) return false;
			if (this.maxLength != ml) return false;
			if (this.font != ft) return false;
			if (this.leftMargin != lm) return false;
			if (this.rightMargin != rm) return false;
			if (this.align != al) return false;
			if (this.valign != val) return false;
			if (this.fontHeight != fh) return false;
			return true;
		}
	}
	
	var _text: string;
	var _option = new TextShape.Option;
	var _textCanvas: HTMLCanvasElement;
	var _textWidth: number;
	var _textHeight: number;
	var _textDirty: boolean;
	
	/**
	 * create TextNode with the size and initial text
	 */
	function constructor(width: number, height: number, text: string) {
		this.bounds = new Rect(0, 0, width, height);
		this._id = Eye._shapeCounter++;
		this._text = text;
		this._textCanvas = null;
		this._textWidth = 0;
		this._textHeight = 0;
		this._textDirty = true;
	}
	
	function constructor(data: Array.<string>) {
		this._id = data[0].split(":")[1] as number;
		var b = data[2].split(":")[1].split(",");
		this.bounds = new Rect(b[0] as number, b[1] as number, b[2] as number, b[3] as number);
		this._text = data[3].split(":").slice(1).join(":");
		
		for(var i = 0; i < data.length; i++) {
			var command = data[i].split(":");
			switch(command[0]) {
				case "wordWrap": this._option.wordWrap = (command[1] == "true"); break;
				case "multiline": this._option.multiline = (command[1] == "true"); break;
				case "border": this._option.border = (command[1] == "true"); break;
				case "textColor": this._option.textColor = command[1] as number; break;
				case "borderColor": this._option.borderColor = command[1] as number; break;
				case "borderWidth": this._option.borderWidth = command[1] as number; break;
				case "maxLength": this._option.maxLength = command[1] as number; break;
				case "font": this._option.font = command[1]; break;
				case "leftMargin": this._option.leftMargin = command[1] as number; break;
				case "rightMargin": this._option.rightMargin = command[1] as number; break;
				case "align": this._option.align = command[1] as number; break;
				case "valign": this._option.valign = command[1] as number; break;
				case "fontHeight": this._option.fontHeight = command[1] as number; break;
			}
		}
		this._textCanvas = null;
		this._textWidth = 0;
		this._textHeight = 0;
		this._textDirty = true;
	}
	
	function constructor(id: number, bounds: Rect, text: string, option: string) {
		this._id = id;
		this.bounds = bounds;
		this._text = text;

		var data = JSON.parse(option) as Array.<string>;

		for(var i = 0; i < data.length; i++) {
			var command = data[i].split(":");
			switch(command[0]) {
				case "wordWrap": this._option.wordWrap = (command[1] == "true"); break;
				case "multiline": this._option.multiline = (command[1] == "true"); break;
				case "border": this._option.border = (command[1] == "true"); break;
				case "textColor": this._option.textColor = command[1] as number; break;
				case "borderColor": this._option.borderColor = command[1] as number; break;
				case "borderWidth": this._option.borderWidth = command[1] as number; break;
				case "maxLength": this._option.maxLength = command[1] as number; break;
				case "font": this._option.font = command[1]; break;
				case "leftMargin": this._option.leftMargin = command[1] as number; break;
				case "rightMargin": this._option.rightMargin = command[1] as number; break;
				case "align": this._option.align = command[1] as number; break;
				case "valign": this._option.valign = command[1] as number; break;
				case "fontHeight": this._option.fontHeight = command[1] as number; break;
			}
		}

		this._textCanvas = null;
		this._textWidth = 0;
		this._textHeight = 0;
		this._textDirty = true;
	}

	function constructor(id: number, bounds: Rect, text: string, option: TextShape.Option) {
		this._id = id;
		this.bounds = bounds;
		this._text = text;
		this._option = option;
		this._textCanvas = null;
		this._textWidth = 0;
		this._textHeight = 0;
		this._textDirty = true;
	}

	override function update(data: Array.<string>): void {
		assert false; // do nothing for this interface
	}

	function update(x: number, y: number, w: number, h: number, text: string,
		ww: boolean, mul: boolean, brd: boolean, tc: int, bc: int, bw: int, ml: int, ft: string, lm: int, rm: int, al: int, val: int, fh: int): void {
		if (x != this.bounds.left ||
			y != this.bounds.top ||
			w != this.bounds.width ||
			h != this.bounds.height) {
			this._textDirty = true;
			this.bounds = new Rect(x, y, w, h);
		}

		this.setText(text);

		if (! this._option.isEqual(ww, mul, brd, tc, bc, bw, ml, ft, lm, rm, al, val, fh))
			this.setOption(new TextShape.Option(ww, mul, brd, tc, bc, bw, ml, ft, lm, rm, al, val, fh));
	}

	/**
	 * set option
	 */
	function setOption(option: TextShape.Option): void {
		this._option = option;
		this._textDirty = true;
	}
	
	/**
	 * change the text of this node.
	 */
	function setText(text: string): void {
		if(this._text != text) {
			this._text = text;
			this._textDirty = true;
		}
	}
	
	static function _splitString(targetString: string, maxLineWidth: number): string[] {
		targetString = targetString.replace(/\r\n/, "\n").replace(/\r/, "\n");
		if(maxLineWidth == 0) {
			return targetString.split("\n");
		}
		
		var lines = []: string[];
		var currentLine = "";
		var currentLineWidth = 0;
		var currentWordWidth = 0;
		var currentWord = "";
		var targetStrLen = targetString.length;
		for(var charIndex = 0; charIndex < targetStrLen; charIndex++) {
			var currentChar = targetString.charAt(charIndex);
			var charWidth = TextShape._isHankaku(currentChar) ? 1 : 2;
			if(currentChar == "\n") {
				// Force newline for "\n"
				if(currentLineWidth + currentWordWidth > maxLineWidth) {
					lines.push(currentLine);
					lines.push(currentWord);
				} else {
					lines.push(currentLine + currentWord);
				}

				currentLine = "";
				currentLineWidth = 0;
				currentWord = "";
				currentWordWidth = 0;
			} else {
				if(currentWordWidth + charWidth > maxLineWidth) {
					if(currentLine == "") {
						lines.push(currentWord);
					} else {
						lines.push(currentLine);
						lines.push(currentWord);
						currentLine = "";
						currentLineWidth = 0;
					}
					currentWord = "";
					currentWordWidth = 0;
				}
				currentWord += currentChar;
				currentWordWidth += charWidth;
			}

			if(currentChar == " " || charIndex == targetStrLen - 1) {
				if(currentLineWidth + currentWordWidth > maxLineWidth) {
					// If currentLineWidth + latest letter is greater than maxLineWidth then go to newline and begin with it.
					lines.push(currentLine);
					currentLine = currentWord;
					currentLineWidth = currentWordWidth;
				} else {
					currentLine += currentWord;
					currentLineWidth += currentWordWidth;
				}
				currentWord = "";
				currentWordWidth = 0;
			}
		}
		lines.push(currentLine);

		return lines;
	}
	static const _hankakuReg = new RegExp("[\uFF61\uFF62\uFF63\uFF64\uFF65\uFF66\uFF67\uFF68\uFF69\uFF6A\uFF6B\uFF6C\uFF6D\uFF6E\uFF6F\uFF70\uFF71\uFF72\uFF73\uFF74\uFF75\uFF76\uFF77\uFF78\uFF79\uFF7A\uFF7B\uFF7C\uFF7D\uFF7E\uFF7F\uFF80\uFF81\uFF82\uFF83\uFF84\uFF85\uFF86\uFF87\uFF88\uFF89\uFF8A\uFF8B\uFF8C\uFF8D\uFF8E\uFF8F\uFF90\uFF91\uFF92\uFF93\uFF94\uFF95\uFF96\uFF97\uFF98\uFF99\uFF9A\uFF9B\uFF9C\uFF9D\uFF9E\uFF9F]");
	static function _isHankaku(c: string): boolean {
		var code = c.charCodeAt(0);
		return (0x20 <= code && code <= 0x7e) || TextShape._hankakuReg.test(c);
	}
	function _drawText(): void {
		if(!this._textCanvas) {
			this._textCanvas = dom.createElement("canvas") as __noconvert__ HTMLCanvasElement;
		}
		var textWidth = this.bounds.width - this._option.leftMargin - this._option.rightMargin;
		var fontHeight = this._option.fontHeight;
		var characterPerLine = (this._option.wordWrap && this._option.multiline)? Math.ceil(textWidth / fontHeight * 2): 0;
		var stringArray = TextShape._splitString(this._text, characterPerLine);
		var textHeight = fontHeight * stringArray.length;
		if(this._textWidth != textWidth || this._textHeight != textHeight) {
			this._textWidth = textWidth;
			this._textCanvas.width = textWidth;
			this._textHeight = textHeight;
			this._textCanvas.height = textHeight;
		}
		var ctx = this._textCanvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.font = (fontHeight as string) + "px " + (this._option.font? this._option.font: "sans-serif");
		ctx.clearRect(0, 0, textWidth, textHeight);
		ctx.fillStyle = Color.stringify(this._option.textColor);
		if(this._option.border) {
			ctx.strokeStyle = Color.stringify(this._option.borderColor);
			ctx.lineWidth = this._option.borderWidth;
		}
		ctx.textBaseline = "top";
		var x0 = 0;
		switch(this._option.align) {
		case TextShape.RIGHT:
			ctx.textAlign = "end";
			x0 = textWidth;
			break;
		case TextShape.CENTER:
			ctx.textAlign = "center";
			x0 = textWidth >> 1;
			break;
		default: // left
			ctx.textAlign = "start";
			break;
		}
		var y0 = 0;
		for(var i = 0, y = y0; i < stringArray.length; i++, y += fontHeight) {
			var str = stringArray[i];
			if(this._option.maxLength) {
				if(this._option.border) {
					ctx.strokeText(str, x0, y, this._option.maxLength);
				}
				ctx.fillText(str, x0, y, this._option.maxLength);
			} else {
				if(this._option.border) {
					ctx.strokeText(str, x0, y);
				}
				ctx.fillText(str, x0, y);
			}
		}
		this._textDirty = false;
	}
	
	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		if(this._option.textColor != color && color != Color.WHITE) {
			if(this._option.textColor == Color.WHITE) {
				this._option.textColor = color;
			} else {
				// TODO: multiply color value
				this._option.textColor = color;
			}
			this._textDirty = true;
		}
		if(TextShape.USE_CACHE) {
			if(this._textDirty) {
				this._drawText();
			}
			var x0 = this.bounds.left + this._option.leftMargin;
			var y0 = this.bounds.top;
			if(this._option.valign == TextShape.BOTTOM) {
				y0 += this.bounds.height - this._textHeight;
			} else if(this._option.valign == TextShape.MIDDLE) {
				y0 += (this.bounds.height - this._textHeight) >> 1;
			}
			ctx.drawImage(this._textCanvas, x0, y0);
			return;
		}
		var x1 = this.bounds.left + this._option.leftMargin;
		var x2 = this.bounds.left + this.bounds.width - this._option.rightMargin;
		var y1 = this.bounds.top;
		var y2 = this.bounds.top + this.bounds.height;
		
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x1, y2);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x2, y1);
		ctx.closePath();
		ctx.clip();
		//ctx.fillStyle = "red";
		//ctx.fill();
		
		var fontHeight = this._option.fontHeight;
		var characterPerLine = (this._option.wordWrap && this._option.multiline)? Math.ceil((x2 - x1) / fontHeight * 2): 0;
		
		ctx.font = (fontHeight as string) + "px " + (this._option.font? this._option.font: "sans-serif");
		ctx.fillStyle = Color.stringify(this._option.textColor);
		if(this._option.border) {
			ctx.strokeStyle = Color.stringify(this._option.borderColor);
			ctx.lineWidth = this._option.borderWidth;
		}
		ctx.textBaseline = "top";
		// todo: align
		var x0 = 0, y0 = 0;
		switch(this._option.align) {
		case TextShape.RIGHT:
			ctx.textAlign = "end";
			x0 = x2;
			break;
		case TextShape.CENTER:
			ctx.textAlign = "center";
			x0 = (x1 + x2) / 2;
			break;
		default: // left
			ctx.textAlign = "start";
			x0 = x1;
			break;
		}
		
		var stringArray = TextShape._splitString(this._text, characterPerLine);
		var totalHeight = fontHeight * stringArray.length;
		
		switch(this._option.valign) {
		case TextShape.TOP:
			y0 = y1;
			break;
		case TextShape.BOTTOM:
			y0 = y2 - totalHeight;
			break;
		case TextShape.MIDDLE:
			y0 = (y1 + y2) / 2 - totalHeight / 2;
			break;
		}
		
		
		for(var i = 0, y = y0; i < stringArray.length; i++, y += fontHeight) {
			var str = stringArray[i];
			if(this._option.maxLength) {
				if(this._option.border) {
					ctx.strokeText(str, x0, y, this._option.maxLength);
				}
				ctx.fillText(str, x0, y, this._option.maxLength);
			} else {
				if(this._option.border) {
					ctx.strokeText(str, x0, y);
				}
				ctx.fillText(str, x0, y);
			}
		}
		
		ctx.restore();
	}
	
	override function getType(): string {
		return "TextShape";
	}
}
