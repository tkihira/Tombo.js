import "js/web.jsx";
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
		var wordWrap = false;
		/** multiline: default false */
		var multiline = false;
		/** border: default false */
		var border = false;
		/** textColor: default rgb(255,255,255) */
		var textColor = Color.createRGB(255, 255, 255);
		/** borderColor: default rgb(0,0,0) */
		var borderColor = Color.createRGB(0, 0, 0);
		/** borderWidth: default 1 */
		var borderWidth = 1;
		/** maxLength: 0 if disable */
		var maxLength = 0;
		/** font: font name*/
		var font = "";
		//** fontClass: font class name*/
		//var fontClass = "";
		//var autoSize = false;
		/** leftMargin: default 0 */
		var leftMargin = 0;
		/** rightMargin: default 0 */
		var rightMargin = 0;
		/** align: default TextShape.LEFT */
		var align = TextShape.LEFT;
		/** valign: default TextShape.TOP */
		var valign = TextShape.TOP;
		/** fontHeight: default 30 */
		var fontHeight = 30;
	}
	
	var _text: string;
	var _option = new TextShape.Option;
	
	/**
	 * create TextNode with the size and initial text
	 */
	function constructor(width: number, height: number, text: string) {
		this.bounds = new Rect(0, 0, width, height);
		this._text = text;
	}
	
	/**
	 * set option
	 */
	function setOption(option: TextShape.Option): void {
		this._option = option;
		// todo: set dirty flag
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
	
	override function draw(ctx: CanvasRenderingContext2D): void {
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
			x0 = x2 - 4;
			break;
		case TextShape.CENTER:
			ctx.textAlign = "center";
			x0 = (x1 + x2) / 2 + 2;
			break;
		default: // left
			ctx.textAlign = "start";
			x0 = x1 + 2;
			break;
		}
		
		var stringArray = TextShape._splitString(this._text, characterPerLine);
		var totalHeight = fontHeight * stringArray.length;
		
		switch(this._option.valign) {
		case TextShape.TOP:
			y0 = y1 + 2;
			break;
		case TextShape.BOTTOM:
			y0 = y2 - 2 - totalHeight;
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
}
