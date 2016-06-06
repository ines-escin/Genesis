
// call the packages that genesis needs
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var request    = require('request');
var HashMap    = require('hashmap');  
var schedule   = require('node-schedule');

mongoose.connect('mongodb://localhost/api', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var timeMap = new HashMap();

var subscriptionBody = {
    "entities": [
        {
            "type": "Nucleus",
            "isPattern": "false",
            "id": "NucleusAlpha"
        }
    ],
    "attributes": [
        "level"
    ],
    "reference": "http://localhost:8080/genesis/subscription",
    "duration": "P1M", /* <- 1 month subscription*/
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [ "level" ]
        }
    ],
    "throttling": "PT5S"
};

var subscriptionOptions = {
    url: "http://130.206.119.206:1026/v1/subscribeContext",
    method: "POST",
    json: true,   
    body: subscriptionBody
};

function callback(error,response,body)
{
	if(!error && response.statusCode == 200)
	{
		console.log(body);
	}
}

var checkPoints = schedule.scheduleJob('* /1 * * * *', function(){
	console.log('Schedule started');
	var currentTimeMillis  = Date.now();
	var keys = timeMap.keys();
	for(var i = 0; i < keys.length; i++ )
	{
		var lastTimeUpdated = timeMap.get(keys[i]);
		var status = "not_broken";

		if(currentTimeMillis - lastTimeUpdated > (3600 * 1000 * 4))
		{
			status = "broken";
		} 
		
		var updateOptions = {
    			url: "http://130.206.119.206:1026/v1/updateContext",
    			method: "POST",
    			json: true,   
    			body: updateBody
			};

		var updateBody = { 
		    "contextElements": [ 
		        { 
		            "type": "Nucleus", 
		            "isPattern": "false", 
		            "id": keys[i], 
		            "attributes": [ 
		                {
		                    "name": "status",
		                    "type": "String",
		                    "value": status
		                } 
		                ] 
		            
		        } 
		        ], 
		        "updateAction": "APPEND" 
		}

		request(updateOptions,callback);
		console.log('Sent');
	}
});

request(subscriptionOptions,callback);

app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/get', function(request, response){
	response.json({message : 'hooray! welcome to our api!'});
});

router.post('/subscription', function(request,response){
	var id = request.body.contextResponses[0].contextElement.id;
    var timeMillis = Date.now();
    timeMap.set(id, timeMillis);
    console.log(id + ' changed');
});

app.use('/genesis', router);

app.listen(port);

console.log('Magic happens on port ' + port);