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

class Stream {
	// sender
	static var _sink: Sink;
	static function setSink(sink: Sink): void {
		assert Stream._sink == null;
		Stream._sink = sink;
	}

	//  for Layer
	static function sendLayerCount(layerCount: number): void {
		if (! Stream._sink) {
			log 'sendLayerCount: Sink not set';
			return;
		}
		Stream._sink.sendLayerCount(layerCount);
	}

	static function sendLayerInfo(layer: Layer): void {
		if (! Stream._sink) {
			log 'sendLayerInfo: Sink not set';
			return;
		}
		Stream._sink.sendLayerInfo(layer._id, layer.width, layer.height, layer._alpha, layer._compositeOperation, layer.layout.layoutMode, layer.layout.scale);
	}

	static function endLayer(layer: Layer): void {
		if (! Stream._sink) {
			log 'endLayer: Sink not set';
			return;
		}
		Stream._sink.endLayer(layer._id);
	}

	// for DisplayNode
	static function sendSave(node: DisplayNode): void {
		Stream._sink.sendSave(node._layer._id);
	}

	static function sendMatrix(node: DisplayNode, matrix: Array.<number>): void {
		Stream._sink.sendMatrix(node._layer._id, matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
	}

	static function sendCompositeOperation(node: DisplayNode): void {
		Stream._sink.sendCompositeOperation(node._layer._id, node._compositeOperation);
	}

	static function sendAlpha(node: DisplayNode, alpha: number): void {
		Stream._sink.sendAlpha(node._layer._id, alpha);
	}

	static function sendRestore(node: DisplayNode): void {
		Stream._sink.sendRestore(node._layer._id);
	}

	// for Shape
	static function sendShape(node: DisplayNode, shape: Shape): void {
		Stream._sink.sendShape(node._layer._id, shape);
	}
}
