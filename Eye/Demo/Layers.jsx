import "js/web.jsx";

import "../Eye.jsx";
import "../Layer.jsx";
import "../LayoutInformation.jsx";
import "../DisplayNode.jsx";
import "../DisplayGroup.jsx";
import "../Shapes/ImageShape.jsx";
import "../Shapes/TextShape.jsx";

class _Main {
	static var imgMap = {}: Map.<HTMLImageElement>;
	static var canvas: HTMLCanvasElement;
	static function start(): void {
		// initialize Eye
		var canvas = _Main.canvas;
		var eye = new Eye(canvas);
		
		// create Layer
		var topLayer = new Layer(640, 900, new LayoutInformation(LayoutInformation.CENTER | LayoutInformation.TOP | LayoutInformation.AUTO_SCALE));
		eye.appendLayer(topLayer);
		var bottomLayer = new Layer(640, 87, new LayoutInformation(LayoutInformation.CENTER | LayoutInformation.BOTTOM | LayoutInformation.AUTO_SCALE));
		eye.appendLayer(bottomLayer);
		var centerLayer = new Layer(640, 640);
		eye.appendLayer(centerLayer);
		
		// create nodes
		var topImageShape = new ImageShape(_Main.imgMap["top.png"]);
		var topNode = new DisplayNode(topImageShape, 0, 0);
		topLayer.root.appendChild(topNode);
		var bottomImageShape = new ImageShape(_Main.imgMap["bottom.png"]);
		var bottomNode = new DisplayNode(bottomImageShape, 0, 0);
		bottomLayer.root.appendChild(bottomNode);
		
		// create group
		var dialog = new DisplayGroup(44, 69);
		centerLayer.root.appendChild(dialog);
		dialog.setScale(0);
		// create dialog
		var dialogAreaShape = new ImageShape(_Main.imgMap["bg_dialogarea.png"]);
		var dialogAreaNode = new DisplayNode(dialogAreaShape, 0, 0);
		dialog.appendChild(dialogAreaNode);
		var dialogBoxShape = new ImageShape(_Main.imgMap["bg_dialogbox.png"]);
		var dialogBoxNode = new DisplayNode(dialogBoxShape, 24, 24);
		dialog.appendChild(dialogBoxNode);
		var newsShape = new ImageShape(_Main.imgMap["tit_news.png"]);
		var newsNode = new DisplayNode(newsShape, 208, 42);
		dialog.appendChild(newsNode);
		var cancelShape = new ImageShape(_Main.imgMap["btn_cancel.png"]);
		var cancelNode = new DisplayNode(cancelShape, 28, 392);
		cancelNode.setTouchable(true);
		dialog.appendChild(cancelNode);
		var okShape = new ImageShape(_Main.imgMap["btn_ok.png"]);
		var okNode = new DisplayNode(okShape, 282, 392);
		okNode.setTouchable(true);
		dialog.appendChild(okNode);
		// create TextShape
		var textShape = new TextShape(444, 268, "お知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキストお知らせテキスト");
		var option = new TextShape.Option();
		option.align = TextShape.LEFT;
		option.multiline = true;
		option.wordWrap = true;
		option.fontHeight = 30;
		textShape.setOption(option);
		// create Node
		var textNode = new DisplayNode(textShape, 54, 104, 1);
		dialog.appendChild(textNode);
		
		// you got everything prepared. just render!
		eye.render();
		
		var status = "normal";
		canvas.addEventListener("mousedown", (e) -> {
			var m = e as MouseEvent;
			if(m) {
				var x = m.clientX - canvas.offsetLeft + dom.window.scrollX;
				var y = m.clientY - canvas.offsetTop + dom.window.scrollY;
				
				if(status == "normal") {
					status = "pop-up";
					var startTime = Date.now();
					(function popup(): void {
						var ratio = (Date.now() - startTime) / 250;
						if(ratio > 1) {
							ratio = 1;
						}
						dialog.setScale(ratio);
						dialog.setPosition((640 - 552 * ratio) / 2, (640 - 502 * ratio) / 2);
						eye.render();
						if(ratio != 1) {
							dom.window.setTimeout(popup, 10);
						} else {
							status = "dialoged";
						}
					})();
				}
				
				if(status == "dialoged") {
					var node = eye.findTouchedNode(x, y);
					if(node == okNode || node == cancelNode) {
						status = "pop-down";
						var startTime = Date.now();
						(function popdown(): void {
							var ratio = (Date.now() - startTime) / 250;
							if(ratio > 1) {
								ratio = 1;
							}
							dialog.setScale(1 - ratio);
							dialog.setPosition((640 - 552 * (1 - ratio)) / 2, (640 - 502 * (1 - ratio)) / 2);
							eye.render();
							if(ratio != 1) {
								dom.window.setTimeout(popdown, 10);
							} else {
								status = "normal";
							}
						})();
					}
				}
			}
		});
		
	}
	
	static function main(args: string[]): void {
		var size = dom.window.location.hash.substring(1).split(",").concat(["",""]);
		var canvas = dom.createElement("canvas") as HTMLCanvasElement;
		canvas.width = (size[0] as number)? size[0] as number: 640;
		canvas.height = (size[1] as number)? size[1] as number: 960;
		dom.document.body.appendChild(canvas);
		_Main.canvas = canvas;
		
		var imgNameList = ["top.png", "bottom.png", "btn_cancel.png", "btn_ok.png", "bg_dialogbox.png", "bg_dialogarea.png", "tit_news.png"];
		
		var loadedCount = 0;
		for(var i = 0; i < imgNameList.length; i++) {
			var img = dom.createElement("img") as HTMLImageElement;
			img.onload = (e) -> {
				loadedCount++;
				if(loadedCount == imgNameList.length) {
					_Main.start();
				}
			};
			img.src = "img/" + imgNameList[i];
			_Main.imgMap[imgNameList[i]] = img;
		}
	}
}
