/**
 * LayoutInformation class
 * 
 * <p>The layout information for a layer. </p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class LayoutInformation {
	// position
	/** Layout: centering */
	static const CENTER = 0x0001;
	/** Layout: top */
	static const TOP    = 0x0002;
	/** Layout: bottom */
	static const BOTTOM = 0x0004;
	/** Layout: left */
	static const LEFT   = 0x0008;
	/** Layout: right */
	static const RIGHT  = 0x0010;
	/** Layout: custom (currently not used) */
	static const CUSTOM = 0x0020;
	
	// scale
	/** Scale: auto scaling for master canvas */
	static const AUTO_SCALE   = 0x0100;
	/** Scale: fixed scaling ratio */
	static const FIXED_SCALE  = 0x0200;
	
	// default value
	/** READONLY: Margin: left (this value is used when you choose Left layout) */
	var left = 0;
	/** READONLY: Margin: top (this value is used when you choose Top layout) */
	var top = 0;
	/** READONLY: Margin: right (this value is used when you choose Right layout) */
	var right = 0;
	/** READONLY: Margin: bottom (this value is used when you choose Bottom layout) */
	var bottom = 0;
	/** READONLY: scaling ratio */
	var scale = 1;
	
	/** READONLY: canvas width */
	var clientWidth: number;
	/** READONLY: canvas height */
	var clientHeight: number;
	
	/** READONLY: layout and scaling mode */
	var layoutMode: int;
	
	/**
	 * create default layout (CENTER and AUTO_SCALE)
	 */
	function constructor() {
		this.layoutMode = LayoutInformation.CENTER | LayoutInformation.AUTO_SCALE;
	}
	/**
	 * create layout with layoutMode
	 */
	function constructor(layoutMode: int) {
		this.layoutMode = layoutMode;
	}
	function _setLeft(left: number): void {
		this.left = left;
	}
	function _setTop(top: number): void {
		this.top = top;
	}
	function _setRight(right: number): void {
		this.right = right;
	}
	function _setBottom(bottom: number): void {
		this.bottom = bottom;
	}
	function _setScale(scale: number): void {
		this.scale = scale;
	}
}
