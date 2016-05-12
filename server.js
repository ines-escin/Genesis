
// call the packages that genesis needs
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/api', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get ('/get', function(req, res){
	res.json({message : 'hooray! welcome to our api!'});
});

app.use('/api', router);

app.listen(port);

console.log('Magic happens on port ' + port);