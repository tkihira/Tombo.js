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

class Tetragon extends Rect {
	var _topLeft : Array.<number>;
	var _topRight : Array.<number>;
	var _bottomLeft : Array.<number>;
	var _bottomRight : Array.<number>;
	function constructor() {
		super(0, 0, 0, 0);
		this._topLeft = [0, 0];
		this._topRight = [0, 0];
		this._bottomLeft = [0, 0];
		this._bottomRight = [0, 0];
	}
	function constructor(left: number, top: number, width: number, height: number) {
		super(left, top, width, height);
		var right = left + width;
		var bottom = top + height;
		this._topLeft = [left, top];
		this._topRight = [right, top];
		this._bottomLeft = [left, bottom];
		this._bottomRight = [right, bottom];
	}
	function transform(matrix: Array.<number>): void {
		// Transform all the corners of this rectangle.
		this._topLeft = this._transformPoint(matrix, this._topLeft);
		this._topRight = this._transformPoint(matrix, this._topRight);
		this._bottomLeft = this._transformPoint(matrix, this._bottomLeft);
		this._bottomRight = this._transformPoint(matrix, this._bottomRight);

		// Calculate the bounding box of this transformed rectangle and fill the
		// Rect members with it.
		var minX = Math.min(this._topLeft[0], this._topRight[0], this._bottomLeft[0], this._bottomRight[0]);
		var maxX = Math.max(this._topLeft[0], this._topRight[0], this._bottomLeft[0], this._bottomRight[0]);
		var minY = Math.min(this._topLeft[1], this._topRight[1], this._bottomLeft[1], this._bottomRight[1]);
		var maxY = Math.max(this._topLeft[1], this._topRight[1], this._bottomLeft[1], this._bottomRight[1]);
		this.left = minX;
		this.top = minY;
		this.width = maxX - minX;
		this.height = maxY - minX;
	}
	override function isInside(x0: number, y0: number): boolean {
		// Skip retriving intersections when the given point is not in the
		// bounding box of this rectangle.
		if(!super.isInside(x0, y0)) {
			return false;
		}
		// Check whether the given x is in an intersection of this rectangle and
		// a horizontal line 'y = y0', which must consist of only two points.
		// The intersection of a closed path and a line must be an empty region
		// or a closed region, i.e. it must consist of an even number of points.
		// Also, the intersection of a convex (including a rectangle) and a line
		// must consist of zero points or two. If the intersection of a
		// rectangle and a horizontal line does not have any points, the
		// specified point is not in the bounding box of a rectangle, this
		// function does not execute this check.
		var intersection = [] : Array.<number>;
		this._addIntersection(y0, this._topLeft, this._topRight, intersection);
		this._addIntersection(y0, this._topRight, this._bottomRight, intersection);
		this._addIntersection(y0, this._bottomRight, this._bottomLeft, intersection);
		this._addIntersection(y0, this._bottomLeft, this._topLeft, intersection);
		return intersection.length == 2 && this._isInRange(x0, intersection[0], intersection[1]);
	}
	function _transformPoint(matrix: Array.<number>, point: Array.<number>): Array.<number> {
		var a = matrix[0];
		var b = matrix[1];
		var c = matrix[2];
		var d = matrix[3];
		var tx = matrix[4];
		var ty = matrix[5];
		var x = a * point[0] + c * point[1] + tx;
		var y = b * point[0] + d * point[1] + ty;
		return [x, y];
	}
	function _addIntersection(y: number, p0: Array.<number>, p1: Array.<number>, intersection: Array.<number>): void {
		var minY = Math.min(p0[1], p1[1]);
		var maxY = Math.max(p0[1], p1[1]);
		if(minY != maxY && minY <= y && y < maxY) {
			var angle = (p0[0] - p1[0]) / (p0[1] - p1[1]);
			intersection.push(p0[0] + (y - p0[1]) * angle);
		}
	}
	function _isInRange(x: number, x0: number, x1: number): boolean {
		return x0 < x1 ? (x0 <= x && x < x1) : (x1 <= x && x < x0);
	}
}

class Transform {
	var left = 0;
	var top = 0;
	var scaleX = 1;
	var scaleY = 1;
	var rotation = 0;
	var matrix = null: number[];
	var userMatrix = false;
	
	function constructor(left: number, top: number, scaleX: number, scaleY: number, rotation: number) {
		this.left = left;
		this.top = top;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
		this.rotation = rotation;
		if(this.rotation) {
			this.calcMatrix();
		}
	}
	function constructor(left: number, top: number, scaleX: number, scaleY: number) {
		this.left = left;
		this.top = top;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
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
	function setScale(scaleX: number, scaleY: number): void {
		this.scaleX = scaleX;
		this.scaleY = scaleY;
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
		this.scaleX = 1;
		this.scaleY = 1;
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
			this.matrix = [cos * this.scaleX, sin, -sin, cos * this.scaleY, this.left, this.top]: number[];
		} else {
			// clear matrix becuase rotation == 0
			this.matrix = null;
		}
	}
	function getMatrix(): number[] {
		if(this.matrix) {
			return this.matrix;
		} else {
			return [this.scaleX, 0, 0, this.scaleY, this.left, this.top];
		}
	}
	
	function transformRect(rect: Rect): Rect {
		if(this.matrix) {
			var tetragon = new Tetragon(rect.left, rect.top, rect.width, rect.height);
			tetragon.transform(this.matrix);
			return tetragon;
		} else {
			return new Rect(this.scaleX * rect.left + this.left, this.scaleY * rect.top + this.top,
							this.scaleX * rect.width, this.scaleY * rect.height);
		}
	}
	
	static function mul(a: Transform, b: Transform): Transform {
		if(a.matrix || b.matrix) {
			// todo implement mul
			throw "[Transform#mul] sorry, not implemented";
		} else {
			// neither matrix has transform
			var scaleX = a.scaleX * b.scaleX;
			var scaleY = a.scaleY * b.scaleY;
			var left = a.scaleX * b.left + a.left;
			var top = a.scaleY * b.top + a.top;
			return new Transform(left, top, scaleX, scaleY);
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
