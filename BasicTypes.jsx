class Rect {
	var left = 0;
	var top = 0;
	var width = 0;
	var height = 0;
	function constructor(left: number, top: number, width: number, height: number) {
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
	}
	function constructor() {
	}
	function isInside(x: number, y: number): boolean {
		if(x < this.left || y < this.top || x >= this.left + this.width || y >= this.top + this.height) {
			return false;
		}
		return true;
	}
}

class Transform {
	var left = 0;
	var top = 0;
	var scale = 1;
	var rotation = 0;
	var matrix = null: number[];
	var userMatrix = false;
	
	function constructor(left: number, top: number, scale: number, rotation: number) {
		this.left = left;
		this.top = top;
		this.scale = scale;
		this.rotation = rotation;
		if(this.rotation) {
			this.calcMatrix();
		}
	}
	function constructor(left: number, top: number, scale: number) {
		this.left = left;
		this.top = top;
		this.scale = scale;
	}
	function constructor(left: number, top: number) {
		this.left = left;
		this.top = top;
	}
	function constructor(matrix: number[]) {
		this.matrix = matrix;
		this.userMatrix = true;
	}
	
	function setPosition(left: number, top: number): void {
		this.left = left;
		this.top = top;
		if(this.rotation) {
			this.calcMatrix();
		}
	}
	function setScale(scale: number): void {
		this.scale = scale;
		if(this.rotation) {
			this.calcMatrix();
		}
	}
	function setRotation(rotation: number): void {
		this.rotation = rotation;
		this.calcMatrix();
	}
	function setMatrix(matrix: number[]): void {
		if(matrix) {
			this.userMatrix = true;
			this.matrix = matrix;
		} else {
			this.userMatrix = false;
			this.calcMatrix();
		}
	}
	function setIdentity(): void {
		this.userMatrix = false;
		this.matrix = null;
		this.top = 0;
		this.left = 0;
		this.scale = 1;
		this.rotation = 0;
	}
	
	function calcMatrix(): void {
		if(this.userMatrix) {
			// current matrix is set by users. do not touch this
			return;
		}
		if(this.rotation) {
			// set proper matrix value
			var cos = Math.cos(this.rotation);
			var sin = Math.sin(this.rotation);
			this.matrix = [cos * this.scale, sin, -sin, cos * this.scale, this.left, this.top]: number[];
		} else {
			// clear matrix becuase rotation == 0
			this.matrix = null;
		}
	}
	function getMatrix(): number[] {
		if(this.matrix) {
			return this.matrix;
		} else {
			return [this.scale, 0, 0, this.scale, this.left, this.top];
		}
	}
	
	function transformRect(rect: Rect): Rect {
		if(this.matrix) {
			// todo implement mul
			throw "[Transform#mul] sorry, not implemented";
		} else {
			return new Rect(this.scale * rect.left + this.left, this.scale * rect.top + this.top,
							this.scale * rect.width, this.scale * rect.height);
		}
	}
	
	static function mul(a: Transform, b: Transform): Transform {
		if(a.matrix || b.matrix) {
			// todo implement mul
			throw "[Transform#mul] sorry, not implemented";
		} else {
			// neither matrix has transform
			var scale = a.scale * b.scale;
			var left = a.scale * b.left + a.left;
			var top = a.scale * b.top + a.top;
			return new Transform(left, top, scale);
		}
	}
}

class Color {
	static function createRGB(r: int, g: int, b: int): int {
		return Color.createRGBA(r, g, b, 255);
	}
	static function createRGBA(r: int, g: int, b: int, a: int): int {
		return ((r & 0xFF) << 24) | ((g & 0xFF) << 16) | ((b & 0xFF) << 8) | (a & 0xFF);
	}
	static function stringify(color: int): string {
		var r = (color >> 24) & 0xFF;
		var g = (color >> 16) & 0xFF;
		var b = (color >> 8) & 0xFF;
		var a = (color & 0xFF) as number;
		return "rgba(" + (r as string) + "," + (g as string) + "," + (b as string) + "," + ((a / 255) as string) + ")";
	}
}
