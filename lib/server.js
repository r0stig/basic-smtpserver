
var dns =
		  net = require('net')
		, mail_queue = require('./mail_queue')
		, sender = require('./sender')
		, settings = require('../dep/config')
		, receiver = require('./receiver')
		, winston = require('winston')
;


function smtp_server() {
	var self = this;
	
	var server_port = settings.settings.server_port;
	var server_host = settings.settings.server_host;

	// Our mailer queue
	var queue = new mail_queue.queue();
	var mySender = new sender.sender(queue);
	
	// Connect the events when the queue updates
	queue.on("queue_insert", function() {
		mySender.send_mail();
	});

	// Date when the server was started
	var date = new Date();
	winston.info("Date: " + date.toUTCString());

	// Send mail every 5 minutes ( for now)
	// In upcoming versions, this will be handeled by some sort of events
	// where event is fired when the queue is updated.
	/*setInterval(function() {
		mySender.send_mail();
	}, 1000 * 60 * 1);
	var assert = require('assert');
	assert.ok(true, 'testar lite :>');
	*/

	// The server that receives mail from users.
	self.server = net.createServer(function(socket) {
		// Listener for server.
		//console.log('Socket connected!');
		winston.info("Client connected!");
		//socket.write('250 robSMTP A basic SMTP server powered by Node.js\r\n');
		var buffer = "";	// buffer for our message
		var myReceiver = new receiver.receiver(queue, socket);
		
		myReceiver.reply.greet.call(myReceiver);
		socket.setEncoding('ascii');
		
		socket.on('data', function(data) {
			myReceiver.receive(data);
		});
		
		socket.on('close', function() {
			//console.log('Server disconnected');
			// Skicka mail här(?)
			winston.info('Client disconnected');
	
		});
	});
	self.server.listen(server_port, function() {
		winston.info('Server listening');
		
	});
};

smtp_server.prototype.stop = function() {
	var self = this;
	self.close();
}

exports.start = smtp_server;