/*
	Sender is a "class" that sends a message.
	
	Input is a message-class that defines all the details for the mail.
*/

var dns = require('dns')
		, net = require('net')
		, settings = require('../dep/config')
		;

// Some config.		
var server_host = settings.settings.server_host;


function sender(queue) {
	var self = this;
	
	self.queue = queue;
}

sender.prototype.smtp_server = null;
sender.prototype.mail_details = {};

sender.prototype.send_mail = function() {
	// Get the server we should send to
	var self = this;
	var state = 0;
	
	// get the next in line..
	message = self.queue.get_next_in_line();
	
	// If we didn't got any mail, dont try to send
	if( ! message) {
		console.log("No mail in the queue");
		return;
	}
	
	// Get the host from the mail_to
	console.log('Send_mail....');
	console.log(message);
	var host = message.rcpt_to.substring(
					message.rcpt_to.indexOf('@') + 1
					, message.rcpt_to.length);
	console.log('Host: ' + host);
	dns.resolveMx(host, function(err, adresses) {
		// If any error, (can't resolve the host), log and return
		if(err) {
			//TO-DO: Log the fault.
			console.log(err);
			console.log(host);
			return;
		}
		
		// Resolved the MX-records for the domain
		// Now lets connect via TCP port 25 to send the message.
		var mx_host = adresses[0].exchange;
		console.log(mx_host);
		
		console.log('Should connect to the server: ' + mx_host); 
		var client = net.connect(25, mx_host, function() {
			// Client connected!
			// Begin to write hello to the server
		});
		client.on('end', function() {
			console.log('Disconnected');
		});
		client.on('data', function(data) {
			// Received data from the server.
			console.log(data.toString());
			// We don't need to do this at the exact moment
			// so do it the next tick.
			process.nextTick(function() {
				if(state == 0) {
					console.log('Sending: ' + "HELO " + server_host);
					client.write("HELO " + server_host + '\r\n', 'ascii');
				} else if(state == 1) {
					console.log("MAIL FROM: <" + message.mail_from + ">\r\n");
					client.write("MAIL FROM: <" + message.mail_from + ">\r\n");
				} else if(state == 2) {
					console.log("RCPT TO: <" + message.rcpt_to + ">\r\n");
					client.write("RCPT TO: <" + message.rcpt_to + ">\r\n");
				} else if(state == 3 ) {
					console.log("data");
					client.write("DATA" + "\r\n");
				} else if(state == 4) {
					console.log("the data");
					client.write(message.data + "\r\n.\r\n");
					
					// We are done sending, call the callback

				} else {
					// Done!
					console.log("QUIT");
					client.write("QUIT" + "\r\n");
				}
					
				state++;	
			});
		});
		
		
	});
}

exports.sender = sender;