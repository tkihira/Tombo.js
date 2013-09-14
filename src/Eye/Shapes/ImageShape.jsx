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
	var _cimg: HTMLCanvasElement;
	var _img: HTMLImageElement;
	var _imgName: string;
	var _isFixedScale = false;
	var _id: number;
	
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

	function constructor(img: string, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._imgName = img;
		this.bounds = new Rect(0, 0, destWidth ?: -1, destHeight ?:-1);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
	}

	function constructor(data: Array.<string>, imgMap: Map.<HTMLCanvasElement>) {
		this._id = data[0].split(":")[1] as number;
		//var img = (imgMap[data[2].split(":")[1]] as __noconvert__ variant) as __noconvert__ HTMLImageElement;
		//this._img = img;
		this._cimg = imgMap[data[2].split(":")[1]] as HTMLCanvasElement;
		var b = data[3].split(":")[1].split(",");
		this.bounds = new Rect(b[0] as number, b[1] as number, (b[2] == "-1")? this._cimg.width: b[2] as number, (b[3] == "-1")? this._cimg.height: b[3] as number);
		this._isFixedScale = (data[4] == "true");
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		if(this._isFixedScale) {
			if(this._img) {
				ctx.drawImage(this._img, 0, 0, this._img.width, this._img.height, 0, 0, this.bounds.width, this.bounds.height);
			} else {
				ctx.drawImage(this._cimg, 0, 0, this._img.width, this._img.height, 0, 0, this.bounds.width, this.bounds.height);
			}
		} else {
			if(this._img) {
				ctx.drawImage(this._img, 0, 0);
			} else {
				ctx.drawImage(this._cimg, 0, 0);
			}
		}
	}

	override function toJsonObject(color: number): Array.<variant> {
		var json = []: Array.<variant>;
		json.push("id:" + this._id as string);
		json.push("shape:ImageShape");
		json.push("img:" + this._imgName);
		json.push("bounds:" + this.bounds.join());
		json.push("isFixedScale:" + this._isFixedScale as string);
		return json;
	}
}
