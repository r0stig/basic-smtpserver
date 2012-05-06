/*
	Basic SMTP Server powered by Node.js
	
	Author: Robert Säll
	
	Twitter: r0stig
*/
var smtp_server = require('./lib/server')
	, winston = require("winston")
	, mongoose = require("mongoose")
	;
winston.add(winston.transports.File, { filename: "./logs/main.log" } );

mongoose.connect("mongodb://192.168.1.4/robmail");

smtp_server.start();



// Some inspiration/help
// https://gist.github.com/278814
// http://sv.wikipedia.org/wiki/SMTP
// http://tools.ietf.org/html/rfc2821