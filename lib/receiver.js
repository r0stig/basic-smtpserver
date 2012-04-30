/*
	Author: Robert Säll
	Twitter: r0stig
	
	This is a class that parses input and places the mail
	in a message object, this message object is then placed in 
	the mail_queue.


*/
var helper = require('../dep/helpers')
	, settings = require('../dep/config')
	, winston = require("winston")
	;

// <CRLF>
var eol = "\r\n";
var server_host = settings.settings.server_host;

function receiver(queue, socket) {
	var self = this;

	self.queue = queue;
	self.socket = socket;
	self.mess = {mail_from: null,
			rcpt_to: null,
			data: null
			};
	// Used when the client wants to send data in multiple messages
	self.receiving_data = false;	
}

// Some identifiers for the different supported commands
receiver.prototype.patterns = { 
	helo: /^HELO\s*/i, 
	mail_from: /^MAIL FROM:\s*/i, 
	rcpt_to: /^RCPT TO:\s*/i, 
	data: /^DATA/i,
	quit: /^QUIT\s*/i 
};
receiver.prototype.reply = {
	send: function(s) {
		// console.log
		var self = this;
		//console.log(s);
		winston.info("< " + s);
		self.socket.write(s + eol);
	},
	greet: function() {
		var self = this;
		
		self.reply.send.call(this, "220 " + server_host + " powered by Node.js");
	},
	welcome: function() {
		var self = this;
		//console.log(this);
		self.reply.send.call(this, '250 ' + server_host + ' Hello ' + self.socket.remoteAddress);
	},
	error: function(s) {
		var self = this;
		self.reply.send.call(this, "500 " + s);
	},
	ok: function() {
		var self = this;
		self.reply.send.call(this, "250 OK");
	},
	data: function() {
		var self = this;
		self.reply.send.call(this, "354 Enter mail, end with '.' on a line by itself.");
	},
	quit: function() {
		var self = this;
		self.socket.end("Farewell my young pandawan");
	}
};

receiver.prototype.get_command = function(str) {
	var self = this;
	// Find the command from the patterns and return the name of it
	for( var cmd in self.patterns) {
		if( self.patterns[cmd].test(str) ) {
			return cmd;
		}
	}
	return null;
}

receiver.prototype.process_mail = function(mail) {
	// Validates an email and returns an object containing:
	// success: true/false
	// input: input
	// clean_mail: the email cleaned
	var response = { success: false
			, input: mail
			, clean_mail: null
			};
	var re = new RegExp(/^<?(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))>?$/);
	if(re.test(mail)) {
		response.success = true;
		response.clean_mail = mail.replace('<', '').replace('>', '');
	}
	return response;
}
receiver.prototype.arrived_dest = function(mail) {
	// Checks if the mail was arrived to the destination
	// Which means if the mail was send to this SMTP-server.
	mail = mail.replace('<', '').replace('>', '');
	var host = mail.substring( mail.indexOf('@') + 1, mail.length);
	return host === server_host;
	
}

receiver.prototype.receive = function(str) {
	// Receive [string]<CRLF> (\r\n) and process it by populating a message object
	// It also responds to the connecting client
	var self = this;

	winston.info("> (RAW) " + str);
	// First check if the first word is a accepted command
	var command = self.get_command(str);
	if(command === null && self.receiving_data === false) {
		self.reply.error.call(this, "Unrecognized command: " + command);
		// Should close the connection here..
		return;	// Unrecognised command
	}
	// Line is simply the inputstring with the command and whitespaces removed
	var line = str.replace(self.patterns[command], '').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	var line_raw = str.replace(self.patterns[command], '');

	//console.log(command + ' ' + line);
	winston.info("> " + command + " " + line);
	
	if( command === "helo" ) {
		self.reply.welcome.call(this);
	} else if(command === "mail_from") {
		var email = self.process_mail(line);
		if(email.success) {
			self.mess.mail_from = email.clean_mail;
			self.reply.ok.call(this);
		} else { 
			self.reply.error.call(this, "Invalid mail_from");
		}
	} else if(command === "rcpt_to") {
		var email = self.process_mail(line);
		if(email.success) {
			self.mess.rcpt_to = email.clean_mail;
			self.reply.ok.call(this);
		} else { 
			self.reply.error.call(this, "Invalid rcpt_to");
		}
	} else if(command === 'data') {
		// Indicate that we are receiving data now.
		self.receiving_data = true;	
		self.reply.data.call(this);
		
	} else if(command === "quit") {
		self.reply.quit.call(this);
	} else if(self.receiving_data) {
		// Data is processed until we get <CRLF>.<CRLF>
		self.mess.data = self.mess.data + line_raw;
		var tail = line_raw.substring( line_raw.length-3, line_raw.length);
		// If we got a <CRLF>.<CRLF> we are done with the data.
		if(  /[\s.\s]$/.test(line)) {
			self.receiving_data = false;
			// The data is the last input from the sender
			// Insert the message in the queue
			if(self.arrived_dest(self.mess.rcpt_to)) {
				winston.info("Message arrived to it's destination.");
				//The message has arrived to it's destination (this host)
				// Now place the message in the inbox (database?)
				// so some POP3, IMAP (or similar) can fetch e-mails.
			} else {
				winston.info("Message was queued");
				self.queue.insert(helper.clone(self.mess));
			}
			self.reply.ok.call(this);
		}
	}
		
}

exports.receiver = receiver;