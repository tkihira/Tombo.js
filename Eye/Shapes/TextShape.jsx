import "js/web.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

class TextShape implements Shape {
	var bounds: Rect;
	var isMutable = true;
	
	static const LEFT = 0;
	static const RIGHT = 1;
	static const CENTER = 2;
	class Option {
		var wordWrap = false;
		var multiline = false;
		var textColor = Color.createRGB(255, 255, 255);
		var maxLength = 0;
		var font = "";
		var fontClass = "";
		//var autoSize = false;
		var leftMargin = 0;
		var rightMargin = 0;
		var align = TextShape.LEFT;
		var fontHeight = 30;
	}
	
	var text: string;
	var option = new TextShape.Option;
	
	function constructor(width: number, height: number, text: string) {
		this.bounds = new Rect(0, 0, width, height);
		this.text = text;
	}
	
	function setOption(option: TextShape.Option): void {
		this.option = option;
	}
	
	static function splitString(targetString: string, maxLineWidth: number): string[] {
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
			var charWidth = TextShape.isHankaku(currentChar) ? 1 : 2;
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
	static const hankakuReg = new RegExp("[\uFF61\uFF62\uFF63\uFF64\uFF65\uFF66\uFF67\uFF68\uFF69\uFF6A\uFF6B\uFF6C\uFF6D\uFF6E\uFF6F\uFF70\uFF71\uFF72\uFF73\uFF74\uFF75\uFF76\uFF77\uFF78\uFF79\uFF7A\uFF7B\uFF7C\uFF7D\uFF7E\uFF7F\uFF80\uFF81\uFF82\uFF83\uFF84\uFF85\uFF86\uFF87\uFF88\uFF89\uFF8A\uFF8B\uFF8C\uFF8D\uFF8E\uFF8F\uFF90\uFF91\uFF92\uFF93\uFF94\uFF95\uFF96\uFF97\uFF98\uFF99\uFF9A\uFF9B\uFF9C\uFF9D\uFF9E\uFF9F]");
	static function isHankaku(c: string): boolean {
		var code = c.charCodeAt(0);
		return (0x20 <= code && code <= 0x7e) || TextShape.hankakuReg.test(c);
	}
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		var x1 = this.bounds.left + this.option.leftMargin;
		var x2 = this.bounds.left + this.bounds.width - this.option.rightMargin;
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
		
		var fontHeight = this.option.fontHeight;
		var characterPerLine = (this.option.wordWrap && this.option.multiline)? Math.ceil((x2 - x1) / fontHeight * 2): 0;
		log characterPerLine;
		
		ctx.font = (fontHeight as string) + "px " + (this.option.font? this.option.font: "sans-serif");
		ctx.fillStyle = Color.stringify(this.option.textColor);
		ctx.textBaseline = "top";
		// todo: align
		var x0 = 0, y0 = 0;
		switch(this.option.align) {
		case TextShape.RIGHT:
			ctx.textAlign = "end";
			x0 = x2 - 4;
			y0 = y1 + 2;
			break;
		case TextShape.CENTER:
			ctx.textAlign = "center";
			x0 = (x1 + x2) / 2 + 2;
			y0 = y1 + 2;
			break;
		default: // left
			ctx.textAlign = "start";
			x0 = x1 + 2;
			y0 = y1 + 2;
			break;
		}
		
		var stringArray = TextShape.splitString(this.text, characterPerLine);
		for(var i = 0, y = y0; i < stringArray.length; i++, y += fontHeight) {
			ctx.fillText(stringArray[i], x0, y);
		}
		
		ctx.restore();
	}
}
