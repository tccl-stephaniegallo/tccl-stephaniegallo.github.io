/**
 * UI element: Help text popovers/tooltips
 * requires: jquery, bootstrap popover
 */
var springSpace = springSpace || {};
springSpace.sui = springSpace.sui || {};


/**
 * Help popover/tooltip
 * @param {Object} config
 * @param {String} [parent] a selector within which one will activate popovers (good for dynamically loaded content)
 * @param {String} [selector=button.btn-help-popover] selector for the help button
 * @param {String} [placement=bottom'] Which direction tooltip should go (top, bottom, right, left)
 */
springSpace.sui.helptip = function(config) {
	if ( typeof(config) == 'undefined' ) {
		config = {};
	}
	
	var placement_opts = ['bottom', 'top', 'right', 'left'];
	
	//set the config values
	this.parent = (config.parent) ? config.parent : '';
	this.selector = (config.selector) ? config.selector : 'button.btn-help-popover';
	if (this.selector == '') { return; }
	this.placement = (config.placement) ? config.placement : 'bottom';
	if ( placement_opts.indexOf(this.placement) == -1) { this.placement = 'bottom'; }
	
	//find the buttons we want to initialize as popovers
	this.$el = null;
	if (this.parent !== '') {
		this.$el = jQuery(this.parent+' '+this.selector);
	} else {
		this.$el = jQuery(this.selector);
	}
	this.ajcontent = {};  //save ajax loaded content here (by url) so we only have to request it once.
	
	var self = this;
	
	//Initialize the Bootstrap Popovers...
	this.$el.popover({
		placement: this.placement,
		html: true,
		content: function(){
			//'this' is the button
			//if a url is set load the content...
			var url = $(this).attr('data-ajload');
			if (url) {
				var loaded = $(this).attr('data-loaded');
				// check if we've already made the ajax request (for subsequent checks by bs to getContent())
				if (typeof loaded === 'undefined') {
					$(this).attr('data-loaded', 'true');
					var popover = this;
					jQuery.ajax({
	                    url: url,
	                    type: 'get',
	                    dataType: 'json',
	                    async: false,
	                    success: function(d) {
		                    if (d.data && d.data.content) {
		                    	self.ajcontent[url] = d.data.content;
		                    } else if (d.content) {
			                    self.ajcontent[url] = d.content;
		                    }
	                    }
	                }).fail(function(){
		                 self.ajcontent[url] = 'Sorry, an error occurred.';
	                });
	                return self.ajcontent[url];
	            } else {
		            return self.ajcontent[url];
	            }				
			} else {
				//Either get the content from the button's data-popover-text attribute or from the div reference by data-popover-id
				var html = ( $(this).attr('data-popover-text') ) ? '<p>'+ $(this).attr('data-popover-text') + '</p>' : $('#'+$(this).attr('data-popover-id')).html();
				//add a close button
				html += '<button type="button" class="btn btn-xs btn-link btn-close pull-right">close</button>';
				return html;
			}
		},
		title: function() {
			//If there is a data-title attribute, add the close button and return it
			//'this' is the button
			var title = $(this).attr('data-title');
			if (title) {
				title += '<button type="button" class="btn btn-link btn-close pull-right" aria-label="Close"><i class="fa fa-close"></i></button>';
				return title;
			}
			return '';
		}
	}).on('shown.bs.popover', function(e){
		//when the popover opens, add event handlers for any close buttons
		//also add an aria-controls attribute
		//also "esc" will close the popover if you are focused in it
		//'this' is the button
		var popover = jQuery(this);
		jQuery(this).attr('aria-pressed', true).parent().find('div.popover button.btn-close').on('click keydown', function(e){
			if (e.type === 'click' || (e.type === 'keydown' && e.which === 27)) {
				popover.popover('hide');
			}
		}).attr('aria-controls',  popover.parent().find('div.popover').attr('id') );
	}).on('hidden.bs.popover', function (e) {
		//this fixes a bootstrap box where you had to click twice to reopen a closed popover.
		//see https://github.com/twbs/bootstrap/issues/16732
		if (typeof $(e.target).data("bs.popover").inState !== 'undefined') {
			$(e.target).data("bs.popover").inState.click = false;
		}
    	jQuery(this).attr('aria-pressed', false);
	}).on('keydown.dismiss.bs.popover', function (e) {
		//esc key closes the popover if you are focused on the button
		e.which == 27 && jQuery(this).popover('hide');
	});

}


/*
	
	Example usage:
	
	Basic popovers for buttons with class btn-help-popover that will show below the button
	var helptips = new springSpace.sui.helptip();
	
	Same as above but only activating the buttons inside a specific form
	(This is useful if you dynamically loaded some content and just want to initialize the new popovers)
	var helptips = new springSpace.sui.helptip({ parent: 'form#addUserForm' });
	
	Buttons with class btn-help-popup get popovers that go above the button
	var helptips = new springSpace.sui.helptip({ selector: 'button.btn-help-popup', position: 'top' });
	
	If you need to further manipulate the popovers you can access them via the $el property:
	var helptips = new springSpace.sui.helptip();
	helptips.$el.popover('show'); //opens all the tooltips
	helptips.$el.last().popover('show'); //opens last tooltip in group
	helptips.$el.filter('#help-button-2').popover('show'); //opens the tooltip with the id of 2 (that's the id passed to the HelpTip inastance in php
	
	
*/