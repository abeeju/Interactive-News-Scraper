// Creating Dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request'); 
var cheerio = require('cheerio');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));



app.use(express.static('public'));


// Config mangoose db //

mongoose.connect('mongodb://localhost/newsyscrapy');
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// These are articles

var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// the routes

app.get('/', function(req, res) {
  res.send(index.html);
});

// Scrapping websites

app.get('/scrape', function(req, res) {

  request('http://www.app.com/', function(error, response, html) {
    var $ = cheerio.load(html);
    $('li data-content-id').each(function(i, element) {

    			// The results

				var result = {};

			

				result.title = $(this).children('a').text();
				result.link = $(this).children('a').attr('href');

				

				var entry = new Article (result);

				// Saving the ariclts in the result to DB //

				entry.save(function(err, doc) {
					
				  if (err) {
				    console.log(err);
				  }
				  else {
				    console.log(doc);
				  }
			});
    	});
  });



  res.send("Your News Scrapping is Scompleted Successfuly ");
});

// The Scrapped articles in MongoDB

app.get('/articles', function(req, res){

	// the Articles array

	Article.find({}, function(err, doc){

		if (err){
			console.log(err);
		} 
		else {
			res.json(doc);
		}
	});
});

// 

app.get('/articles/:id', function(req, res){

	// QUERY MATCH from DB //

	Article.findOne({'_id': req.params.id})

	// TO NOTE //

	.populate('note')

	// EXECUTE QUERY //

	.exec(function(err, doc){

		if (err){
			console.log(err);
		} 
		else {
			res.json(doc);
		}
	});
});


// REPLACE NOTE //

app.post('/articles/:id', function(req, res){

	// NEW NOTE //

	var newNote = new Note(req.body);

	// NEW NOTE to DB //

	newNote.save(function(err, doc){

		if(err){
			console.log(err);
		} 
		else {

	// MATCH in DB //

			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})

	// EXECUTE QUERY //

			.exec(function(err, doc){

				if (err){
					console.log(err);
				} else {

					res.send(doc);
				}
			});
		}
	});
});

// PORT 3000 //

app.listen(3000, function() {
  console.log('App running on port 3000!');
});
