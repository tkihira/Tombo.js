import "js.jsx";
import "js/web.jsx";
import "./WingXHR.jsx";

class WingManifest {
    var _assets = {}:Map.<variant>; // { id: { hash, db, code, size, mime, url }, ... }
    var _hook = null:function(url:string):string;

    function set(manifest:Map.<variant>):void {
        this._assets = this._normalize(manifest);
    }
    function load(manifestURL:string, callback:function(err:Error):void):void {
        var that = this;

        WingXHR.load(manifestURL, false, false, function(err:Error, result:string):void {
            if (!err) {
                try {
                    that._assets = JSON.parse(result) as Map.<variant>;
                } catch (err:SyntaxError) {
                    log manifestURL + " " + err.message;
                    that._assets = {}:Map.<variant>;
                }
                that._assets = this._normalize(that._assets);
            }
            callback(err);
        });
    }
    function clone():Map.<variant> {
        return JSON.parse(JSON.stringify(this._assets)) as Map.<variant>;
    }
    function setHook(hook:function(url:string):string):void {
        this._hook = hook;
    }
    function _normalize(manifest:Map.<variant>):Map.<variant> {
        //  manifest = {
        //      dirs: { "", ... },
        //      assets: {
        //          id: [hash, db, code, size, ext, dir, file],
        //           :
        //      }
        //  }
        //  manifest.assets.hash - String:
        //  manifest.assets.db   - Number: 1 = LocalStorage, 2 = WebSQL
        //  manifest.assets.code - Number: 1 = Text, 2 = Base64, 3 = Doubler
        //  manifest.assets.size - Number: file size
        //  manifest.assets.ext  - String: file extension string
        //  manifest.assets.dir  - String: dirs index
        //  manifest.assets.file - String: file name
        var dirs       = manifest["dirs"]   as Map.<string>;  // "dirs": { 1: "asset/html/", 2: "" ... }
        var assetArray = manifest["assets"] as Map.<variant>; // { id: [hash, db, code, size, ext, dir, file] }
        var result     = {}:Map.<variant>;

        for (var id in assetArray) {
            result[id] = {}:Map.<variant>;
            result[id]["hash"] = assetArray[id][0] as string; // hash: "9a24a1"
            result[id]["db"]   = assetArray[id][1] as int;    // db:
            result[id]["code"] = assetArray[id][2] as int;    // code:
            result[id]["size"] = assetArray[id][3] as int;    // size:
            result[id]["mime"] = assetArray[id][4] as string; // ext:
            result[id]["url"]  = dirs[assetArray[id][5] as string] +
                                      assetArray[id][6] as string;
            if (this._hook) {
                result[id]["url"] = this._hook(result[id]["url"] as string);
            }
        }
        //  result: {
        //      id: { hash: HASH, db: 1, code: 1, size: 123,
        //            mime: "html", url: "./asset/html/icon16.html" }
        //  }
        return result;
    }
}
