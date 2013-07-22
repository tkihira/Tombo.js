import "js.jsx";
import "js/web.jsx";
import "./websql.jsx";

class WingSQLStorage {
    var _db = null:Database;
    var _tableName = "Wing";

    function init(assets:Map.<variant>, fn:function(err:Error, result:Map.<variant>):void):void {
        var that = this;

        if (!this._openDatabase()) {
            fn(new Error("WebSQL unsupported"), null);
            return;
        }
        this._createTable(function(err:Error):void {
            if (err) {
                fn(err, null);
            } else {
                that._query(function(err:Error, result:Map.<variant>):void {
                    fn(err, result);
                });
            }
        });
    }
    function _openDatabase():boolean {
        var win = websql.asWindowDatabase(dom.window);

        if ((win as variant)["openDatabase"]) { // window has openDatabase method ?
            this._db = win.openDatabase(this._tableName, "1.0", "", 4.75 * 1024 * 1024);
            return !!this._db;
        }
        return false;
    }
    function _createTable(fn:function(err:Error):void):void {
        var sql = "CREATE TABLE IF NOT EXISTS " + this._tableName +
                  " (id TEXT PRIMARY KEY,hash TEXT,code TEXT,cache TEXT)";

        this._db.transaction(
                function(tr:SQLTransaction):void { tr.executeSql(sql); },
                function(err:SQLError):void { fn(new Error(err.message)); },
                function():void { fn(null); });
    }
    function _query(fn:function(err:Error, result:Map.<variant>):void):void {
        var sql = "SELECT id,hash,code,cache FROM " + this._tableName;

        function _fetch(tr:SQLTransaction, rs:SQLResultSet):void {
            var result = {}:Map.<variant>,
                i = 0, iz = rs.rows.length;

            for (; i < iz; ++i) {
                var obj  = rs.rows.item(i);
                var id   = obj["id"]   as string;
                var hash = obj["hash"] as string;
                var code = obj["code"] as int;
                var cache = obj["cache"] as string;

                result[id] = { hash: hash, code: code, cache: cache };
            }
            fn(null, result);
        }
        this._db.readTransaction(
            function(tr:SQLTransaction):void {
                tr.executeSql(sql, [], _fetch);
            },
            function(err:SQLError):void {
                fn(new Error(err.message), {}:Map.<variant>);
            }
        );
    }

    function fetch(assets:Map.<variant>, id:string, fn:function(err:Error, id:string, cache:string):void):void {
        var sql = "SELECT code,cache FROM " + this._tableName + " WHERE id=?";

        function _fetch(tr:SQLTransaction, result:SQLResultSet):void {
            if (result.rows.length) {
                var obj = result.rows.item(0) as Map.<variant>;
                var code = obj["code"] as int;

                switch (code) {
                case 1: break; // TEXT
                case 2: break; // BASE64
                case 3: throw new Error("DOUBLER NOT IMPL"); // DOUBLER
                }
                fn(null, id, obj["cache"] as string);
            } else {
                fn(null, id, "");
            }
        }
        this._db.readTransaction(
                function(tr:SQLTransaction):void {
                    tr.executeSql(sql, [id]:Array.<variant>, _fetch);
                },
                function(err:SQLError):void { fn(new Error(err.message), id, ""); });
    }
    function store(assets:Map.<variant>, id:string, cache:string, fn:function(err:Error):void):void {
        var sql = "INSERT OR REPLACE INTO " + this._tableName + " VALUES(?,?,?,?)"; // [id,hash,code,cache]
        var hash = assets[id]["hash"] as string;
        var code = assets[id]["code"] as int;

        this._db.transaction(
                function(tr:SQLTransaction):void {
                    tr.executeSql(sql, [id, hash, code, cache]:Array.<variant>);
                },
                function(err:SQLError):void { fn(new Error(err.message)); },
                function():void { fn(null); });
    }
    function remove(id:string, fn:function(err:Error):void):void {
        var sql = "DELETE FROM " + this._tableName + " WHERE id=?";

        this._db.transaction(
                function(tr:SQLTransaction):void { tr.executeSql(sql, [id]:Array.<variant>); },
                function(err:SQLError):void { fn(new Error(err.message)); },
                function():void { fn(null); });
    }
    function clear(fn:function(err:Error):void):void {
        var sql = "DELETE FROM " + this._tableName;

        this._db.transaction(
                function(tr:SQLTransaction):void { tr.executeSql(sql); },
                function(err:SQLError):void { fn(new Error(err.message)); },
                function():void { fn(null); });
    }
}

