import "js/web.jsx";

import "BasicTypes.jsx";
import "Eye/Eye.jsx";
import "Eye/Layer.jsx";
import "Eye/DisplayNode.jsx";
import "Eye/Shapes/ImageShape.jsx";
import "Eye/Shapes/TextShape.jsx";

class _Main {
	static function main(args: string[]): void {
		var size = dom.window.location.hash.substring(1).split(",").concat(["",""]);
		var canvas = dom.createElement("canvas") as HTMLCanvasElement;
		canvas.width = (size[0] as number)? size[0] as number: 640;
		canvas.height = (size[1] as number)? size[1] as number: 960;
		dom.document.body.appendChild(canvas);
		
		// initialize Eye
		var eye = new Eye(canvas);
		
		// create Layer
		var layer = new Layer(640, 640);
		eye.appendLayer(layer);
		
		// create TextShape
		var textShape = new TextShape(320, 320, "very long long long long initial text");
		var option = new TextShape.Option();
		option.align = TextShape.CENTER;
		option.multiline = true;
		option.wordWrap = true;
		option.border = true;
		option.fontHeight = 50;
		option.textColor = Color.createRGB(0,255,255);
		option.borderColor = Color.createRGB(255,0,0);
		option.borderWidth = 2.5;
		textShape.setOption(option);
		// create Node
		var textNode = new DisplayNode(textShape, 160, 160, 1, 1);
		layer.root.appendChild(textNode);
		
		// you got everything prepared. just render!
		eye.render();
	}
}
