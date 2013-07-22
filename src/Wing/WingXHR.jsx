import "js.jsx";
import "js/web.jsx";
import "./WingURL.jsx";

class WingXHR {
    static function load(url:string,
                         binary:boolean,
                         cacheBusting:boolean,
                         fn:function(err:Error, text:string):void):void {
        if (cacheBusting) {
            url = WingURL.cacheBusting(url);
        }
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function(event:Event):void {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    fn(null, xhr.responseText);
                } else {
                    fn(new Error(xhr.status.toString()), "");
                }
            }
        };
        xhr.open("GET", url, true); // async
        if (binary) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        }
        xhr.withCredentials = true;
        xhr.send();
    }
}

