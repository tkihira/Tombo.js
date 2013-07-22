import "js/web.jsx";

class websql {
	static function asWindowDatabase(window : Window) : WindowDatabase {
		return window as __noconvert__ WindowDatabase;
	}
}

/*
automatically generated from:
	http://www.w3.org/TR/webdatabase/
*/
native __fake__ class WindowDatabase {

	function openDatabase(
		name : string/*DOMString*/,
		version : string/*DOMString*/,
		displayName : string/*DOMString*/,
		estimatedSize : int/*unsigned long*/
	) : Database;
	function openDatabase(
		name : string/*DOMString*/,
		version : string/*DOMString*/,
		displayName : string/*DOMString*/,
		estimatedSize : int/*unsigned long*/,
		creationCallback : function(:Database):void/*DatabaseCallback*/
	) : Database;

} // end of WindowDatabase

native __fake__ class WorkerUtilsDatabase {

	function openDatabase(
		name : string/*DOMString*/,
		version : string/*DOMString*/,
		displayName : string/*DOMString*/,
		estimatedSize : int/*unsigned long*/
	) : Database;
	function openDatabase(
		name : string/*DOMString*/,
		version : string/*DOMString*/,
		displayName : string/*DOMString*/,
		estimatedSize : int/*unsigned long*/,
		creationCallback : function(:Database):void/*DatabaseCallback*/
	) : Database;
	function openDatabaseSync(
		name : string/*DOMString*/,
		version : string/*DOMString*/,
		displayName : string/*DOMString*/,
		estimatedSize : int/*unsigned long*/
	) : DatabaseSync;
	function openDatabaseSync(
		name : string/*DOMString*/,
		version : string/*DOMString*/,
		displayName : string/*DOMString*/,
		estimatedSize : int/*unsigned long*/,
		creationCallback : function(:Database):void/*DatabaseCallback*/
	) : DatabaseSync;

} // end of WorkerUtilsDatabase

native class Database {

	function transaction(
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/
	) : void;
	function transaction(
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/,
		errorCallback : function(:SQLError):void/*SQLTransactionErrorCallback*/
	) : void;
	function transaction(
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/,
		errorCallback : function(:SQLError):void/*SQLTransactionErrorCallback*/,
		successCallback : function():void/*SQLVoidCallback*/
	) : void;
	function readTransaction(
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/
	) : void;
	function readTransaction(
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/,
		errorCallback : function(:SQLError):void/*SQLTransactionErrorCallback*/
	) : void;
	function readTransaction(
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/,
		errorCallback : function(:SQLError):void/*SQLTransactionErrorCallback*/,
		successCallback : function():void/*SQLVoidCallback*/
	) : void;
	__readonly__ var version : string/*DOMString*/;
	function changeVersion(
		oldVersion : string/*DOMString*/,
		newVersion : string/*DOMString*/
	) : void;
	function changeVersion(
		oldVersion : string/*DOMString*/,
		newVersion : string/*DOMString*/,
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/
	) : void;
	function changeVersion(
		oldVersion : string/*DOMString*/,
		newVersion : string/*DOMString*/,
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/,
		errorCallback : function(:SQLError):void/*SQLTransactionErrorCallback*/
	) : void;
	function changeVersion(
		oldVersion : string/*DOMString*/,
		newVersion : string/*DOMString*/,
		callback : function(:SQLTransaction):void/*SQLTransactionCallback*/,
		errorCallback : function(:SQLError):void/*SQLTransactionErrorCallback*/,
		successCallback : function():void/*SQLVoidCallback*/
	) : void;

} // end of Database

native class SQLTransaction {

	function executeSql(sqlStatement : string/*DOMString*/) : void;
	function executeSql(
		sqlStatement : string/*DOMString*/,
		arguments : variant[]/*ObjectArray*/
	) : void;
	function executeSql(
		sqlStatement : string/*DOMString*/,
		arguments : variant[]/*ObjectArray*/,
		callback : function(:SQLTransaction,
		:SQLResultSet):void/*SQLStatementCallback*/
	) : void;
	function executeSql(
		sqlStatement : string/*DOMString*/,
		arguments : variant[]/*ObjectArray*/,
		callback : function(:SQLTransaction,
		:SQLResultSet):void/*SQLStatementCallback*/,
		errorCallback : function(:SQLTransaction,
		:SQLError):void/*SQLStatementErrorCallback*/
	) : void;

} // end of SQLTransaction

