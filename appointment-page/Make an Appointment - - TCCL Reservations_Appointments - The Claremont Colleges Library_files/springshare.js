/**
 *
 * Third Party scripts
 *
 * Custom JS for manipulating SpringShare pages
 */

( function( window, $ ) {
  'use strict';
  var document = window.document;

    var SpringShare = function(el){
        this.$el = $(el);
        this.init();
    };

    SpringShare.prototype.init = function(){
        //fire everything!
        this.updateBanner();
        this.getLibHours();
        this.prependHome();
    };

    SpringShare.prototype.updateBanner = function(){
        //this function updates the title of the page based on the breadcrumb of the page
        var _this = this;
        //_this.$serviceBreadCrumb = _this.$el.find( '.breadcrumb li:nth-of-type(2) a, .breadcrumb li:nth-of-type(2), #s-lib-bc-site' ).eq(0);
        _this.$bannerTitle       = _this.$el.find( '.ccl-c-libguide__title div' );
        _this.groupHome         = _this.$el.find( '#s-lib-bc-group' );
        var hostName            = window.location.hostname;

        //console.log(hostName);

        //cancel this function if we are in illiad
        if( hostName === "claremont-illiad-oclc-org.ccl.idm.oclc.org" ){
           return;
        }

        /*if( _this.$serviceBreadCrumb.length ){

           //grab the text of the element
           _this.$serviceBreadCrumbText = _this.$serviceBreadCrumb.text();

           //assign the text to the banner
           $( _this.$bannerTitle ).text( _this.$serviceBreadCrumbText );

           //find the link and update the href if the text matches "Research Guides"
           _this.$serviceBreadCrumb
                .find('a')
                .filter( function(){
                    return $(this).text().indexOf('Research Guides') >= 0;
                } )
                .attr('href', 'https://library.claremont.edu/research-guides/');

        }else{
           $( _this.$bannerTitle ).text( 'Library Services' );
        }*/

        //remove the home
        if( _this.groupHome.length ){

           $(_this.groupHome).remove();
        }
    };

    SpringShare.prototype.getLibHours = function(){
        //this function updates the library hours with current days hours
        var _this = this;
        _this.$timeElement = _this.$el.find('.ccl-c-libguide__hours');


        $.ajax({
           url: 'https://api3.libcal.com/api_hours_today.php?iid=333&lid=4816&format=json&systemTime=1',
           dataType: 'jsonp',
           success: function(data){
                var renderedTime = data.locations[0].rendered;

                _this.$timeElement.text( renderedTime );

           },
           error: function(data){
                _this.$timeElement.text( 'Library Hours' );
           }
        });


    };

    SpringShare.prototype.prependHome = function(){
        //this function preprends a cute little home icon to be beginning of the library breadcrumb
        var _this = this;
        _this.$libHome      = _this.$el.find( '#s-lib-bc-customer a, .breadcrumb li:first-of-type a' ).eq(0);
        _this.$libHomeText  = _this.$libHome.text();
        _this.homeIcon      = $('<span />').addClass('fa fa-home ccl-u-mr-nudge').attr('aria-hidden', true);

        _this.$libHome.prepend( _this.homeIcon );

    };

    $(document).ready(function(){
        $('.s-la-page-public, .s-lg-guide-body, .s-lc-public, .s-lib-public-body, #wrap').each( function(){
           new SpringShare(this);
        });


    });

} )( this, jQuery );

// ( function( window, $ ) {
// 	'use strict';
// 	var document = window.document;

//     var SpringShare = function(){
//         this.init();
//     };

//     SpringShare.prototype.init = function(){
//         // do something
//     };

//     $(document).ready(function(){
//         new SpringShare();
//     });

// } )( this, jQuery );

/**
* Reflow page elements.
*
* Enables animations/transitions on elements added to the page after the DOM has loaded.
*/


(function () {

   if (!window.CCL) {
      window.CCL = {};
   }

   CCL.reflow = function (element) {
      return element.offsetHeight;
   };

})();

/**
* .debounce() function
*
* Source: https://davidwalsh.name/javascript-debounce-function
*/


