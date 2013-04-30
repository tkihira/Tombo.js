import "js/web.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

/**
 * ImageShape class
 * 
 * <p>ImageShape has only one image, and draw the image as is</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class ImageShape implements Shape {
	var bounds: Rect;
	var isMutable = false;
	var _img: HTMLImageElement;
	
	/**
	 * create Shape with Image Element
	 */
	function constructor(img: HTMLImageElement) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.bounds = new Rect(0, 0, img.width, img.height);
	}
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(this._img, 0, 0);
	}
}
