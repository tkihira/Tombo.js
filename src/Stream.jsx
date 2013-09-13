class Stream {
	static var json = []: Array.<variant>;

	static function append(value: Array.<variant>): void {
		Stream.json.push(value);
	}
	static function toJson(): string {
		return JSON.stringify(Stream.json);
	}
}
