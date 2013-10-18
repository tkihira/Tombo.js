import "Eye/Shape.jsx";
import "Eye/DisplayNode.jsx";

/** Send out serialized Tombo data to stream. */
interface Stream {
	// Eye
	function beginEyeRender(): void;
	function endEyeRender(): void;

	// Layer
	function sendLayerInfo(id: number, width: number, height: number, alpha: number, compositeOperation: string, layoutMode: int, layoutScale: number): void;
	function endLayer(id: number): void;

	// DisplayNode
	function sendDisplayNode(node:DisplayNode): void;
	function sendSetTransform(layerId: number, nodeId: number, sx : number, r0: number, r1: number, sy: number, tx: number, ty: number): void;


	function sendSave(layerId: number): void;
	function sendMatrix(layerId: number, sx : number, r0: number, r1: number, sy: number, tx: number, ty: number): void;
	function sendCompositeOperation(layerId: number, operation: string): void;
	function sendAlpha(layerId: number, alpha: number): void;
	function sendRestore(layerId: number): void;

	// Shape
	function sendShape(layerId: number, nodeId: number, shape: Shape): void;
}
