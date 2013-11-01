import "Eye/Shape.jsx";
import "Eye/DisplayNode.jsx";

/** Send out serialized Tombo data to stream. */
interface Stream {
	// Eye
	function beginEyeRender(): void;
	function endEyeRender(): void;

	// Layer
	function sendLayerInfo(id: int, width: int, height: int, alpha: number, compositeOperation: string, layoutMode: int, layoutScale: number): void;
	function endLayer(id: int): void;

	// DisplayNode
	function sendDisplayNode(node:DisplayNode): void;
	function sendSetTransform(layerId: int, nodeId: int, lastUpdatedFrame: int, sx : number, r0: number, r1: number, sy: number, tx: number, ty: number): void;

	function sendSave(layerId: int): void;
	function sendMatrix(layerId: int, sx : number, r0: number, r1: number, sy: number, tx: number, ty: number): void;
	function sendCompositeOperation(layerId: int, operation: string): void;
	function sendAlpha(layerId: int, alpha: number): void;
	function sendRestore(layerId: int): void;

	// Shape
	function sendShape(layerId: int, nodeId: int, shape: Shape): void;
}
