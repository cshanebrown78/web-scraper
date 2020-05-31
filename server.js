var express = require("express");
// var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Handlebars = require("handlebars");
var exphbs = require("express-handlebars");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requires all models
var db = require("./models");

var {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");

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

app.engine("handlebars", exphbs({ 
  defaultLayout: "main",
  handlebars: allowInsecurePrototypeAccess(Handlebars)
  })
);
// app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");



// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScrape";

mongoose.connect(MONGODB_URI);



// Routes

var results = [];

function clearResults() {
  results = [];
}

app.get("/", function(req,res) {
      clearResults();
      res.render("index");
});

app.get("/scrape", function(req, res) {
    clearResults();
    // Grabs the body of the html with axios
    axios.get("https://www.nytimes.com/section/science").then(function(response) {
      // Loads that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
 
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("#stream-panel ol li div div a").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("h2")
          .text();
        result.link = "https://www.nytimes.com/" + $(this)
          .attr("href");
        result.summary = $(this)
          .children("p")
          .text();
        results.push(result);

      });
  
      // Send a message to the client
      res.render("scrape", {articles: results});

    });
  });



  // Create a saved Article using the `result` object built from button press
    app.post("/api/saved", function(req, res) {
        db.Article.create(req.body)
         .then(function(dbArticle) {

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

    // Route for grabbing a specific Article by id, populate it with it's note
app.get("/notes/:id", function(req, res) {

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client

      if (dbArticle) {
      res.render("notes", {data: dbArticle});
      }
    })
      .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
      // If successfully updated an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
        
//Route for deleting a note
app.delete("/notes/:id", function(req,res) {
  db.Note.deleteOne({ _id: req.params.id })
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
    res.json(err);
  });
});

//Route for deleting an article
app.delete("/saved/:id", function(req,res) {
  db.Article.deleteOne({ _id: req.params.id })
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
    res.json(err);
  });
});


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });