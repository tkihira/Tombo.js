class WingMimeType {
    static var _MIMETYPE = {
            // --- Binary ---
            bin:  "application/octet-stream",
            swf:  "application/x-shockwave-flash",
            pdf:  "application/pdf",
            // --- Image ---
            gif:  "image/gif",
            png:  "image/png",
            jpg:  "image/jpeg",
            // --- Media ---
            mp3:  "audio/mp3",
            m4a:  "audio/m4a",
            wav:  "audio/wav",
            mpeg: "video/mpeg",
            mp4:  "video/mp4",
            // --- Text ---
            txt:  "text/plain",
            htm:  "text/html",
            html: "text/html",
            css:  "text/css",
            js:   "text/javascript",
            json: "application/json"
        }:Map.<string>;

    static var _TEXT = {
            txt:  "text/plain",
            htm:  "text/html",
            html: "text/html",
            css:  "text/css",
            js:   "text/javascript",
            json: "application/json"
        }:Map.<string>;

    static function toMimeType(mime:string):string {
        return (WingMimeType._MIMETYPE[mime] || "") as string;
    }
    static function isText(mime:string):boolean {
        return (WingMimeType._TEXT[mime] || "") as boolean;
    }
    static function isBinary(mime:string):boolean {
        return !WingMimeType.isText(mime);
    }
}
