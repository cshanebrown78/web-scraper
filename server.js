var express = require("express");
// var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requires all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes

app.get("/", function(req,res) {
  res.render("index");
})

app.get("/scrape", function(req, res) {
    // Grabs the body of the html with axios
    axios.get("https:https://www.nytimes.com/section/science").then(function(response) {
      // Loads that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
    //   console.log(response.data)
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article h2").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children()
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
        result.summary = $this
          .children("p")
          .text();
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });