import "js/web.jsx";

import "../Eye.jsx";
import "../Layer.jsx";
import "../DisplayNode.jsx";
import "../Shapes/ImageShape.jsx";
import "../Shapes/TextShape.jsx";

class _Main {
	static function main(args: string[]): void {
		var canvas = dom.createElement("canvas") as HTMLCanvasElement;
		canvas.width = 640;
		canvas.height = 960;
		dom.document.body.appendChild(canvas);
		
		// initialize Eye
		var eye = new Eye(canvas);
		
		// create Layer
		var layer = new Layer(640, 640);
		eye.appendLayer(layer);
		
		// create TextShape
		var textShape = new TextShape(320, 320, "very long long long long initial text");
		var option = new TextShape.Option();
		option.align = TextShape.LEFT;
		option.multiline = true;
		option.wordWrap = true;
		textShape.setOption(option);
		// create Node
		var textNode = new DisplayNode(textShape, 160, 160, 1);
		layer.root.appendChild(textNode);
		
		// you got everything prepared. just render!
		eye.render();
	}
}
