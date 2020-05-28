$(document).on("click", ".scrape-btn", function(){
    event.preventDefault();
$.ajax({
    method: "GET",
    url: "/scrape"
})
    window.location.replace("/scrape");
});