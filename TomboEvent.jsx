// mixin for DOM-like Typical Event System

mixin TomboEvent {
	var eventMap = {}: Map.<Array.<function():void>>;
	
	function addEventListener(type: string, listener: function(): void): void {
		var eventList = this.eventMap[type];
		if(!eventList) {
			eventList = []: Array.<function(): void>;
			this.eventMap[type] = eventList;
		}
		eventList.push(listener);
	}
	function removeEventListener(type: string, listener: function(): void): boolean {
		var eventList = this.eventMap[type];
		if(!eventList) {
			return false;
		}
		for(var i = 0; i < eventList.length; i++) {
			if(eventList[i] == listener) {
				eventList.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	function fireEvent(type: string): void {
		var eventList = this.eventMap[type];
		if(eventList) {
			for(var i = 0; i < eventList.length; i++) {
				eventList[i]();
			}
		}
	}
}
