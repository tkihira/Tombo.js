import "js.jsx";
import "js/web.jsx";
import "./WingCache.jsx";
import "./WingManifest.jsx";
import "./WingURL.jsx";

class Wing {
    var _cache = null:WingCache;
    var _options = {
            verbose:        false,  // Boolean(= false): verbose mode
            cache_busting:  false,  // Boolean(= false): add cache busting parameter. a.png?t=123
            manifest:       null,   // Object/URLString(= null): manifest, or remote manifest file
            hook_url:       null:function(url:string):string
        }:Map.<variant>;

    function constructor(option:Map.<variant> = null) {
        if (option) {
            for (var key in option) {
                this._options[key] = option[key];
            }
        }
        this._cache = new WingCache(this._options["verbose"] as boolean,
                                    this._options["cache_busting"] as boolean);
    }
    function init(cacheReadyCallback:function(err:Error):void):void {
        var that = this;
        var manifest = new WingManifest();

        if (this._options["hook_url"]) {
            manifest.setHook(this._options["hook_url"] as function(url:string):string);
        }
        if (typeof (this._options["manifest"] as variant) == "string") { // use local manifest
            var url = this._options["manifest"] as string; // remote manifest

            if (this._options["cache_busting"] as boolean) {
                url = WingURL.cacheBusting(url);
            }
            manifest.load(url, function(err:Error):void {
                that._cache.init(manifest.clone(), function(err:Error):void {
                    cacheReadyCallback(err);
                });
            });
        } else {
            manifest.set(this._options["manifest"] as Map.<variant>);
            this._cache.init(manifest.clone(), function(err:Error):void {
                cacheReadyCallback(err);
            });
        }
    }
    function is(id:string):boolean { // is valid id
        return this._cache.is(id);
    }
    function has(id:string):boolean { // has memory cached
        return this._cache.has(id);
    }
    function fetch(id:string, fetchedCallback:function(err:Error, id:string):void):void {
        this._cache.fetch(id, fetchedCallback);
    }
    function fetchAll(fetchdCallback:function(err:Error, id:Array.<string>):void):void {
        this._cache.fetchAll(fetchdCallback);
    }
    function get(id:string, toDataURI:boolean = false):string {
        return this._cache.get(id, toDataURI);
    }
    function clear(callback:function(err:Error):void = null):void {
        this._cache.clear(function(err:Error):void {
            if (callback) {
                callback(err);
            }
        });
    }
}

