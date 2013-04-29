import "js/web.jsx";
import "../BasicTypes.jsx";

interface Shape {
	var bounds: Rect;
	function draw(ctx: CanvasRenderingContext2D): void;
}