// mixin for drawing partial image
import "js/web.jsx";
import "../../BasicTypes.jsx";

mixin PartialImage {
	
	var left: number;
	var top: number;
	var width: number;
	var height: number;
	var bounds: Rect;
	var anchorX: number;
	var anchorY: number;
	var _img: HTMLImageElement;
	
	function setRect(left: number, top: number, width: number, height: number): void {
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		this.anchorX = 0;
		this.anchorY = 0;
	}

	function setRect(left: number, top: number, width: number, height: number, anchorX:number, anchorY: number): void {
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		this.anchorX = anchorX;
		this.anchorY = anchorY;
	}
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(this._img, this.left, this.top, this.width, this.height, this.anchorX, this.anchorY, this.bounds.width, this.bounds.height);
	}
}
