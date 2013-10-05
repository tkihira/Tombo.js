import "js/web.jsx";
import "../Eye.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

/**
 * AnimationImageShape class
 * 
 * <p>AnimationImageShape has only one image which contains animation frames, and draw the specified frame's image </p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class AnimationImageShape implements Shape {
	var bounds: Rect;
	var isMutable = true;
	var isImage = true;
	var _cimg: HTMLCanvasElement;
	var _img: HTMLImageElement;
	var _imgName: string;
	var _isFixedScale = false;
	var _id: number;
	var _frame = 0;
	
	var _cols: number;
	var _rows: number;
	
	var _partialWidth: number;
	var _partialHeight: number;
	
	/**
	 * create Shape with Image Element
	 * @param img the image element which is drawed
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, frameCols: number, frameRows: number, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.bounds = new Rect(0, 0, destWidth ?: img.width / frameCols, destHeight ?:img.height / frameRows);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
		this._cols = frameCols;
		this._rows = frameRows;
		this._partialWidth = img.width / this._cols;
		this._partialHeight = img.height / this._rows;
	}

	function constructor(img: string, frameCols: number, frameRows: number, width: number, height: number, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._imgName = img;
		this.bounds = new Rect(0, 0, destWidth ?: width / frameCols, destHeight ?: height / frameRows);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
		this._cols = frameCols;
		this._rows = frameRows;
		this._partialWidth = width / this._cols;
		this._partialHeight = height / this._rows;
	}

	function constructor(data: Array.<string>, imgMap: Map.<HTMLCanvasElement>) {
		this._id = data[0].split(":")[1] as number;
		//var img = (imgMap[data[2].split(":")[1]] as __noconvert__ variant) as __noconvert__ HTMLImageElement;
		//this._img = img;
		this._cimg = imgMap[data[2].split(":")[1]] as HTMLCanvasElement;
		var b = data[3].split(":")[1].split(",");
		this.bounds = new Rect(b[0] as number, b[1] as number, (b[2] == "-1")? this._cimg.width: b[2] as number, (b[3] == "-1")? this._cimg.height: b[3] as number);
		this._isFixedScale = (data[4] == "true");
		this._cols = data[5].split(":")[1] as number;
		this._rows = data[6].split(":")[1] as number;
		this._frame = data[7].split(":")[1] as number;
		this._partialWidth = this._cimg.width / this._cols;
		this._partialHeight = this._cimg.height / this._rows;
	}

	function constructor(id: number, imageId: string, bounds: Array.<variant>, isFixedScale: boolean, cols: number, rows: number, frame: number, imgMap: Map.<HTMLCanvasElement>) {
		log 'AnimationImageShape ctor 2: ';
		this._id = id;
		this._cimg = imgMap[imageId] as HTMLCanvasElement;
		var b = bounds;
		this.bounds = new Rect(b[0] as number, b[1] as number, (b[2] == "-1")? this._cimg.width: b[2] as number, (b[3] == "-1")? this._cimg.height: b[3] as number);
		this._isFixedScale = isFixedScale;
		this._cols = cols;
		this._rows = rows;
		this._frame = frame;

		this._partialWidth = this._cimg.width / this._cols;
		this._partialHeight = this._cimg.height / this._rows;
	}

	override function update(data: Array.<string>): void {
		this._frame = data[7].split(":")[1] as number;
	}

	function update(nextFrame: number): void {
		this._frame = nextFrame;
	}

	function setFrame(frame: number): void {
		this._frame = frame;
	}
	function getFrame(): number{
		return this._frame;
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		var x = (this._frame % this._cols) * this._partialWidth;
		var y = ((this._frame / this._cols) as int) * this._partialHeight;
		
		if(this._isFixedScale) {
			if(this._img) {
				ctx.drawImage(this._img, x, y, this._partialWidth, this._partialHeight, 0, 0, this.bounds.width, this.bounds.height);
			} else {
				ctx.drawImage(this._cimg, x, y, this._partialWidth, this._partialHeight, 0, 0, this.bounds.width, this.bounds.height);
			}
		} else {
			if(this._img) {
				ctx.drawImage(this._img, x, y, this._partialWidth, this._partialHeight, 0, 0, this._partialWidth, this._partialHeight);
			} else {
				ctx.drawImage(this._cimg, x, y, this._partialWidth, this._partialHeight, 0, 0, this._partialWidth, this._partialHeight);
			}
		}
	}
	
	override function getType(): string {
		return "AnimationImageShape";
	}
}
