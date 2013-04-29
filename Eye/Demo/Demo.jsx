import "js/web.jsx";

import "../Eye.jsx";
import "../Layer.jsx";
import "../DisplayNode.jsx";
import "../Shapes/ImageShape.jsx";

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
		
		// load Image
		var logoImg = dom.createElement("img") as HTMLImageElement;
		logoImg.src = "img/img_titlelogo.png";
		logoImg.onload = (e) -> {
			var buttonImg = dom.createElement("img") as HTMLImageElement;
			buttonImg.src = "img/btn_start.png";
			buttonImg.onload = (e) -> {
				// create ImageShape
				var logoImageShape = new ImageShape(logoImg);
				var buttonImageShape = new ImageShape(buttonImg);
				// create Node
				var logoNode = new DisplayNode(logoImageShape, 160, 90, 0.5);
				layer.appendNode(logoNode);
				var buttonNode = new DisplayNode(buttonImageShape, 256, 290, 0.5);
				layer.appendNode(buttonNode);
				
				// you got everything prepared. just render!
				eye.render();
			};
		};
	}
}
