import "js/web.jsx";
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
	var _color = 0;
	
	/**
	 * create Shape with width, height and color
	 */
	function constructor(width: number, height: number, color: number = Color.createRGBA(0, 0, 0, 0)) {
		this._color = color;
		this.bounds = new Rect(0, 0, width, height);
	}
	
	override function draw(ctx: CanvasRenderingContext2D): void {
		if(this._color) {
			ctx.fillStyle = Color.stringify(this._color);
			ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
		}
	}
}
