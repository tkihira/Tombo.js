import "console.jsx";

class Tombo {
	static const DRAW_DIRTY_REGION = true;
	static var count = 0;
	static var paintedRegion = [] : Array.<number>;
	static function addPaintedRegion(x: number, y: number, width: number, height: number): void {
		if(Tombo.DRAW_DIRTY_REGION) {
			Tombo.paintedRegion.push(x, y, width, height);
		}
	}
	static function log(msg: string): void {
		console.log(msg);
	}
	static function error(msg: string): void {
		console.error(msg);
		throw msg;
	}
	static function warn(msg: string): void {
		console.warn(msg);
	}
}