(function(window) {

   // Returns a function, that, when invoked, will only be triggered at most once
   // during a given window of time. Normally, the throttled function will run
   // as much as it can, without ever going more than once per `wait` duration;
   // but if you'd like to disable the execution on the leading edge, pass
   // `{leading: false}`. To disable execution on the trailing edge, ditto.
   var throttle = function (func, wait, options) {
      var timeout, context, args, result;
      var previous = 0;
      if (!options) options = {};

      var later = function () {
           previous = options.leading === false ? 0 : new Date().getTime();
           timeout = null;
           result = func.apply(context, args);
           if (!timeout) context = args = null;
      };

      var throttled = function () {
           var now = new Date().getTime();
           if (!previous && options.leading === false) previous = now;
           var remaining = wait - (now - previous);
           context = this;
           args = arguments;
           if (remaining <= 0 || remaining > wait) {
               if (timeout) {
                   clearTimeout(timeout);
                   timeout = null;
               }
               previous = now;
               result = func.apply(context, args);
               if (!timeout) context = args = null;
           } else if (!timeout && options.trailing !== false) {
               timeout = setTimeout(later, remaining);
           }
           return result;
      };

      throttled.cancel = function () {
           clearTimeout(timeout);
           previous = 0;
           timeout = context = args = null;
      };

      return throttled;
   };

   if (!window.CCL) {
      window.CCL = {};
   }

   window.CCL.throttle = throttle;

})(this);

/**
* Dropdowns
*
* Initialize and control behavior for dropdown menus
*/

( function( window, $ ) {
  'use strict';
   var document = window.document,
      selector = {
           TOGGLE: '[data-toggle="dropdown"]',
      },
      className = {
           ACTIVE: 'ccl-is-active',
           CONTENT: 'ccl-c-dropdown__content'
      };

   var DropdownToggle = function(el){
      this.$toggle = $(el);
      this.$parent = this.$toggle.parent();

      var target = this.$toggle.data('target');

      this.$content = $( target );

      this.init();
   };

   DropdownToggle.prototype.init = function(){

      var _this = this;

      this.$toggle.click( function(event){
           event.preventDefault();
           event.stopPropagation();
           _this.toggle();
      });

      $(document).on( 'click', function(event){
           var hasActiveMenus = $( '.' + className.CONTENT + '.' + className.ACTIVE ).length;
           if ( hasActiveMenus ){
               _clearMenus();
           }
      });

   };

   DropdownToggle.prototype.toggle = function(){

      var isActive = this.$toggle.hasClass( className.ACTIVE );

      if ( isActive ) {
           return;
      }

      this.showContent();

   };

   DropdownToggle.prototype.showContent = function(){
      this.$toggle.attr('aria-expanded', 'true');
      this.$content.addClass( className.ACTIVE );
      this.$parent.addClass( className.ACTIVE );
   };

   DropdownToggle.prototype.hideMenu = function(){
      this.$toggle.attr('aria-expanded', 'false');
      this.$content.removeClass( className.ACTIVE );
      this.$parent.removeClass( className.ACTIVE );
   };

   function _clearMenus() {
      $('.ccl-c-dropdown, .ccl-c-dropdown__content').removeClass( className.ACTIVE );
      $( selector.TOGGLE ).attr('aria-expanded', 'false');
   }

   $(document).ready(function(){
      $('.ccl-c-dropdown__toggle' + selector.TOGGLE ).each(function(){
           new DropdownToggle(this);
      });
   });

} )( this, jQuery );

/**
* Header Menu Toggles
*
* Controls behavior of menu toggles in the header
*/

( function( window, $ ) {
  'use strict';
  var document = window.document;

   var HeaderMenuToggle = function(el){

      this.$el = $(el);
      this.target = this.$el.data('target');
      this.$target = $(this.target);
      this.$parentMenu = this.$el.closest('.ccl-c-menu');
      this.$closeIcon = $('<span class="ccl-b-icon close" aria-hidden="true"></span>');

      this.init();
   };

   HeaderMenuToggle.prototype.init = function(){

      var that = this;

      this.$el.click(function(event){

           event.preventDefault();

           // if the target is already open
           if ( that.$target.hasClass('ccl-is-active') ) {

               // close target and remove active classes/elements
               that.$parentMenu.removeClass('ccl-has-active-item');
               that.$el.removeClass('ccl-is-active');
               that.$target.removeClass('ccl-is-active').fadeOut(CCL.DURATION);
               that.$closeIcon.remove();

           }

           // target is not open
           else {

               // close and reset all active menus
               $('.ccl-c-menu.ccl-has-active-item').each(function(){
                   $(this)
                       .removeClass('ccl-has-active-item')
                       .find('a.ccl-is-active').removeClass('ccl-is-active')
                       .find('.ccl-b-icon.close').remove();
               });

               // close and reset all active sub-menu containers
               $('.ccl-c-sub-menu-container.ccl-is-active').each(function(){
                   $(this).removeClass('ccl-is-active').fadeOut(CCL.DURATION);
               });

               // activate the selected target
               that.$parentMenu.addClass('ccl-has-active-item');
               that.$target.addClass('ccl-is-active').fadeIn(CCL.DURATION);
               // prepend close icon
               that.$closeIcon.prependTo(that.$el);
               CCL.reflow(that.$closeIcon[0]);
               that.$closeIcon.fadeIn(200);
               that.$el.addClass('ccl-is-active');

           }

      });

   };

   $(document).ready(function(){
      $('.js-toggle-header-menu').each(function(){
           new HeaderMenuToggle(this);
      });
   });

} )( this, jQuery );

