class WingURL {
    static function cacheBusting(url:string):string {
        var _salt = ((Date.now().toString()).slice(-4)) as int;

        if (url.indexOf("#") >= 0) { // a.png#abc -> parse url
            var urlObj = WingURL.parse(url);
            var search = urlObj["search"] as string;

            if (search.length) {
                search += "&t=" + (++_salt).toString();
            } else {
                search += "?t=" + (++_salt).toString();
            }
            urlObj["search"] = search;

            url = WingURL.build(urlObj); // a.png?_=1234#abc
        } else if (url.indexOf("?") >= 0) { // a.png?k=v
            url += "&t=" + (++_salt).toString(); // a.png?k=v&t=1234
        } else {
            url += "?t=" + (++_salt).toString(); // a.png?t=1234
        }
        return url;
    }
    static function build(obj:Map.<variant>):string { // @arg Object: { protocol, host, pathname, search, fragment }
                                                      // @ret URLString: "{protocol}//{host}{pathname}?{search}#{fragment}"
        return [
            obj["protocol"],
            obj["protocol"] ? "//" : "",
            obj["host"]     ?: "",
            obj["pathname"] ?: "/",
            obj["search"]   ?: "",
            obj["fragment"] ?: ""
        ].join("");
    }
    static function parse(url:string):Map.<variant> {
                          // @arg URLString: abs or rel,
                          //                   "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b&c=d#fragment"
                          // @ret URLObject: { href, protocol, scheme, secure, host,
                          //                   auth, hostname, pathname, dir, file,
                          //                   search, fragment, ok }
                          //     href     - String:  "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment"
                          //     protocol - String:  "http:"
                          //     scheme   - String:  "http:"
                          //     secure   - Boolean: false
                          //     host     - String:  "user:pass@example.com:8080". has auth
                          //     auth     - String:  "user:pass"
                          //     hostname - String:  "example.com"
                          //     pathname - String:  "/dir1/dir2/file.ext"
                          //     dir      - String:  "/dir1/dir2"
                          //     file     - String:  "file.ext"
                          //     search   - String:  "?a=b&c=d"
                          //     fragment - String:  "#fragment"
                          //     ok       - Boolean: true is valid url
                          // @inner: parse URL

        function _extends(obj:Map.<variant>):Map.<variant> { // @arg URLObject:
                                                             // @ret URLObject:
            var ary = (obj["pathname"] as string).split("/");

            obj["href"]       = obj["href"]     ?: "";
            obj["protocol"]   = obj["protocol"] ?: "";
            obj["scheme"]     = obj["protocol"];        // [alias]
            obj["secure"]     = obj["secure"]   ?: false;
            obj["host"]       = obj["host"]     ?: "";
            obj["auth"]       = obj["auth"]     ?: "";
            obj["hostname"]   = obj["hostname"] ?: "";
            obj["pathname"]   = obj["pathname"] ?: "";
            obj["file"]       = ary.pop();
            obj["dir"]        = ary.join("/") + "/";
            obj["search"]     = obj["search"]   ?: "";
            obj["fragment"]   = obj["fragment"] ?: "";
            obj["ok"]         = obj["ok"]       ?: true;
            return obj;
        }
        var _URL =      /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/,
                        //  https://    user:pass@    server   :port    /dir/f.ext   ?key=value     #hash
                        //  [1]         [3]           [4]       [5]     [6]         [7]            [8]
            _PATH =     /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                        //  /dir/f.ext   key=value    hash
                        //  [1]          [2]          [3]

        var m:Array.<string>;
        var ports = { "http:": 80, "https": 443 };

        m = _URL.exec(url);
        if (m) {
            return _extends({
                href: url,
                protocol:   m[1],
                secure:     m[1] == "https:",
                host:       m[2],
                auth:       m[3],
                hostname:   m[4],
              //port:       m[5],
                pathname:   m[6],
                search:     m[7],
                fragment:   m[8]
            }:Map.<variant>);
        }
        m = _PATH.exec(url);
        if (m) {
            return _extends({
                href:       url,
                pathname:   m[1],
                search:     m[2],
                fragment:   m[3]
            }:Map.<variant>);
        }
        return {}:Map.<variant>;
    }
}

