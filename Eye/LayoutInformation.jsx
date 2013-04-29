class LayoutInformation {
	// position
	static const CENTER = 0x0001;
	static const TOP    = 0x0002;
	static const BOTTOM = 0x0004;
	static const LEFT   = 0x0008;
	static const RIGHT  = 0x0010;
	static const CUSTOM = 0x0020;
	
	// scale
	static const AUTO_SCALE   = 0x0100;
	static const FIXED_SCALE  = 0x0200;
	
	// default value
	var left = 0;
	var top = 0;
	var right = 0;
	var bottom = 0;
	var scale = 1;
	
	var layoutMode: int;
	
	function constructor() {
		this.layoutMode = LayoutInformation.CENTER | LayoutInformation.AUTO_SCALE;
	}
	function constructor(layoutMode: int) {
		this.layoutMode = layoutMode;
	}
	function setLeft(left: number): void {
		this.left = left;
	}
	function setTop(top: number): void {
		this.top = top;
	}
	function setRight(right: number): void {
		this.right = right;
	}
	function setBottom(bottom: number): void {
		this.bottom = bottom;
	}
	function setScale(scale: number): void {
		this.scale = scale;
	}
}
