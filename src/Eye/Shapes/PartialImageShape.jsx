import "js/web.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";
import "PartialImage.jsx";

/**
 * PartialImageShape class
 * 
 * <p>PartialImageShape assumes that it has one large image, and draw the separate image located left/top/width/height.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class PartialImageShape implements Shape, PartialImage {
	var isMutable = false;
	var isImage = true;
	
	/**
	 * create Shape with Image Element
	 * @param img an image element
	 * @param frame Array.<number>(4) Specified in pixel coordinates ranging from 0 to img.width/height. The four coordinates represent left, top, width, and height, in that order. Set [0, 0, img.width, img.height] if you want to display the entire image.
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, frame: Array.<number>, destWidth: number = 0, destHeight: number = 0) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[PartialImageShape#constructor] image is not initialized");
		}
		this.setRect(frame[0], frame[1], frame[2], frame[3]);
		this.bounds = new Rect(0, 0, destWidth ?: this.width, destHeight ?:this.height);
	}

	/**
	 * create Shape with Image Element
	 * @param img an image element
	 * @param left the left value specified in pixel.
	 * @param top the top value specified in pixel.
	 * @param width the width value specified in pixel.
	 * @param height the height value specified in pixel.
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, left: number, top: number, width: number, height: number, destWidth: number = 0, destHeight: number = 0) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[PartialImageShape#constructor] image is not initialized");
		}
		this.setRect(left, top, width, height);
		this.bounds = new Rect(0, 0, destWidth ?: this.width, destHeight ?:this.height);
	}
}
