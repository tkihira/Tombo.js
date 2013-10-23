import "js/web.jsx";
import "../BasicTypes.jsx";

/**
 * Shape interface
 * 
 * <p>Shape must be implemented these members</p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
interface Shape {
	var _id: int;

	/** the size of shape. bounds is allowed to have non-zero value (including negative) at left or top */
	var bounds: Rect;
	/** false if shape never change */
	var isMutable: boolean;
	/** true if this shape is an image. */
	var isImage: boolean;

	var _lastUpdatedFrame: int;
	
	/** draw shape on the context */
	function draw(ctx: CanvasRenderingContext2D, color: number): void;

	/** update with JSON. return true if updated, false if nothing changed */
	function update(data: Array.<string>): boolean;

	/** since JSX does not have reflection */
	function getType(): string;
}
