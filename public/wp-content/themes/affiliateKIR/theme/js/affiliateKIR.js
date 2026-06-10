$(document).ready(function(){

    $('.rlaaf-run-search').on('click', function() {
        $('.rlaaf-run-search').removeClass('active');
        $(this).toggleClass('active');
	});
    
	$('#slide-menu-open').click(function(){
	    $('#slide-menu').addClass("slide-menu-toggled");
	});     

	$('#slide-menu-close').click(function(){
	    $('#slide-menu').removeClass("slide-menu-toggled");
	});
	    
});
