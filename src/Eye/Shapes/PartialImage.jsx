// mixin for drawing partial image
import "js/web.jsx";

mixin PartialImage {
	
	var left: number;
	var top: number;
	var width: number;
	var height: number;
	var _img: HTMLImageElement;
    var offsetX: number;
    var offsetY: number;
	
	function setRect(left: number, top: number, width: number, height: number): void {
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
	}
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(this._img, this.left, this.top, this.width, this.height, this.offsetX, this.offsetY, this.width, this.height);
	}
}
