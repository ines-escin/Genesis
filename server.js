
// call the packages that genesis needs
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var request    = require('request');
var HashMap    = require('hashmap');  

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
            "condValues": [ "temperature" ]
        }
    ],
    "throttling": "PT5S"
};

var options = {
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

request(options,callback);

app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/get', function(request, response){
	response.json({message : 'hooray! welcome to our api!'});
});

router.post('/subscription', function(request,response){
	console.log('recebi assinatura');
});

app.use('/genesis', router);

app.listen(port);

console.log('Magic happens on port ' + port);