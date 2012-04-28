var smtp_server = require('./lib/server')
	;
smtp_server.start();

//var winston = require('winston');
//winston.log('test','detta is the first test');
// För lite tips se denna:
// https://gist.github.com/278814
// http://sv.wikipedia.org/wiki/SMTP
// http://tools.ietf.org/html/rfc2821
/*
	Ifall det börjar bli klart, testa ifall den fungerar mot
	applikationer såsom PHP och e-mailklienter.
	
	Mot PHP fungerar det!
*/
/*

function clear_email_formatting(str) {
	// Removes < and > and blank spaces
	str = str.trim();
	str = str.replace('<', '');
	str = str.replace('>', '');
	return str;
}
// Our mailer queue
var queue = new mail_queue.queue();
var mySender = new sender.sender(queue);

// Date when the server was started
var date = new Date();

// Send mail every 5 minutes ( for now)
// In upcoming versions, this will be handeled by some sort of events
// where event is fired when the queue is updated.
setInterval(function() {
	mySender.send_mail();
}, 1000 * 60 * 1);
var assert = require('assert');
assert.ok(true, 'testar lite :>');

// The server that receives mail from users.
var server = net.createServer(function(socket) {
	// Listener for server.
	console.log('Socket connected!');
	//socket.write('250 robSMTP A basic SMTP server powered by Node.js\r\n');
	var buffer = "";	// buffer for our message
	var myReceiver = new receiver.receiver(queue, socket);
	
	myReceiver.reply.greet.call(myReceiver);
	socket.setEncoding('ascii');
	
	socket.on('data', function(data) {
		myReceiver.receive(data);
	});
	
	socket.on('close', function() {
		console.log('Server disconnected');
		// Skicka mail här(?)
		
		console.log("Pending mails: " + queue.count());
	});
});
server.listen(server_port, function() {
	console.log('Server listening');
});
*/