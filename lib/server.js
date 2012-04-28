
var dns =
		  net = require('net')
		, mail_queue = require('./mail_queue')
		, sender = require('./sender')
		, settings = require('../dep/config')
		, receiver = require('./receiver')
		//, winston = require('winston').add(winston.transports.File, { filename: "./logs/main.log" } );
;

function smtp_server() {
	var self = this;
	
	var server_port = settings.settings.server_port;
	var server_host = settings.settings.server_host;

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
	self.server = net.createServer(function(socket) {
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
	self.server.listen(server_port, function() {
		console.log('Server listening');
	});
};

smtp_server.prototype.stop = function() {
	var self = this;
	self.close();
}

exports.start = smtp_server;