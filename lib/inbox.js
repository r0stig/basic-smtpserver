/*
	Simple inbox for mail that was received and had this machine
	as the receiver hostname.
	
	Might place the received e-mails in a database for some other
	service to fetch the mails (IMAP/POP3)
*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema,
			ObjectId = Schema.ObjectId;

var Message = new Schema({
	  headers	: String
	, subject	: String
	, message	: String
});
var User = new Schema({
	  username	: String
	, password	: String
	, messages	: [Message]
});

var UserModel = mongoose.model('Users', User);

function inbox() {
	
}
inbox.prototype.get_user = function(mail) {
	mail = mail.replace('<', '').replace('>', '');
	var user = mail.substring( 0, mail.indexOf('@') );
	return user;
	
}
// Retrieves an email and inserts it into the MongoDB
inbox.prototype.retrieve = function(message) {

	/*var instance = new UserModel();
	instance.username = "test4";
	instance.password = "test4";
	instance.messages = [ { headers: "headers1",
							subject: "subject",
							message: "message1"
						  },
						  {
							headers: "headers2",
							subject: "subject2",
							message: "message2"
						  }
						];
	instance.save(function() {
		console.log("Saved!")
	});*/

	var user = this.get_user(message.rcpt_to);
	//console.log(user);
	var divider = message.data.search("\r\n\r\n");
	headers = message.data.substring(0, divider);
	var message = message.data.substring(divider+4, message.data.length);
	message = message.substring(0, message.length-5);
	//console.log(headers);
	//console.log("---\n" + message + "..");
	
	var data = {
				headers: headers,
				subject: "Not used",
				message: message
				};
	
	UserModel.update({ username: user}, { "$push" : { messages : data } } , function(err, numAffected) {
		console.log(numAffected + " rows updated!");
		console.log(err);
	});

}

exports.inbox = inbox;

/*
var i = new inbox();
i.retrieve( { 
	mail_from: "pr_125@hotmail.com",
	rcpt_to: "test4@experimental.zapto.org",
	subject: "Hello this is the subject!",
	data: "this is some \r\nheaders\r\nand more \r\n\r\nMessage a very nice text indeeed :>\r\n\r\n.\r\n"
	} );
	*/