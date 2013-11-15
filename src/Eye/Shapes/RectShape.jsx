import "js/web.jsx";
import "../Eye.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

/**
 * RectShape class
 * 
 * <p>RectShape draws rectangle</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class RectShape implements Shape {
	var bounds: Rect;
	var isMutable = false;
	var isImage = false;
	var dirty = true;
	var lastUpdatedFrame = 0 as int;

	var _color = 0;
	var _id: int;
	
	/**
	 * create Shape with width, height and color
	 */
	function constructor(width: number, height: number, color: number = Color.createRGBA(0, 0, 0, 0)) {
		this._id = Eye._shapeCounter++;
		this._color = color;
		this.bounds = new Rect(0, 0, width, height);
	}

	// for streaming
	function constructor(id: number, bounds: Rect, color: number) {
		this._id = id;
		this.bounds = bounds;
		this._color = color;
	}

	// return true if updated
	function setColor(color: number): void {
		if(this._color != color) {
			this._color = color;
			this.dirty = true;
		}
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		if(this._color) {
			ctx.fillStyle = Color.stringify(this._color);
			ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
		}
	}

	override function getType(): string {
		return "RectShape";
	}
}
