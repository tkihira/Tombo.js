var fs = require("fs");
var path = require("path");
var util = require("util");
var exec = require("child_process").exec;

// default task
var command_exec = function(command) {
	exec(command, function(e, stdout, stderr) {
		stdout = stdout.trim();
		stderr = stderr.trim();
		stdout && console.log(stdout);
		stderr && console.log(stderr);
	});
};

desc("build demo");
task("default", [], function() {
	command_exec("jsx --executable web --output demo.js Demo.jsx");
});

