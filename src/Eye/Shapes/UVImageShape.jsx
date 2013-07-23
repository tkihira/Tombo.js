import "js/web.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";
import "PartialImage.jsx";

/**
 * UVImageShape class
 * 
 * <p>UVImageShape assumes that it has one large image, and draw the separate image located UV coord.</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class UVImageShape implements Shape, PartialImage {
	var isMutable = false;
	var isImage = true;
	
	/**
	 * create Shape with Image Element
	 * @param img an image element
	 * @param uvs Array.<number>(4) Specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height. The four coordinates represent the U origin, the V origin, the U width, and the V height, in that order. Set [0, 0, 1, 1] if you want to display the entire image.
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, uvs: Array.<number>, destWidth: number = 0, destHeight: number = 0) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[UVImageShape#constructor] image is not initialized");
		}
		this.setRect(img.width * uvs[0], img.height * uvs[1], img.width * uvs[2], img.height * uvs[3]);
		this.bounds = new Rect(0, 0, destWidth ?: this.width, destHeight ?:this.height);
	}

	/**
	 * create Shape with Image Element
	 * @param img an image element
	 * @param left the left value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * @param top the top value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * @param width the width value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * @param height the height value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, left: number, top: number, width: number, height: number, destWidth: number = 0, destHeight: number = 0) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[UVImageShape#constructor] image is not initialized");
		}
		this.setRect(img.width * left, img.height * top, img.width * width, img.height * height);
		this.bounds = new Rect(0, 0, destWidth ?: this.width, destHeight ?:this.height);
	}
}