/**
*
* Post Type Keyword search
*
* On user input, fire request to search the database custom post type and return results to results panel
*/

( function( window, $ ) {
  'use strict';
  var document = window.document,
     ENTER = 13, TAB = 9, SHIFT = 16, CTRL = 17, ALT = 18, CAPS = 20, ESC = 27, LCMD = 91, RCMD = 92, LARR = 37, UARR = 38, RARR = 39, DARR = 40,
     forbiddenKeys = [ENTER, TAB, SHIFT, CTRL, ALT, CAPS, ESC, LCMD, RCMD, LARR, UARR, RARR, DARR];

   var postSearch = function(el){
      this.$el            = $( el );
      this.$form			= this.$el.find( '.ccl-c-post-search__form' );
      this.$postType      = this.$el.attr('data-search-type');
      this.$input         = this.$el.find('#ccl-c-post-search__input');
      this.$resultsList   = this.$el.find( '.ccl-c-post-search__results' );
      this.$inputTextbox	= this.$el.find( '.ccl-c-post-search__textbox' );

      this.init();
   };

   postSearch.prototype.init = function(){

      //AJAX event watching for user input and outputting suggested results
      var _this = this,
      timeout,
      query;


     //keyboard events for sending query to database
     this.$input
        .on('keyup keypress', function (event) {

           event.stopImmediatePropagation();

           // clear any previous set timeout
           clearTimeout(timeout);

           // if key is forbidden, return
           if ( forbiddenKeys.indexOf( event.keyCode ) > -1 ) {
              return;
           }

           // get value of search input
           _this.query = _this.$input.val();
           //remove double quotations and other characters from string
           _this.query = _this.query.replace(/[^a-zA-Z0-9 -'.,]/g, "");

           // set a timeout function to update results once 600ms passes
           timeout = setTimeout(function () {

              if ( _this.query.length > 2 ) {

                 _this.fetchPostResults( _this.query );


              }
              else {
                  _this.$resultsList.hide();
                 //_this.$resultsList.html('');
              }

           }, 200);

        })
        .focus(function(){
           if ( _this.$input.val() !== '' ) {
              _this.$resultsList.show();
           }

        })
        .blur(function(event){
           //console.log(' input blurred');
           $(document).on('click', _onBlurredClick);

        });

     function _onBlurredClick(event) {

        if ( ! $.contains( _this.$el[0], event.target ) ) {
           _this.$resultsList.hide();
        }

        $(document).off('click', _onBlurredClick);

     }

     this.$form.on('submit', function( event ){
        event.preventDefault();

        // get value of search input
        // _this.query = _this.$input.val();
        // //remove double quotations and other characters from string
        // _this.query = _this.query.replace(/[^a-zA-Z0-9 -'.,]/g, "");
        console.log(_this.query);


        if ( _this.query.length > 2 ) {

           _this.fetchPostResults( _this.query );


        }
        else {
           _this.$resultsList.hide();
           //_this.$resultsList.html('');
        }

     });
   };

   postSearch.prototype.fetchPostResults = function( query ){
     //send AJAX request to PHP file in WP
     var _this = this,
        data = {
           action      : 'retrieve_post_search_results', // this should probably be able to do people & assets too (maybe DBs)
           query       : query,
           postType    : _this.$postType
        };

     _this.$inputTextbox.addClass('ccl-is-loading');

     //console.log( _this );

     $.post(CCL.ajax_url, data)
        .done(function (response) {

           //function for processing results
           _this.processPostResults(response);

           //console.log( 'response', response );

        })
        .always(function(){

           _this.$inputTextbox.removeClass('ccl-is-loading');

        });
   };

   postSearch.prototype.processPostResults = function( response ){
      var _this       = this,
         results     = $.parseJSON(response),
         resultCount	= results.count,
         resultItems = $('<ul />').addClass('ccl-c-post-search__results-ul'),
           resultsClose = $('<li />')
              .addClass('ccl-c-search--close-results')
              .append( $('<div />').addClass('ccl-c-post-search__count ccl-u-weight-bold ccl-u-faded')
                    .append( $('<i />').addClass('ccl-b-icon arrow-down') )
                    .append( $('<span />').html( '&nbsp;&nbsp' + resultCount + ' found') )
                 )
              .append( $('<button />').addClass('ccl-b-close ccl-c-search--close__button').attr('arial-label', 'Close')
                       .append( $('<i />').attr('aria-hidden', true ).addClass('ccl-b-icon close ccl-u-weight-bold ccl-u-font-size-sm') )
                 );



         if( results.posts.length === 0 ){
           this.$resultsList.html('');
             this.$resultsList.show().append( $('<div />').addClass('ccl-u-py-nudge ccl-u-weight-bold ccl-u-faded').html('Sorry, no databases found - try another search') );

             return;
         }

         this.$resultsList.html('');

         resultItems.append( resultsClose );

         $.each( results.posts, function( key, val ){

               var renderItem = $('<li />')
                 .append(
                    $('<a />')
                       .attr({
                           'href'   : val.post_link,
                           'target' : '_blank',
                       })
                       .addClass('ccl-c-database-search__result-item')
                       .html( val.post_title + (val.post_alt_name ? '<div class="ccl-u-weight-normal ccl-u-ml-nudge ccl-u-font-size-sm">(' + val.post_alt_name + ')</div>' : '' ) )
                       .append( $('<span />')
                                .html( 'Access&nbsp;&nbsp;' )
                                .append( $('<i />')
                                         .addClass('ccl-b-icon arrow-right')
                                         .attr({
                                         'aria-hidden'	: true,
                                         'style'			: "vertical-align:middle"
                                         })
                                   )
                          )
                    );

             resultItems.append( renderItem );

         } );

         this.$resultsList.append( resultItems ).show();

        //cache the response button after its added to the DOM
        _this.$responseClose	= _this.$el.find('.ccl-c-search--close__button');

        //click event to close the results page
        _this.$responseClose.on( 'click', function(event){
              //hide
              if( $( _this.$resultsList ).is(':visible') ){
                 _this.$resultsList.hide();
              }
        });


   };

   $(document).ready(function(){

      $('.ccl-c-post-search').each( function(){
           new postSearch(this);
      });

   });

} )( this, jQuery );
/**
* Quick Nav
*
* Behavior for the quick nav
*/

( function( window, $ ) {
  'use strict';
   var $window = $(window),
      document = window.document;

   var QuickNav = function(el){

      this.$el = $(el);
      this.$subMenus = this.$el.find('.sub-menu');
      this.$scrollSpyItems = this.$el.find('.ccl-c-quick-nav__scrollspy span');
      this.$searchToggle = this.$el.find('.ccl-is-search-toggle');

      // set the toggle offset and account for the WP admin bar

      if ( $('body').hasClass('admin-bar') && $('#wpadminbar').css('position') == 'fixed' ) {
           var adminBarHeight = $('#wpadminbar').outerHeight();
           //this.toggleOffset = $('.ccl-c-user-nav').offset().top + $('.ccl-c-user-nav').outerHeight() - adminBarHeight;
           this.toggleOffset = 0.5;

      } else if ( $('body').hasClass('admin-bar') && $('#wpadminbar').css('position') == 'absolute' ) {
          var adminBarHeight = $('#wpadminbar').outerHeight();
          this.toggleOffset = adminBarHeight;
      } else {
           //this.toggleOffset = $('.ccl-c-user-nav').offset().top + $('.ccl-c-user-nav').outerHeight();
           this.toggleOffset = 0.5;
      }

      this.init();
   };

   QuickNav.prototype.init = function(){

      this.initScroll();
      this.initMenus();
      this.initScrollSpy();
      this.initSearch();

   };

   QuickNav.prototype.initScroll = function(){

      var that = this;

      $window.scroll( CCL.throttle( _onScroll, 50 ) );

      function _onScroll() {

           var scrollTop = $window.scrollTop();

           //that.toggleOffset to change when they nav bar becomes fixed
           if ( scrollTop >= that.toggleOffset ) {
              $('.ccl-c-user-nav').addClass('ccl-is-fixed');
               that.$el.addClass('ccl-is-fixed');
           } else {
              $('.ccl-c-user-nav').removeClass('ccl-is-fixed');
               that.$el.removeClass('ccl-is-fixed');
           }

      }

   };

   QuickNav.prototype.initMenus = function(){
      if ( ! this.$subMenus.length ) {
           return;
      }

      this.$subMenus.each(function(){
           var $subMenu = $(this),
               $toggle = $subMenu.siblings('a');

           $toggle.click(function(event){
               event.stopPropagation();
               event.preventDefault();

               if ( $(this).hasClass('ccl-is-active') ) {
                   $(this).removeClass('ccl-is-active ccl-u-color-school');
                   $subMenu.fadeOut(250);
                   return;
               }

               $('.ccl-c-quick-nav__menu a.ccl-is-active')
                   .removeClass('ccl-is-active ccl-u-color-school')
                   .siblings('.sub-menu')
                       .fadeOut(250);

               $(this).toggleClass('ccl-is-active ccl-u-color-school');
               $subMenu.fadeToggle(250);
           });
      });
   };

   QuickNav.prototype.initScrollSpy = function(){

      var that = this;

      this.$scrollSpyItems.each(function(){

           var $spyItem = $(this),
               target = $spyItem.data('target');

           $window.scroll( CCL.throttle( _onScroll, 100 ) );

           function _onScroll() {

               var scrollTop = $window.scrollTop(),
                   targetTop = $(target).offset().top - 350;
                   //console.log("targetTop " + targetTop);
              if ( scrollTop >= targetTop ) {
              //if ( scrollTop >= 0 ) {
                   that.$scrollSpyItems.removeClass('ccl-is-active');
                   $spyItem.addClass('ccl-is-active');
               } else {
                   $spyItem.removeClass('ccl-is-active');
               }

           }

      });

   };

   QuickNav.prototype.initSearch = function(){
      var that = this;
      this.$searchToggle.click(function(event){
           event.preventDefault();
           that.$el.toggleClass('ccl-search-active');
      });
   };

   $(document).ready(function(){
      $('.ccl-c-quick-nav').each(function(){
           new QuickNav(this);
      });
   });

} )( this, jQuery );




/**
* Searchbox Behavior
*/

(function(window, $) {
  'use strict';

  // Global variables
  var document = window.document,
     ENTER = 13,
     TAB = 9,
     SHIFT = 16,
     CTRL = 17,
     ALT = 18,
     CAPS = 20,
     ESC = 27,
     LCMD = 91,
     RCMD = 92,
     LARR = 37,
     UARR = 38,
     RARR = 39,
     DARR = 40,
     forbiddenKeys = [ENTER, TAB, CTRL, ALT, CAPS, ESC, LCMD, RCMD, LARR, UARR, RARR, DARR],
     indexNames = {
        ti: 'Title',
        kw: 'Keyword',
        au: 'Author',
        su: 'Subject'
     };

  // Extend jQuery selector
  $.extend($.expr[':'], {
     focusable: function(el, index, selector) {
        return $(el).is('a, button, :input, [tabindex], select');
     }
  });

  var SearchAutocomplete = function(elem) {
     this.$el = $(elem);
     this.$form = this.$el.find('form');
     this.$input = $(elem).find('.ccl-search');
     this.$response = this.$el.find('.ccl-c-search-results');
     this.$responseList = this.$el.find('.ccl-c-search-results__list');
     this.$responseItems = this.$el.find('.ccl-c-search-item');
     this.$resultsLink = this.$el.find('.ccl-c-search-results__footer');
     this.$searchIndex = this.$el.find('.ccl-c-search-index');
     this.$indexContain = this.$el.find('.ccl-c-search-index-container');
     this.$searchScope = this.$el.find('.ccl-c-search-location');
     this.$worldCatLink = null;

     //check to see if this searchbox has livesearch enabled
     this.$activateLiveSearch = $(this.$el).data('livesearch');
     this.locationType = $(this.$searchScope)
        .find('option:selected')
        .data('loc');

     //lightbox elements
     this.$lightbox = null;
     this.lightboxIsOn = false;

     this.init();
  };

  SearchAutocomplete.prototype.init = function() {
     if (this.$activateLiveSearch) {
        //if livesearch is enabled, then run the AJAX results
        this.initLiveSearch();
     } else {
        //then simple generate generic search box requests
        this.initStaticSearch();
     }
  };

  SearchAutocomplete.prototype.toggleIndex = function() {
     //watch for changes to the location - if not a WMS site, the remove index attribute
     var that = this;

     this.$searchScope.on('change', function() {
        that.getLocID();

        if (that.locationType != 'wms') {
           that.$indexContain.addClass('ccl-search-index-fade').fadeOut(250);
        } else if (that.locationType == 'wms') {
           that.$indexContain.fadeIn(250).removeClass('ccl-search-index-fade');
        }
     });
  };

  SearchAutocomplete.prototype.getLocID = function() {
     //function to get the ID of location
     var that = this;
     that.locationType = $(that.$searchScope)
        .find('option:selected')
        .attr('data-loc');

     //console.log( that.locationType );
  };

  SearchAutocomplete.prototype.initLiveSearch = function() {
     //AJAX event watching for user input and outputting suggested results
     var that = this,
        timeout;

     this.initLightBox();
     this.toggleIndex();

     //keyboard events for sending query to database
     this.$input
        .on('keyup', function(event) {
           // clear any previous set timeout
           clearTimeout(that.timeout);

           // if key is forbidden, return
           if (forbiddenKeys.indexOf(event.keyCode) > -1) {
              return;
           }

           // get value of search input
           var query = that.$input.val();
           //remove double quotations and other characters from string
           query = query.replace(/[^a-zA-Z0-9 -'.,@:]/g, '');

           // set a timeout function to update results once 600ms passes
           that.timeout = setTimeout(function() {
              if (query.length > 1) {
                 //set this veriable here cuz we are going to need it later
                 that.getLocID();
                 that.$response.show();
                 that.fetchResults(query);
              } else {
                 that.$responseList.html('');
              }
           }, 300);
        })
        .focus(function() {
           if (that.$input.val() !== '') {
              that.$response.show();
           }
        })
        .blur(function(event) {
           $(document).on('click', _onBlurredClick);
        });

     function _onBlurredClick(event) {
        if (!$.contains(that.$el[0], event.target)) {
           that.$response.hide();
        }

        $(document).off('click', _onBlurredClick);
     }

     //send query to database based on option change
     this.$searchIndex.add(this.$searchScope).change(function() {
        that.onSearchIndexChange();
     });

     //on submit fire off catalog search to WMS
     this.$form.on('submit', { that: this }, that.handleSubmit);
  };

  SearchAutocomplete.prototype.initStaticSearch = function() {
     //if static, no AJAX watching, in this case - just looking for submissions
     var that = this;

     this.toggleIndex();

     //on submit fire off catalog search to WMS
     this.$form.on('submit', { that: this }, that.handleSubmit);
  };

  SearchAutocomplete.prototype.handleSubmit = function(event) {
     var that = event.data.that;
     event.preventDefault();

     if (that.$activateLiveSearch) {
        clearTimeout(that.timeout);
     }

     //get search index and input value
     var searchIndex = that.$searchIndex.val();
     var queryString = that.$input.val();

     //check location type
     that.getLocID();

     //if this URL is for WMS, then append the searchindex to it, if not, then sent queryString only
     //setup array for constructSearchURL()
     var inputObject = {};
     inputObject.queryString = that.locationType === 'wms' ? searchIndex + ':' + queryString : queryString;
     inputObject.searchScope = that.$searchScope.val();

     //if query string has content, then run
     if (queryString.length > 1) {
        var wmsConstructedUrl = that.constructSearchURL(inputObject);

        //console.log( wmsConstructedUrl );

        if (that.locationType === 'wp_ccl') {
           window.open(wmsConstructedUrl, '_self');

           $(window).unload(function() {
              that.$searchScope.prop('selectedIndex', 0);
           });
        } else {
           window.open(wmsConstructedUrl, '_blank');
        }
     } else {
        return;
     }
  };

  SearchAutocomplete.prototype.fetchResults = function(query) {
     //send AJAX request to PHP file in WP
     var that = this,
        data = {
           s: query
        };

     that.$el.addClass('ccl-is-loading');

     console.log('api', CCL.api.search);
     console.log('data', data);

     $.get(CCL.api.search, data)
        .done(function(response) {
           that.handleResponse(response);
           console.log('response', response);
        })
        .always(function() {
           that.$el.removeClass('ccl-is-loading');
        });
  };

  SearchAutocomplete.prototype.handleResponse = function(response) {
     //Process the results from the API query and generate HTML for dispplay

     console.log(response);

     var that = this,
        results = response,
        count = results.count,
        query = results.query,
        posts = results.posts,
        searchIndex = $(that.$indexContain).is(':visible') ? that.$searchIndex.val() : 'kw',
        searchIndexNicename = indexNames[searchIndex],
        searchScopeData = $(that.$searchScope),
        renderedResponse = [];

     // wrap query
     //var queryString = searchIndex + ':' + query;

     //get wms_url inputObject = {queryString, searchScope, locationType}
     var inputObject = {};
     inputObject.queryString = that.locationType === 'wms' ? searchIndex + ':' + query : query;
     inputObject.searchScope = that.$searchScope.val();

     //URL created!
     var wmsConstructedUrl = that.constructSearchURL(inputObject);

     // Clear response area list items (update when Pattern Library view isn't necessary)
     that.$responseList.html('');
     that.$resultsLink.remove();

     //add the close button
     var resultsClose =
        '<div class="ccl-c-search--close-results">' +
        '<button type="button" class="ccl-b-close ccl-c-search--close__button" aria-label="Close">' +
        '<span aria-hidden="true">×</span>' +
        '</button>' +
        '</div>';

     // Create list item for Worldcat search.
     var listItem =
        '<a href="' +
        wmsConstructedUrl +
        '" class="ccl-c-search-item ccl-is-large" role="listitem" target="_blank" style="border:none;">' +
        '<span class="ccl-c-search-item__type">' +
        '<i class="ccl-b-icon book" aria-hidden="true"></i>' +
        '<span class="ccl-c-search-item__type-text">WorldCat</span>' +
        '</span>' +
        '<span class="ccl-c-search-item__title">' +
        'Search by ' +
        searchIndexNicename +
        ' for &ldquo;' +
        query +
        '&rdquo; in ' +
        searchScopeData.find('option:selected').text() +
        ' ' +
        '<i class="ccl-b-icon arrow-right" aria-hidden="true" style="vertical-align:middle"></i>' +
        '</span>' +
        '</a>';

     //add HTML to the response array
     renderedResponse.push(resultsClose, listItem);

     // Create list items for each post in results
     if (count > 0) {
        // Create a separator between worldcat and other results
        var separator =
           '<span class="ccl-c-search-item ccl-is-separator" role="presentation">' +
           '<span class="ccl-c-search-item__title">' +
           '<i class="ccl-b-icon arrow-down" aria-hidden="true"></i>' +
           ' Other suggested resources for &ldquo;' +
           query +
           '&rdquo;' +
           '</span>' +
           '</span>';

        //add HTML to response array
        renderedResponse.push(separator);

        // Build results list
        posts.forEach(function(post) {
           // console.log(post);

           var cta, target;

           switch (post.type) {
              case 'Book':
              case 'FAQ':
              case 'Research Guide':
              case 'Journal':
              case 'Database':
                 cta = 'View';
                 target = '_blank';
                 break;
              case 'Librarian':
              case 'Staff':
                 cta = 'Contact';
                 target = '_blank';
                 break;
              default:
                 cta = 'View';
                 target = '_self';
           }

           listItem =
              '<a href="' +
              post.link +
              '" class="ccl-c-search-item" role="listitem" target="' +
              target +
              '">' +
              '<span class="ccl-c-search-item__type">' +
              '<i class="ccl-b-icon ' +
              post.icon +
              '" aria-hidden="true"></i>' +
              '<span class="ccl-c-search-item__type-text">' +
              post.type +
              '</span>' +
              '</span>' +
              '<span class="ccl-c-search-item__title">' +
              post.title +
              '</span>' +
              '<span class="ccl-c-search-item__cta">' +
              '<span>' +
              cta +
              ' <i class="ccl-b-icon arrow-right" aria-hidden="true" style="vertical-align:middle"></i></span>' +
              '</span>' +
              '</a>';

           //add HTML to the response array
           renderedResponse.push(listItem);
        });

        // Build results count/link
        listItem =
           '<div class="ccl-c-search-results__footer">' +
           '<a href="/?s=' +
           query +
           '" class="ccl-c-search-results__action">' +
           'View all ' +
           count +
           ' Results ' +
           '<i class="ccl-b-icon arrow-right" aria-hidden="true"></i>' +
           '</a>' +
           '</div>';

        //add HTML to the response array
        renderedResponse.push(listItem);
     }

     //append all response data all at once
     that.$responseList.append(renderedResponse);

     //cache the response button after its added to the DOM
     that.$responseClose = that.$el.find('.ccl-c-search--close__button');

     //click event to close the results page
     that.$responseClose.on('click', function(event) {
        //hide
        if ($(that.$response).is(':visible')) {
           that.$response.hide();
           that.destroyLightBox();
        }
     });
  };

  SearchAutocomplete.prototype.onSearchIndexChange = function() {
     //on changes to the location or attribute index option, will watch and run fetchResults
     var query = this.$input.val();

     if (!query.length) {
        return;
     }
     this.$response.show();
     this.fetchResults(query);
  };

  SearchAutocomplete.prototype.constructSearchURL = function(inputObject) {
     //constructs URL with parameters from
     //inputObject = { queryString, searchScope, SearchLocation }

     //define variables
     var queryString, searchSrc, searchScopeKey, renderedURL;

     queryString = inputObject.queryString;
     console.log('queryString', queryString);
     searchSrc = inputObject.searchScope;

     switch (this.locationType) {
        case 'wms':
           //check if search location is a scoped search location
           if (searchSrc.match(/::zs:/)) {
              searchScopeKey = 'subscope';
           } else {
              searchScopeKey = 'scope';
           }
           //build the URL
           var wms_params = {
              sortKey: 'LIBRARY',
              databaseList: '',
              queryString: queryString,
              Facet: '',
              //scope added below
              //format added below
              format: 'all',
              database: 'all',
              author: '',
              year: 'all',
              yearFrom: '',
              yearTo: '',
              language: 'all',
              topic: ''
           };

           wms_params[searchScopeKey] = searchSrc;

           console.log('wms_params', wms_params);

           renderedURL = 'https://ccl.on.worldcat.org/search?' + decodeURIComponent($.param(wms_params));
           renderedURL = renderedURL.replace('%26', '&');
           break;

        case 'oac':
           var oacParams;
           oacParams = { query: queryString };

           renderedURL =
              'http://www.oac.cdlib.org/search?' +
              decodeURIComponent($.param(oacParams)) +
              '&institution=Claremont+Colleges';
           break;

        default:
           renderedURL = 'https://library.claremont.edu/' + '?s=' + queryString;
     }

     console.log('renderedURL', renderedURL);
     return renderedURL;
  };

  SearchAutocomplete.prototype.initLightBox = function() {
     var that = this,
        destroyTimeout = 0;

     this.$el
        .on('focusin', ':focusable', function(event) {
           event.stopPropagation();

           // clear timeout because we're still inside the searchbox
           if (destroyTimeout) {
              clearTimeout(destroyTimeout);
           }

           if (!that.lightboxIsOn) {
              that.createLightBox(event);
           }
        })
        .on('focusout', ':focusable', function(event) {
           // set a short timeout so that other functions can check and clear if need be
           destroyTimeout = setTimeout(function() {
              that.destroyLightBox();
              that.$response.hide();
           }, 100);
        });

     this.$response.on('click', function(event) {
        // clear destroy timeout because we're still inside the searchbox
        if (destroyTimeout) {
           clearTimeout(destroyTimeout);
        }
     });
  };

  SearchAutocomplete.prototype.createLightBox = function(event) {
     this.lightboxIsOn = true;

     this.$el.addClass('is-lightboxed');
     this.$lightbox = $('<div class="ccl-c-lightbox">').appendTo('body');
     var searchBoxTop = this.$el.offset().top - 128 + 'px';
     var targetTop = $(event.target).offset().top - 128 + 'px';

     // prevents the scrollbar from jumping if the user is tabbing below the fold
     // if the searchbox and the target are the same - then it will jump, if not,
     // then it won't jump
     if (searchBoxTop == targetTop) {
        $('html, body').animate({ scrollTop: searchBoxTop });
     }
  };

  SearchAutocomplete.prototype.destroyLightBox = function() {
     if (this.$lightbox) {
        this.$lightbox.remove();
        this.$lightbox = null;
        this.$el.removeClass('is-lightboxed');
        this.lightboxIsOn = false;
     }
  };

  $(document).ready(function() {
     // .each() will fail gracefully if no elements are found
     $('.ccl-js-search-form').each(function() {
        new SearchAutocomplete(this);
     });
  });
})(this, jQuery);

/**
*
* SlideToggle
*
*  tabs for hiding and showing additional content
*/

( function( window, $ ) {
  'use strict';
  var document = window.document;

   var slideToggleList = function(el){
      this.$el                = $(el);
      this.$slideToggleLink   = this.$el.find('.ccl-c-slideToggle__title');
      this.$toggleContainer   = this.$el.find('.ccl-c-slideToggle__container');

      this.init();
   };

   slideToggleList.prototype.init = function(){
      var _that = this;

      this.$slideToggleLink.on('click', function(evt){
           evt.preventDefault();
           //get the target to be opened
           var clickItem = $(this);
           //get the data target that corresponds to this link
           var target_content = clickItem.attr('data-toggleTitle');

           //add the active class so we can do stylings and transitions
           clickItem
               .toggleClass('ccl-is-active')
               .siblings()
               .removeClass('ccl-is-active');

           //toggle aria
           if (clickItem.attr( 'aria-expanded') === 'true') {
                   $(clickItem).attr( 'aria-expanded', 'false');
               } else {
                   $(clickItem).attr( 'aria-expanded', 'true');
           }

           //locate the target element and slidetoggle it
           _that.$toggleContainer
               .find( '[data-toggleTarget="' + target_content + '"]' )
               .slideToggle('fast');
               //toggle aria-expanded

           //toggle aria
           if (_that.$toggleContainer.attr( 'aria-expanded') === 'true') {
                   $(_that.$toggleContainer).attr( 'aria-expanded', 'false');
               } else {
                   $(_that.$toggleContainer).attr( 'aria-expanded', 'true');
               }
      });
   };

   $(document).ready(function(){
      $('.ccl-c-slideToggle').each( function(){
           new slideToggleList(this);
      });

   });

} )( this, jQuery );
