$(document).on("click", ".scrape-btn", function () {
  event.preventDefault();
  $.ajax({
    method: "GET",
    url: "/scrape",
  });
  window.location.replace("/scrape");
});


$(document).on("click", ".save", function () {
  event.preventDefault();
  var articleID = $(this).attr("article-id");

  $(this).hide();
  var data = {};
  data.title = $("#title-" + articleID).text();
  data.link = $("#link-" + articleID).attr("href");
  data.summary = $("#summary-" + articleID).text();
  // console.log(data);
  $.ajax({
    method: "POST",
    url: "/saved",
    data: data,
  });
});

$(document).on("click", ".note", function () {
  event.preventDefault();
  var thisId = $(this).attr("article-id");
 
  window.location.replace("/notes/" + thisId);
});

// submitting note
$(document).on("click", "#note-submit", function () {
  
  var thisId = $(this).attr("note-id");

  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    data: { body: $("#the-note").val() },
  }).then(function (data) {
    
    window.location.replace("/notes/" + data._id);
  });
  $("#the-note").val("");
});

$(document).on("click", ".delete", function () {
  var thisId = $(this).attr("article-id");
  $.ajax({
    method: "DELETE",
    url: "/saved/" + thisId,
  }).then(function (data) {
    location.reload();
  });
});

$(document).on("click", ".note-delete", function () {
  var thisId = $(this).attr("article-id");
  $.ajax({
    method: "DELETE",
    url: "/notes/" + thisId,
  }).then(function (data) {
    location.reload();
  });
});
