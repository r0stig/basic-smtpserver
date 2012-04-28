var vows = require("vows"),
	assert = require("assert")
	, net = require("net");
	
var client = net.connect(3025, "192.168.1.4", function() {
	console.log('Started the client...');
});
vows.describe("Greeting").addBatch({
	"when server greets": {
		topic: function() {
			// start a client here
			//this.client = net.connect(3025, "192.168.1.4");
			client.on('data', this.callback);
		},
		'does greet' : function(err, data) {
			var code = data.substring(0, 3);
			console.log('hej hej');
			//assert.equal(code === "250", "First message should be 250");
		}
	}


}).run();