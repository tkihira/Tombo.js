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

	function sendSave(layerId: number): void;
	function sendMatrix(layerId: number, sx : number, r0: number, r1: number, sy: number, tx: number, ty: number): void;
	function sendCompositeOperation(layerId: number, operation: string): void;
	function sendAlpha(layerId: number, alpha: number): void;
	function sendRestore(layerId: number): void;
}

class Stream {
	// sender
	static var nodesInLayers = []: Array.<variant>;

	static function append(layerId: number, value: Array.<variant>): void {
		if (! Stream.nodesInLayers[layerId]) {
			Stream.nodesInLayers[layerId] = []: Array.<variant>;
		}

		(Stream.nodesInLayers[layerId] as Array.<variant>).push(value);
	}
	static function toJson(): string {
		var ret = JSON.stringify(Stream.nodesInLayers);
		Stream.nodesInLayers = []: Array.<variant>;
		return ret;
	}

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


	// receiver
	static var canvas: HTMLCanvasElement = null;
	static var layers = []: Array.<Layer>;
	static function setCanvas(canvas: HTMLCanvasElement): void {
		Stream.canvas = canvas;
	}
	static var imgMap: Map.<HTMLCanvasElement>;
	static function build(json: string, imgMap: Map.<HTMLCanvasElement>): void {
		Stream.imgMap = imgMap;
		var nodesInLayers = JSON.parse(json) as Array.<variant>;
		var canvas = Stream.canvas;
		var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.fillStyle = "#888888";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < nodesInLayers.length; i++) {
			var layer = Stream.layers[i];
			assert layer != null;
			layer._ctx.clearRect(0, 0, layer.width, layer.height);

			var nodesData = nodesInLayers[i] as Array.<variant>;
			for(var j = 0; j < nodesData.length; j++) {
				var nodeData = nodesData[j] as Array.<variant>;
				Stream.dealNodeData(nodeData, layer._ctx);
			}
			var transform = Eye._calculateLayoutTransform(canvas.width, canvas.height, layer);
			ctx.drawImage(layer._canvas, transform.left, transform.top);
		}
	}
	static function dealNodeData(nodeData: Array.<variant>, ctx: CanvasRenderingContext2D): void {
		for(var i = 0; i < nodeData.length; i++) {
			var data = nodeData[i];
			if(typeof data != "string") {
				var shapeData = data as Array.<string>;
				Stream.drawShape(shapeData, ctx);
			}
		}
	}
	static var shapes = []: Array.<Shape>;
	static function drawShape(shapeData: Array.<string>, ctx: CanvasRenderingContext2D): void {
		var id = shapeData[0].split(":")[1] as number;
		if(Stream.shapes[id]) {
			Stream.shapes[id].update(shapeData);
		} else {
			// TODO: make it factory
			switch(shapeData[1].split(":")[1]) {
			case "ImageShape":
				Stream.shapes[id] = new ImageShape(shapeData, Stream.imgMap); break;
			case "AnimationImageShape":
				Stream.shapes[id] = new AnimationImageShape(shapeData, Stream.imgMap); break;
			case "TextShape":
				Stream.shapes[id] = new TextShape(shapeData); break;
			case "RectShape":
				Stream.shapes[id] = new RectShape(shapeData); break;
			}
		}
		if(Stream.shapes[id]) {
			Stream.shapes[id].draw(ctx, Color.createRGB(255, 255, 255));
		}
	}
}
