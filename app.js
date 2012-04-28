/*
	Basic SMTP Server powered by Node.js
	
	Author: Robert Säll
	
	Twitter: r0stig
*/
var smtp_server = require('./lib/server')
	;


smtp_server.start();

// Some inspiration/help
// https://gist.github.com/278814
// http://sv.wikipedia.org/wiki/SMTP
// http://tools.ietf.org/html/rfc2821