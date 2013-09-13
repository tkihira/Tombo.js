class Stream {
	static var json = []: Array.<variant>;

	static function append(value: Array.<variant>): void {
		(Stream.json[Stream.json.length - 1]["nodes"] as Array.<variant>).push(value);
	}
	static function appendLayer(id: number, width:number, height: number, alpha: number, compositeOperation: string): void {
		var layer = {}: Map.<variant>;
		layer["id"] = id;
		layer["width"] = width;
		layer["height"] = height;
		layer["alpha"] = alpha;
		layer["compositeOperation"] = compositeOperation;
		layer["nodes"] = []: Array.<variant>;
		Stream.json.push(layer);
	}
	static function toJson(): string {
		var ret = JSON.stringify(Stream.json);
		Stream.json = []: Array.<variant>;
		return ret;
	}
}
