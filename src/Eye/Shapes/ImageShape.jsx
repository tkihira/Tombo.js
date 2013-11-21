import "js/web.jsx";
import "../Eye.jsx";
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
	var isImage = true;
	var dirty = true;
	var lastUpdatedFrame = 0 as int;

	var _img: HTMLImageElement;
	var _imgName: string;
	var _isFixedScale = false;
	var _id: int;
	
	/**
	 * create Shape with Image Element
	 * @param img the image element which is drawed
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.bounds = new Rect(0, 0, destWidth ?: img.width, destHeight ?:img.height);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
	}

	function constructor(img: string, width: number, height: number, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._imgName = img;
		this.bounds = new Rect(0, 0, destWidth ?: width, destHeight ?: height);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
	}

	// for streaming
	function constructor(id: number, imageId: string, bounds: Array.<variant>, isFixedScale: boolean,  imgMap: Map.<HTMLImageElement>) {
		this._id = id;
		this._imgName = imageId;
		this._img = imgMap[imageId];
		var b = bounds;
		this.bounds = new Rect(b[0] as number, b[1] as number, (b[2] == "-1")? this._img.width: b[2] as number, (b[3] == "-1")? this._img.height: b[3] as number);
		this._isFixedScale = isFixedScale;
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		if(!this._img) {
			log "Fail to draw: " + this._imgName;
			return;
		}
		if(this._isFixedScale) {
			ctx.drawImage(this._img, 0, 0, this._img.width, this._img.height, 0, 0, this.bounds.width, this.bounds.height);
		} else {
			ctx.drawImage(this._img, 0, 0);
		}
	}

	override function getType(): string {
		return "ImageShape";
	}
}
