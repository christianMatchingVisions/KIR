/*
RL-Advanced-Ajax-Filter
Author: Ryan Lund
Contact: devteam@jasonbaldacchino.com
*/

if(RLAAF_CONFIG===undefined){
	var RLAAF_CONFIG={}; //can be used to overwrite settings
}

$(function(){
	var active_class = RLAAF_CONFIG.active_class || '.filter-active';
	var render_template_id = RLAAF_CONFIG.render_template || 'catalogue-template';
	var items_per_page = RLAAF_CONFIG.items_per_page || 15;

	var load_more_button = $('.rlaaf-load-more');
	var to_top_button = $('.rlaaf-to-top');
	var render_container = $('.rlaaf-render-container');
	var render = RLAAF.render.bind(RLAAF);
	var renderError = RLAAF.renderError.bind(RLAAF);
	
	var setup = RLAAF.setup({
		site_path: RLAAF_CONFIG.site_path || null,
		render_template: $('#'+render_template_id).html(), 
		render_container: render_container,
		items_per_page: items_per_page
	});

	//get initial search settings
	if($('.rlaaf-init-settings').length>0){
		var init_setting_elem = $('.rlaaf-init-settings');
		init_setting_elem.addClass(active_class);

		var settings_url = init_setting_elem.data('settings-url');

		var search = $.get(settings_url).then(function(settings){
			RLAAF.settings_source = settings_url; /* STATIC-BUILD PATCH: see rlaaf.js loadItems */
			RLAAF.addSettings(settings);
			return RLAAF.loadItems();
		});
		
		search.then(function(response){
			if(response.pagination.page >= response.pagination.max_pages){
				load_more_button.hide();
				to_top_button.removeClass('d-none').addClass('d-block');
			}
			else{
				load_more_button.show();
				to_top_button.removeClass('d-block').addClass('d-none');
			}

			render(response.results);
		})
		.fail(renderError);
	}

	$('.rlaaf-run-search').on('click',function(event){
		event.preventDefault();
		$(active_class).removeClass(active_class);
		$(this).addClass(active_class);
		render_container.html('');

		var settings_url = $(this).data('settings-url');

		var search = $.get(settings_url).then(function(settings){
			RLAAF.settings_source = settings_url; /* STATIC-BUILD PATCH: see rlaaf.js loadItems */
			return RLAAF.resetPagination().addSettings(settings).loadItems();
		});

		search.then(function(response){
			if(response.pagination.page >= response.pagination.max_pages){
				load_more_button.hide();
			}
			else{
				load_more_button.show();
			}

			render(response.results);
		})
		.fail(renderError);
	});

	load_more_button.on('click',function(){
		RLAAF.nextPage().done(function(response){
			if(response.pagination.page >= response.pagination.max_pages){
				load_more_button.hide();
				to_top_button.removeClass('d-none').addClass('d-block');
			}
			else{
				load_more_button.show();
				to_top_button.removeClass('d-none').addClass('d-block');
			}

			render(response.results);
		})
		.fail(renderError);
	});

});
