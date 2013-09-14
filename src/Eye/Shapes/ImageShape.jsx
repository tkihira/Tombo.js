import "js/web.jsx";
import "../Eye.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

interface _Image {
	function drawImage(ctx : CanvasRenderingContext2D, width : number, height : number) : void;
	function drawImage(ctx : CanvasRenderingContext2D) : void;

	function getWidth() : number;
	function getHeight() : number;
}

class _ImageHolder.<CanvasOrImageElement> implements _Image {
	var _img : CanvasOrImageElement;


	function constructor(img : CanvasOrImageElement) {
		this._img = img;
	}

	override function drawImage(ctx : CanvasRenderingContext2D, width : number, height : number) : void {
		ctx.drawImage(this._img, 0, 0, this.getWidth(), this.getHeight(), 0, 0, width, height);
	}
	override function drawImage(ctx : CanvasRenderingContext2D) : void {
		ctx.drawImage(this._img, 0, 0);
	}

	override function getWidth() : number {
		return this._img.width;
	}

	override function getHeight() : number {
		return this._img.height;
	}
}

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
	var _img: _Image;
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
		this._img = new _ImageHolder.<HTMLImageElement>(img);
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.bounds = new Rect(0, 0, destWidth ?: img.width, destHeight ?:img.height);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
	}

	function constructor(img: string, width: number = -1, height: number = -1, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._imgName = img;
		this.bounds = new Rect(0, 0, destWidth ?: width, destHeight ?: height);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
	}

	function constructor(data: Array.<string>, imgMap: Map.<HTMLCanvasElement>) {
		this._id = data[0].split(":")[1] as number;
		//var img = (imgMap[data[2].split(":")[1]] as __noconvert__ variant) as __noconvert__ HTMLImageElement;
		//this._img = img;
		var cimg = imgMap[data[2].split(":")[1]];
		this._img = new _ImageHolder.<HTMLCanvasElement>(cimg);
		var b = data[3].split(":")[1].split(",");
		this.bounds = new Rect(b[0] as number, b[1] as number, (b[2] == "-1")? cimg.width: b[2] as number, (b[3] == "-1")? cimg.height: b[3] as number);
		this._isFixedScale = (data[4] == "true");
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		if(this._isFixedScale) {
			this._img.drawImage(ctx, this.bounds.width, this.bounds.height);
		} else {
			this._img.drawImage(ctx);
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
