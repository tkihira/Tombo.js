import "js/web.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

class ImageShape implements Shape {
	var bounds: Rect;
	
	var img: HTMLImageElement;
	
	function constructor(img: HTMLImageElement) {
		this.img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.bounds = new Rect(0, 0, img.width, img.height);
	}
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(this.img, 0, 0);
	}
}