native class DatabaseSync {

	function transaction(
		callback : function(:SQLTransactionSync):void/*SQLTransactionSyncCallback*/
	) : void;
	function readTransaction(
		callback : function(:SQLTransactionSync):void/*SQLTransactionSyncCallback*/
	) : void;
	__readonly__ var version : string/*DOMString*/;
	function changeVersion(
		oldVersion : string/*DOMString*/,
		newVersion : string/*DOMString*/
	) : void;
	function changeVersion(
		oldVersion : string/*DOMString*/,
		newVersion : string/*DOMString*/,
		callback : function(:SQLTransactionSync):void/*SQLTransactionSyncCallback*/
	) : void;

} // end of DatabaseSync

native class SQLTransactionSync {

	function executeSql(
		sqlStatement : string/*DOMString*/
	) : SQLResultSet;
	function executeSql(
		sqlStatement : string/*DOMString*/,
		arguments : variant[]/*ObjectArray*/
	) : SQLResultSet;

} // end of SQLTransactionSync

native class SQLResultSet {

	__readonly__ var insertId : int/*long*/;
	__readonly__ var rowsAffected : int/*long*/;
	__readonly__ var rows : SQLResultSetRowList;

} // end of SQLResultSet

native class SQLResultSetRowList {

	__readonly__ var length : int/*unsigned long*/;
	function __native_index_operator__(
		index : int/*unsigned long*/
	) : variant/*any*/;
	/* getter */
	function item(index : int/*unsigned long*/) : variant/*any*/;

} // end of SQLResultSetRowList

native class SQLError {

	static __readonly__ var UNKNOWN_ERR : int/*unsigned short*/;
	       __readonly__ var UNKNOWN_ERR : int/*unsigned short*/;
	static __readonly__ var DATABASE_ERR : int/*unsigned short*/;
	       __readonly__ var DATABASE_ERR : int/*unsigned short*/;
	static __readonly__ var VERSION_ERR : int/*unsigned short*/;
	       __readonly__ var VERSION_ERR : int/*unsigned short*/;
	static __readonly__ var TOO_LARGE_ERR : int/*unsigned short*/;
	       __readonly__ var TOO_LARGE_ERR : int/*unsigned short*/;
	static __readonly__ var QUOTA_ERR : int/*unsigned short*/;
	       __readonly__ var QUOTA_ERR : int/*unsigned short*/;
	static __readonly__ var SYNTAX_ERR : int/*unsigned short*/;
	       __readonly__ var SYNTAX_ERR : int/*unsigned short*/;
	static __readonly__ var CONSTRAINT_ERR : int/*unsigned short*/;
	       __readonly__ var CONSTRAINT_ERR : int/*unsigned short*/;
	static __readonly__ var TIMEOUT_ERR : int/*unsigned short*/;
	       __readonly__ var TIMEOUT_ERR : int/*unsigned short*/;
	__readonly__ var code : int/*unsigned short*/;
	__readonly__ var message : string/*DOMString*/;

} // end of SQLError

native class SQLException {

	static __readonly__ var UNKNOWN_ERR : int/*unsigned short*/;
	       __readonly__ var UNKNOWN_ERR : int/*unsigned short*/;
	static __readonly__ var DATABASE_ERR : int/*unsigned short*/;
	       __readonly__ var DATABASE_ERR : int/*unsigned short*/;
	static __readonly__ var VERSION_ERR : int/*unsigned short*/;
	       __readonly__ var VERSION_ERR : int/*unsigned short*/;
	static __readonly__ var TOO_LARGE_ERR : int/*unsigned short*/;
	       __readonly__ var TOO_LARGE_ERR : int/*unsigned short*/;
	static __readonly__ var QUOTA_ERR : int/*unsigned short*/;
	       __readonly__ var QUOTA_ERR : int/*unsigned short*/;
	static __readonly__ var SYNTAX_ERR : int/*unsigned short*/;
	       __readonly__ var SYNTAX_ERR : int/*unsigned short*/;
	static __readonly__ var CONSTRAINT_ERR : int/*unsigned short*/;
	       __readonly__ var CONSTRAINT_ERR : int/*unsigned short*/;
	static __readonly__ var TIMEOUT_ERR : int/*unsigned short*/;
	       __readonly__ var TIMEOUT_ERR : int/*unsigned short*/;
	var code : int/*unsigned short*/;
	var message : string/*DOMString*/;

} // end of SQLException

/*
end of generated files from:
	http://www.w3.org/TR/webdatabase/
*/
