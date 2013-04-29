import "js/web.jsx";
import "../BasicTypes.jsx";

interface Shape {
	var bounds: Rect;
	var isMutable: boolean;
	
	function draw(ctx: CanvasRenderingContext2D): void;
}
