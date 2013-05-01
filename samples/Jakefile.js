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
	command_exec("jsx --add-search-path ../src/ --executable web --output simple.js Simple.jsx");
	command_exec("jsx --add-search-path ../src/ --executable web --output text.js Text.jsx");
	command_exec("jsx --add-search-path ../src/ --executable web --output layers.js Layers.jsx");
});

desc("build simple");
task("simple", [], function() {
	command_exec("jsx --add-search-path ../src/ --executable web --output simple.js Simple.jsx");
});

desc("build text");
task("text", [], function() {
	command_exec("jsx --add-search-path ../src/ --executable web --output text.js Text.jsx");
});

desc("build layers");
task("layers", [], function() {
	command_exec("jsx --add-search-path ../src/ --executable web --output layers.js Layers.jsx");
});

