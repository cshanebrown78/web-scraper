$(document).on("click", ".scrape-btn", function() {
    event.preventDefault();
$.ajax({
    method: "GET",
    url: "/scrape"
})
    window.location.replace("/scrape");
});

$(document).on("click", ".save", function() {
    event.preventDefault();
    articleID = $(this).attr("article-id")

    $(this).hide()
    var data = {}
    data.title = $("#title-" + articleID).text();
    data.link = $("#link-" + articleID).attr("href");
    data.summary = $("#summary-" + articleID).text();
    console.log(data);
    $.ajax({
        method: "POST",
        url: "/api/saved",
        data: data
    })

});

$(document).on("click", ".note", function() {
    thisId = $(this).attr("article-id")
    // console.log(thisId)
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    window.location.replace("/articles/" + thisId);
})



