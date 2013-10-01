import "Eye/Shape.jsx";

/** Send out serialized Tombo data to stream. */
interface Sink {
	function sendLayerCount(layerCount: number): void;
	function sendLayerInfo(id: number, width: number, height: number, alpha: number, compositeOperation: string, layoutMode: int, layoutScale: number): void;
	function endLayer(id: number): void;

	function sendSave(layerId: number): void;
	function sendMatrix(layerId: number, sx : number, r0: number, r1: number, sy: number, tx: number, ty: number): void;
	function sendCompositeOperation(layerId: number, operation: string): void;
	function sendAlpha(layerId: number, alpha: number): void;
	function sendRestore(layerId: number): void;
	function sendShape(layerId: number, shape: Shape): void;
}
