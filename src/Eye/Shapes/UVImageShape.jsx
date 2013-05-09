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
	var bounds: Rect;
	var isMutable = false;
	
	/**
	 * create Shape with Image Element
	 * @param img an image element
	 * @param uvs Array.<number>(4) Specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height. The four coordinates represent the U origin, the V origin, the U width, and the V height, in that order. Set [0, 0, 1, 1] if you want to display the entire image.
	 */
	function constructor(img: HTMLImageElement, uvs: Array.<number>) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.setRect(img.width * uvs[0], img.height * uvs[1], img.width * uvs[2], img.height * uvs[3]);
		this.bounds = new Rect(0, 0, this.width, this.height);
	}

	/**
	 * create Shape with Image Element
	 * @param img an image element
	 * @param left the left value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * @param top the top value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * @param width the width value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 * @param height the height value specified in UV coordinates ranging from 0 to 1, which represent a percentage of the original image's width and height.
	 */
	function constructor(img: HTMLImageElement, left: number, top: number, width: number, height: number) {
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.setRect(img.width * left, img.height * top, img.width * width, img.height * height);
		this.bounds = new Rect(0, 0, this.width, this.height);
	}
}
