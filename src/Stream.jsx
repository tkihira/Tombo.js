import "js/web.jsx";
import "js.jsx";

import "BasicTypes.jsx";
import "Eye/Eye.jsx";
import "Eye/Shape.jsx";
import "Eye/Layer.jsx";
import "Eye/LayoutInformation.jsx";

import "Eye/Shapes/AnimationImageShape.jsx";
import "Eye/Shapes/ImageShape.jsx";
import "Eye/Shapes/TextShape.jsx";
import "Eye/Shapes/RectShape.jsx";
import "Eye/DisplayNode.jsx";

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
