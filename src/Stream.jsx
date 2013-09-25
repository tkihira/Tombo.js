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

interface Sink {
	function sendLayerCount(layerCount: number): void;
	function sendLayerInfo(id: number, width: number, height: number, layoutScale: number): void;
}

class Stream {
	// sender
	static var json = []: Array.<variant>;

	static function append(value: Array.<variant>): void {
		(Stream.json[Stream.json.length - 1]["nodes"] as Array.<variant>).push(value);
	}
	static function appendLayer(id: number, width:number, height: number, alpha: number, compositeOperation: string, layoutMode: int, scale: number): void {
		var layer = {}: Map.<variant>;
		layer["id"] = id;
		layer["width"] = width;
		layer["height"] = height;
		layer["alpha"] = alpha;
		layer["compositeOperation"] = compositeOperation;
		layer["nodes"] = []: Array.<variant>;
		layer["layoutMode"] = layoutMode;
		layer["scale"] = scale;
		Stream.json.push(layer);
	}
	static function toJson(): string {
		var ret = JSON.stringify(Stream.json);
		Stream.json = []: Array.<variant>;
		return ret;
	}

	static var _sink: Sink;
	static function setSink(sink: Sink): void {
		assert Stream._sink == null;
		Stream._sink = sink;
	}

	static function sendLayerCount(layerCount: number): void {
		if (! Stream._sink) {
			log 'sendLayerCount: Sink not set';
			return;
		}
		Stream._sink.sendLayerCount(layerCount);
	}

	static function sendLayerInfo(id: number, width: number, height: number, scale: number): void {
		if (! Stream._sink) {
			log 'sendLayerInfo: Sink not set';
			return;
		}
		Stream._sink.sendLayerInfo(id, width, height, scale);
	}


	// receiver
	static var canvas: HTMLCanvasElement = null;
	static var layers = []: Array.<Layer>;
	static function setCanvas(canvas: HTMLCanvasElement): void {
		Stream.canvas = canvas;
	}
	static var imgMap: Map.<HTMLCanvasElement>;
	static function build(json: string, imgMap: Map.<HTMLCanvasElement>): void {
		Eye.USE_STREAM = false;
		Stream.imgMap = imgMap;
		var obj = JSON.parse(json) as Array.<variant>;
		var canvas = Stream.canvas;
		var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.fillStyle = "#888888";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < obj.length; i++) {
			var layerData = obj[i] as Map.<variant>;
			var id = layerData["id"] as number;
			if(!Stream.layers[id]) {
				var layout = new LayoutInformation(layerData["layoutMode"] as int);
				Stream.layers[id] = new Layer(layerData["width"] as number, layerData["height"] as number, layout, id);
				Stream.layers[id]._setLayoutScale(layerData["scale"] as number);
			}
			var layer = Stream.layers[id];
			layer._ctx.clearRect(0, 0, layer.width, layer.height);
			var nodesData = layerData["nodes"] as Array.<variant>;
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
			if(typeof data == "string") {
				var command = (data as string).split(":");
				switch(command[0]) {
				case "save":
					ctx.save();
					break;
				case "matrix":
					js.invoke(ctx, "transform", command[1].split(",") as __noconvert__ variant[]);
					break;
				case "alpha":
					ctx.globalAlpha = command[1] as number;
					break;
				case "restore":
					ctx.restore();
					break;
				case "node":
					break;
				default:
					log "unknown command:" + command[0];
				}
			} else {
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
