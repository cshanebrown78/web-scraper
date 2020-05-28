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

var PORT = process.env.PORT || 3000;

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
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScrape";

mongoose.connect(MONGODB_URI);

// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

var results = [];

app.get("/", function(req,res) {
      results = [];
      res.render("index");
});

app.get("/scrape", function(req, res) {
    // Grabs the body of the html with axios
    axios.get("https://www.nytimes.com/section/science").then(function(response) {
      // Loads that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
    //   console.log(response.data)
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("#stream-panel ol li div div a").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("h2")
          .text();
        result.link = $(this)
          .attr("href");
        result.summary = $(this)
          .children("p")
          .text();
        results.push(result);
        console.log(results)
  
        // Create a new Article using the `result` object built from scraping
        // db.Article.create(result)
        //   .then(function(dbArticle) {
        //     console.log(dbArticle);
        //   })
        //   .catch(function(err) {
        //     // If an error occurred, log it
        //     console.log(err);
        //   });

      });
  
      // Send a message to the client
      res.render("scrape", {articles: results});
      // res.send("Scrape Complete");
    });
  });



  // Create a saved Article using the `result` object built from button press
    app.post("/api/saved", function(req, res) {
        db.Article.create(req.body)
         .then(function(dbArticle) {
           console.log(dbArticle);
           res.json(dbArticle)
        })
        .catch(function(err) {
          // If an error occurred, log it
          res.json(err);
        });
    });

    // Route for getting all the saved articles
    app.get("/saved", function(req, res) {
      db.Article.find({})
        .then(function(dbArticle) {
          res.render("saved", {saved: dbArticle});
        })
        .catch(function(err) {
          res.json(err);
        });
    });
        



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });