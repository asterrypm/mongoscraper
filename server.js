// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var axios = require("axios");

// Initialize Express
var app = express();

// Require all mdoels
var db = require("./models");

var PORT = 3000;

//var databaseUrl = "reddit";
//var collections = ["scrapedData"];

// Initialize Express
var app = express();

var MONGODB_URI = "mongodb://localhost/mongoHeadlines";

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//Routes

//A GET route for scraping the National Geographic website
app.get("/scrape", function(req, res {
  axios.get("https://www.nationalgeographic.com/").then(function(response){
  // Then, we load that into cheerio and save it 
  var $ = cheerio.load(response.data);

  // Now, we grab every a.mt_div_link within an article tag, and do the following:
  $("a.mt_div_link").each(function(i, element) {
    // Save an empty result object
    var result = {};

    // Add the text and href of every link, and save them as properties of the result object
    result.title = $(this)
    .children("a")
    .text();
  result.link = $(this)
    .children("a")
    .attr("src");

    // Create a new Article using the `result` object built from scraping
    db.Article.create(result)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json(err);
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function(dbArticle) {
      // If all Notes are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({_id: req.params.id})
  // Specify that we want to populate the retrieved libraries with any associated books
  .populate("note")
  .then(function(dbArticle) {
    // If any Libraries are found, send them to the client with any associated Books
    res.json(dbArticle);
  }).catch(funtion(err) {
    res.json(err);
  
  });

});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  
  db.Note.create(req.body)
  .then(function(dbNote) {
    
    return db.User.findOneAndUpdate({}, { $set: { Article: dbNote._id } }, { new: true });
  })
  .then(function(dbArticle) {
    // If the User was updated successfully, send it back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
