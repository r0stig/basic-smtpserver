/*
	Author: Robert Säll
	Twitter: r0stig
	
	
	Class for the mailing queue
	This class assumes that the message's being inserted is valid.
*/
function mail_queue() {
	var self = this;
	self.queue = [];	// Private
}

mail_queue.prototype.insert = function(mail) {
	// Inserts a mail in the end of the queue
	var self = this;
	self.queue.push(mail);
}

mail_queue.prototype.get_next_in_line = function() {
	// Removes the first element, and returns it
	var self = this;
	return self.queue.shift();
}

mail_queue.prototype.count = function() {
	// Return the number of queued mails
	var self = this;
	return self.queue.length;
}
mail_queue.prototype.clear = function() {
	// Remove all the contents in the queue
	var self = this;
	self.queue.splice(0, self.queue.length);
}

exports.queue = mail_queue;