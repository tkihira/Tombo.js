import "js/web.jsx";

import "Eye/Eye.jsx";
import "Eye/Layer.jsx";
import "Eye/DisplayNode.jsx";
import "Eye/Shapes/ImageShape.jsx";

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
				var logoNode = new DisplayNode(logoImageShape, 160, 90, 0.5, 0.5);
				layer.root.appendChild(logoNode);
				var buttonNode = new DisplayNode(buttonImageShape, 256, 290, 0.5, 0.5);
				buttonNode.setTouchable(true);
				layer.root.appendChild(buttonNode);
				
				// you got everything prepared. just render!
				eye.render();
				
				canvas.addEventListener("mousedown", (e) -> {
					var m = e as MouseEvent;
					if(m) {
						var x = m.clientX - canvas.offsetLeft + dom.window.scrollX;
						var y = m.clientY - canvas.offsetTop + dom.window.scrollY;
						if(eye.findTouchedNode(x, y) == buttonNode) {
							dom.window.alert("button clicked");
						}
					}
				});
			};
		};
	}
}
