import "js/web.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

class TextShape implements Shape {
	var bounds: Rect;
	var isMutable = true;
	
	static const LEFT = 0x01;
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
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		var x1 = this.bounds.left + this.option.leftMargin;
		var x2 = this.bounds.left + this.bounds.width - this.option.rightMargin;
		var y1 = this.bounds.top;
		var y2 = this.bounds.top + this.bounds.height;
		
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x1, y2);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x2, y1);
		ctx.closePath();
		
		var fontHeight = this.option.fontHeight;
		var characterPerLine = (this.option.wordWrap && this.option.multiline)? Math.ceil((x2 - x1) / fontHeight * 2): 0;
		
		ctx.font = (fontHeight as string) + "px " + (this.option.font? this.option.font: "sans-serif");
		ctx.fillStyle = Color.stringify(this.option.textColor);
		ctx.textBaseline = "top";
		// todo: align
		var x0 = 0, y0 = 0;
		ctx.textAlign = "start";
		x0 = x1 + 2;
		y0 = y1 + 2;
		
		// TODO: support multi line
		ctx.fillText(this.text, x0, y0);
		
		//throw "implementin";
	}
}
