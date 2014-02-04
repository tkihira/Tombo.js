import "./WingStorage.jsx";
import "./WingMimeType.jsx";
import "./WingXHR.jsx";
import "./WingBase64.jsx";

class WingCache {
    var _assets = {}:Map.<variant>;
    var _storage = null:WingStorage;
    var _optionVerbose = false;
    var _optionCacheBusting = false;

    function constructor(verbose:boolean, cacheBusting:boolean) {
        this._optionVerbose = verbose;
        this._optionCacheBusting = cacheBusting;
    }
    function init(assets:Map.<variant>, cacheReadyCallback:function(err:Error):void):void {
        this._assets = assets;
        this._storage = new WingStorage(assets, this._optionVerbose);
        // --- add properties ---
        for (var id in this._assets) {
            this._assets[id]["L1"] = false;
            this._assets[id]["L2"] = false;
            this._assets[id]["cache"] = "";
        }
        // --- fetch L2 -> L1 cache, remove old cache ---
        this._storage.init(function(err:Error) {
            cacheReadyCallback(err);
        });
    }
    function is(id:string):boolean {
        return id in this._assets;
    }
    function has(id:string):boolean {
        if (this.is(id)) {
            return this._assets[id]["L1"] as boolean;
        }
        return false;
    }
    function fetch(id:string, fetchedCallback:function(err:Error, id:string):void):void {
        if (!this.is(id)) {
            fetchedCallback(new Error("NOT_FOUND"), id);
            return;
        }
        var that = this;
        var L1 = this._assets[id]["L1"] as boolean;
        var L2 = this._assets[id]["L2"] as boolean;

        if (L1) {
            fetchedCallback(null, id);
        } else if (L2) { // already Lv2 cached
            this._storage.fetch(id, function(err:Error, id:string, cache:string):void {
                if (!err) {
                    that._assets[id]["L1"] = true; // fetch L2 -> L1
                    that._assets[id]["cache"] = cache;
                }
                fetchedCallback(err, id);
            });
        } else {
            var url = this._assets[id]["url"] as string;
            var binary = WingMimeType.isBinary(this._assets[id]["mime"] as string);

            WingXHR.load(url, binary, this._optionCacheBusting, function(err:Error, cache:string):void {
                if (err) {
                    fetchedCallback(err, id);
                } else {
                    // binary encode
                    switch ( this._assets[id]["code"] as int ) {
                    case 1: break; // TEXT
                    case 2: cache = WingBase64.btoa(cache, true); break;  // BIN->BASE64
                    case 3: throw new Error("DOUBLER NOT IMPL");      // BIN->DOUBLER
                    }
                    that._storage.store(id, cache, function(err:Error):void {
                        if (!err) {
                            that._assets[id]["L1"] = true;
                            that._assets[id]["L2"] = true;
                            that._assets[id]["cache"] = cache;
                            if (that._assets[id]["db"] as int == 0) {
                                that._assets[id]["L2"] = false; // onMemoryStorage
                            }
                        }
                        fetchedCallback(err, id);
                    });
                }
            });
        }
    }
    function fetchAll(fetchdCallback:function(err:Error, id:Array.<string>):void):void {
        var that = this;
        var ids = this._assets.keys();
        var remain = ids.length;

        function _fin(err:Error):void {
            fetchdCallback(err, ids);
        }
        ids.forEach(function(id):void {
            that.fetch(id, function(err:Error, id:string):void {
                if (err) {
                    remain = 0;
                    _fin(err);
                    return;
                }
                if (--remain <= 0) {
                    _fin(null);
                }
            });
        });
    }
    function get(id:string, toDataURI:boolean = false):string {
        if (!this.is(id)) {
            return "";
        }
        if (toDataURI) {
            var mime = "";
            switch ( this._assets[id]["code"] as int ) {
            case 2: // BASE64
                mime = WingMimeType.toMimeType(this._assets[id]["mime"] as string);
                return "data:" + mime + ";base64," + (this._assets[id]["cache"] as string);
            }
        }
        return this._assets[id]["cache"] as string;
    }
    function clear(callback:function(err:Error):void):void {
        for (var id in this._assets) {
            this._assets[id]["L1"] = false;
            this._assets[id]["L2"] = false;
            this._assets[id]["cache"] = "";
        }
        this._storage.clear(callback);
    }
}

