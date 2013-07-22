import "js.jsx";
import "js/web.jsx";
import "timer.jsx";

class WingLocalStorage {
    var _onMemoryDB = {}:Map.<variant>; // { id: { hash, code, cache }, ... }
    var _saveHandler = null:TimerHandle;

    function init(assets:Map.<variant>, fn:function(err:Error, resut:Map.<variant>):void):void {
        var localStorage = js.global["localStorage"] as Storage;
        var json = localStorage.getItem("__WING__") ?: "";

        if (json) {
            try {
                this._onMemoryDB = JSON.parse(localStorage.getItem("__WING__")) as Map.<variant>;
            } catch(err:SyntaxError) {
                this._onMemoryDB = {}:Map.<variant>;
                localStorage.setItem("__WING__", "{}");
            }
        }
        fn(null, this._onMemoryDB);
    }
    function fetch(assets:Map.<variant>, id:string, fn:function(err:Error, id:string, cache:string):void):void {
        fn(null, id, this._onMemoryDB[id]["cache"] as string);
    }
    function store(assets:Map.<variant>, id:string, cache:string, fn:function(err:Error):void):void {
        if (!(id in this._onMemoryDB)) {
            this._onMemoryDB[id] = {}:Map.<variant>;
        }
        this._onMemoryDB[id]["hash"] = assets[id]["hash"] as string;
        this._onMemoryDB[id]["code"] = assets[id]["code"] as int;
        this._onMemoryDB[id]["cache"] = cache;
        this.save(5000);
        fn(null);
    }
    function remove(id:string, fn:function(err:Error):void):void {
        if (id in this._onMemoryDB) {
            delete this._onMemoryDB[id];
            this.save(5000);
        }
        fn(null);
    }
    function clear(fn:function(err:Error):void):void {
        this._onMemoryDB = {}:Map.<variant>; // clear
        this._save();
        fn(null);
    }
    function save(delay:int = 5000):void {
        var that = this;

        if (this._saveHandler) {
            Timer.clearTimeout(this._saveHandler); // reset timer
        }
        this._saveHandler = Timer.setTimeout(function() {
            that._saveHandler = null;
            that._save();
        }, delay);
    }
    function _save():void {
        var localStorage = js.global["localStorage"] as Storage;
        localStorage.setItem("__WING__", JSON.stringify(this._onMemoryDB));
    }
}

