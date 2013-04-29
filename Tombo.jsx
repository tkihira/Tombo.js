import "console.jsx";

class Tombo {
	static function error(msg: string): void {
		console.error(msg);
		throw msg;
	}
	static function warn(msg: string): void {
		console.warn(msg);
	}
}
