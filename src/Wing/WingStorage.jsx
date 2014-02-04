import "./WingSQLStorage.jsx";
import "./WingLocalStorage.jsx";

class WingStorage {
    var _assets = null:Map.<variant>;
    var _sqlStorage = null:WingSQLStorage;
    var _localStorage = null:WingLocalStorage;
    var _optionVerbose = false;

    function constructor(assets:Map.<variant>, verbose:boolean) {
        this._assets = assets;
        this._optionVerbose = verbose;
        this._sqlStorage = new WingSQLStorage();
        this._localStorage = new WingLocalStorage();
    }
    function init(fn:function(err:Error):void):void {
        var that = this;
        var remain = 2;

        function _refresh(err:Error, result:Map.<variant>, local:boolean):void {
            if (err) {
                fn(err);
                fn = null;
                return;
            }
            for (var id in result) { // { id: { hash, code, cache }, ... }
                var hash = result[id]["hash"] as string;
                var code = result[id]["code"] as int;
                var stay = false;

                if (id in that._assets) {
                    if (that._assets[id]["hash"] == hash &&
                        that._assets[id]["code"] == code) {

                        that._assets[id]["L1"]    = true;
                        that._assets[id]["L2"]    = true;
                        that._assets[id]["cache"] = result[id]["cache"] as string;
                        stay = true;
                    }
                }
                if (!stay) { // old or removed
                    if (local) {
                        that._localStorage.remove(id, function(err:Error):void {
                            if (that._optionVerbose) {
                                log "WingStorage.remove(LocalStorage): " + id;
                            }
                        });
                    } else {
                        that._sqlStorage.remove(id, function(err:Error):void {
                            if (that._optionVerbose) {
                                log "WingStorage.remove(WebSQL): " + id;
                            }
                        });
                    }
                }
            }
            if (--remain <= 0) {
                fn(null);
            }
        }

        this._localStorage.init(this._assets, function(err:Error, result:Map.<variant>):void {
            _refresh(err, result, true);
        });
        this._sqlStorage.init(this._assets, function(err:Error, result:Map.<variant>):void {
            _refresh(err, result, false);
        });
    }
    function fetch(id:string, fn:function(err:Error, id:string, data:string):void):void {
        var that = this;

        switch ( this._assets[id]["db"] as int ) {
        case 0: fn(null, id, ""); break;
        case 1: this._localStorage.fetch(this._assets, id, function(err:Error, id:string, data:string):void {
                    if (that._optionVerbose) { log "WingStorage.fetched(LocalStorage): " + id; }
                    fn(err, id, data);
                });
                break;
        case 2: this._sqlStorage.fetch(this._assets, id, function(err:Error, id:string, data:string):void {
                    if (that._optionVerbose) { log "WingStorage.fetched(WebSQL): " + id; }
                    fn(err, id, data);
                });
        }
    }
    function store(id:string, cache:string, fn:function(err:Error):void):void {
        var that = this;

        switch ( this._assets[id]["db"] as int ) {
        case 0: fn(null); break; // onMemoryStorage
        case 1: this._localStorage.store(this._assets, id, cache, function(err:Error):void {
                    if (that._optionVerbose) { log "WingStorage.store(LocalStorage): " + id; }
                    fn(err);
                });
                break;
        case 2: this._sqlStorage.store(this._assets, id, cache, function(err:Error):void {
                    if (that._optionVerbose) { log "WingStorage.store(WebSQL): " + id; }
                    fn(err);
                });
        }
    }
    function clear(fn:function(err:Error):void):void {
        var that = this;

        this._localStorage.clear(function(err:Error):void {
            if (that._optionVerbose) { log "WingStorage.clear(LocalStorage)"; }

            that._sqlStorage.clear(function(err:Error):void {
                if (that._optionVerbose) { log "WingStorage.clear(WebSQL)"; }
            });
        });
    }
}

