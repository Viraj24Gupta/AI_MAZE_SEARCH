$(".dropContent0").click(function() {
    var x=$(this).text();
    $("#dropdownMenuButton0").text(x);
});

$(document).ready(function(){
    $("#menu-toggle").click(function(e){
        e.preventDefault();
        $("#wrapper").toggleClass("menuDisplayed");
    });
});
