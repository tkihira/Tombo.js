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
	var _color = 0;
	var _id: number;
	
	/**
	 * create Shape with width, height and color
	 */
	function constructor(width: number, height: number, color: number = Color.createRGBA(0, 0, 0, 0)) {
		this._id = Eye._shapeCounter++;
		this._color = color;
		this.bounds = new Rect(0, 0, width, height);
	}

	function constructor(data: Array.<string>) {
		this._id = data[0].split(":")[1] as number;
		var b = data[2].split(":")[1].split(",");
		this.bounds = new Rect(b[0] as number, b[1] as number, b[2] as number, b[3] as number);
		this._color = data[3].split(":")[1] as number;
	}

	override function update(data: Array.<string>): void {
		this._color = data[3].split(":")[1] as number;
	}

	function setColor(color: number): void {
		if(this._color != color) {
			this._color = color;
			// TODO: set dirty flag
		}
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		if(this._color) {
			ctx.fillStyle = Color.stringify(this._color);
			ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
		}
	}

	override function toJsonObject(color: number): Array.<variant> {
		var json = []: Array.<variant>;
		json.push("id:" + this._id as string);
		json.push("shape:RectShape");
		json.push("bounds:" + this.bounds.join());
		json.push("color:" + this._color as string);
		return json;
	}
}
