window.poojy = window.poojy || {};

(function($){
	'use strict';
	$.fn.poojyHeroSlider = function (options) {
		var settings = $.extend({}, $.fn.poojyHeroSlider.defaults, options);

		return this.each(function(){
			var el=this,
				body = document.getElementsByTagName('body')[0],
				activeSlide = 0,
				v={};

			v.sizes = {};
			v.player = false;
			v.onPlay = false;
			v.stripbuilded = false;
			v.slides = el.querySelectorAll('.hero-slide-item');
			if ( v.slides.length < 1 ) return false;

			function setup() {

				if ( ! v.stripbuilded && v.slides.length > 1 ) {
					var c = document.createDocumentFragment(),
						dv = document.createElement('div'),
						bull;

					c.appendChild(dv);

					dv.id = 'poojySlideProgress';
					dv.style.opacity = 0;

					bull = '';
					for(var n = 0; n < v.slides.length; n++ ) {
						bull += '<a id="slide-bullet-'+n+'" data-index="'+n+'" href="#" style="width:'+ Math.round(100/v.slides.length) +'%"></a>';
					}

					dv.innerHTML = '<div id="slideNumbering"><span class="current">01</span> / '+( v.slides.length<10 ? '0'+v.slides.length : v.slides.length )+'</div><div id="slideBullets">'+bull+'</div>';
					el.appendChild(c);
					v.stripbuilded = true;
					c = dv = bull = null;
				}

				// resize the images manually,
				// we need to use this instead background-size cover
				// to get the real scale
				for(var i = 0; i < v.slides.length; i++ ) {
					var slide = v.slides[i],
						img = slide.querySelector('img'),
						dataSize = ( typeof $(slide).data('sizes') !== 'undefined' ? $(slide).data('sizes') : {width: img.naturalWidth, height: img.naturalHeight, ratio: (img.naturalWidth / img.naturalHeight).toFixed(2)} );

					var widthRatio = v.sizes.w / dataSize.width,
						heightRatio = v.sizes.h / dataSize.height;

					if (widthRatio > heightRatio) {
						dataSize.newWidth = v.sizes.w;
						dataSize.newHeight = Math.ceil( v.sizes.w / dataSize.ratio );
					} else {
						dataSize.newHeight = v.sizes.h;
						dataSize.newWidth = Math.ceil( v.sizes.h * dataSize.ratio );
					}

					dataSize.top = (v.sizes.h-dataSize.newHeight)/2;
					dataSize.left = (v.sizes.w-dataSize.newWidth)/2;

					img.style.maxWidth = 'none';
					img.style.width = dataSize.newWidth+'px';
					img.style.height = dataSize.newHeight+'px';
					img.style.top = dataSize.top+'px';
					img.style.left = dataSize.left+'px';

					$(slide).data('sizes', dataSize);

					// setup the content.
					if ( $(slide).find('.gallery-content').length && $(slide).find('.text-part').length < 1 ) {
						// setup the title
						$(slide).find('.entry-title').css({opacity: 1});
						$(slide).find('.entry-title').html( function(i,html) {
							var texts = $.trim(html);
							return '<span class="word-part" style="display:inline-block">'+ texts.replace(/ /g, '</span> <span class="word-part" style="display:inline-block">') +'</span>';
						});
						$(slide).find('.entry-title').find('*').addBack().contents().each(function(){
							if (this.nodeType == 3) {
								var $this = $(this);
								$this.replaceWith($this.text().replace(/\S/g, "<span class=\"text-part\">$&</span>"));
							}
						});
					}
				}
			};

			function play() {
				// show the first slide
				anime({
					targets: v.slides[activeSlide],
					scale: [1.2, 1],
					opacity: [0,1],
					duration: settings.speed,
					easing: 'easeInOutQuad',
					complete: function() {
						show_content();
						$(v.slides[activeSlide]).css({zIndex: 2});
						if ( v.slides.length > 1 && settings.autoPlay ) {
							v.player = window.requestInterval(function(){
								loop();
							}, settings.interval+(settings.speed*3));
						}

						if ( v.slides.length < 2 ) {
							$(settings.nextButtonId).hide();
							$(settings.previousButtonId).hide();
						} else {
							attachButtonListener();
							
							anime({
								targets: '#poojySlideProgress',
								translateY: [50, 0],
								opacity: [0,1],
								duration: 500,
								easing: 'easeInOutQuad',
								complete: function() {
									$('#slide-bullet-0').addClass('current-bullet');
								}
							})
						}
					}
				});
			};

			function show_content() {
				var slide = v.slides[activeSlide];
				if ( slide.querySelector('.gallery-content') ) {
					var nextspan = slide.querySelectorAll('.text-part');

					anime({
						targets: slide.querySelector('.gallery-content'),
						opacity: [0,1],
						duration: 500,
						easing: 'linear',
					});		

					if ( nextspan.length < 1 ) {
						$(slide).find('.container > *').css({opacity: 0});
						anime({
							targets: slide.querySelector('.container').querySelectorAll(':scope > *'),
							translateY: [50, 0],
							opacity: 1,
							easing: 'easeInOutQuad',
							duration: 500,
							delay: function(el, i, l) { return i * 50; },
						});
						return false;
					}

					$(slide).find('.text-part').css({opacity: 0});
					$(slide).find('.container > *:not(.entry-title)').css({opacity: 0});

					anime({
						targets: nextspan,
						opacity: 1,
						translateX: [20, 0],
						translateY: [50, 0],
						translateZ: [0, 0],
						duration: 700,
						easing: 'easeInOutQuad',
						delay: function(el, i, l) { return i * 50; },
						complete: function() {
							var pc = $(slide).find('.container > .project-cat')[0],
								bt = $(slide).find('.container > .btn')[0];
							anime({
								targets: [pc, bt],
								translateY: [50, 0],
								opacity: 1,
								easing: 'easeInOutQuad',
								duration: 500,
								delay: function(el, i, l) { return i * 50; },
							});
						}
					});
				}
			};

			function hide_content( slideNow ) {
				var $now = slideNow;

				var nextspan = $now[0].querySelectorAll('.text-part');

				if ( nextspan.length < 1 ) {
					anime({
						targets: $now[0].querySelector('.container').querySelectorAll(':scope > *'),
						translateY: [0, 50],
						opacity: [1,0],
						easing: 'easeInOutQuad',
						duration: 500,
						delay: function(el, i, l) { return i * 50; },
					});
					return false;
				}

				anime({
					targets: nextspan,
					opacity: [1,0],
					translateY: [0, 50],
					duration: 500,
					easing: 'easeInOutQuad',
					delay: function(el, i, l) { return i * 50; },
				});

				var pc = $($now).find('.container > .project-cat')[0],
					bt = $($now).find('.container > .btn')[0];
				anime({
					targets: [pc, bt],
					opacity: [1,0],
					translateY: [0, 50],
					easing: 'easeInOutQuad',
					duration: 500,
					delay: function(el, i, l) { return i * 50; },
				});

				anime({
					targets: $now[0].querySelector('.gallery-content'),
					opacity: [1,0],
					duration: 500,
					easing: 'linear',
				});
			};

			function preparerow(direction) {
				// reset && fill our rows
				var rows = el.querySelectorAll('.poojyRows'),
					aSlide = activeSlide,
					nSlide = aSlide,
					slideNow = $(v.slides[aSlide]),
					sizes = slideNow.data('sizes');

				if ( typeof direction === 'undefined' ) direction = 'next';

				if ( typeof direction === 'number' ) {
					nSlide = direction;
				} else { 
					(direction === 'next') ? nSlide++ : nSlide--;
				}

				if ( nSlide === v.slides.length ) {
					nSlide = 0;
				}

				if ( nSlide < 0 ) {
					nSlide = v.slides.length-1;
				}

				var slideNext = $(v.slides[nSlide]),
					sizesN = slideNext.data('sizes');

				for( var i = 0; i < rows.length; i++ ) {
					var l = i;
					rows[l].style.height = v.sizes.h/settings.rows+'px';
					rows[l].style.top = i*(v.sizes.h/settings.rows)+'px';
					rows[l].style.display = 'block';

					rows[l].querySelector('.n-front').style.backgroundImage = 'url('+ slideNow.find('img').attr('src') +')';
					rows[l].querySelector('.n-front').style.backgroundSize = sizes.newWidth+'px '+sizes.newHeight+'px';
					rows[l].querySelector('.n-front').style.backgroundPosition = sizes.left+'px '+ ( (sizes.top*-1) + (l*(v.sizes.h/settings.rows)))*-1 +'px';
					rows[l].querySelector('.n-front').style.backgroundRepeat = 'no-repeat';

					rows[l].querySelector('.n-back').style.backgroundImage = 'url('+ slideNext.find('img').attr('src') +')';
					rows[l].querySelector('.n-back').style.backgroundSize = sizesN.newWidth+'px '+sizesN.newHeight+'px';
					rows[l].querySelector('.n-back').style.backgroundPosition = sizesN.left+'px '+ ( (sizesN.top*-1) + (l*(v.sizes.h/settings.rows)))*-1 +'px';
					rows[l].querySelector('.n-back').style.backgroundRepeat = 'no-repeat';
				}				
			}

			function loop( direction, callback ) {
				var rows = el.querySelectorAll('.n-holder'),
					slideNow = $(v.slides[activeSlide]);

				if ( v.onPlay ) {
					return false;
				}

				v.onPlay = true;

				preparerow(direction);
				slideNow.css({zIndex: 1});
				slideNow.find('img').css({opacity: 0});
				hide_content(slideNow);

				if ( typeof direction === 'undefined' ) direction = 'next';

				if ( typeof direction === 'number' ) {
					activeSlide = direction;
				} else { 
					(direction === 'next') ? activeSlide++ : activeSlide--;
				}

				if ( activeSlide === v.slides.length ) {
					activeSlide = 0;
				}

				if ( activeSlide < 0 ) {
					activeSlide = v.slides.length-1;
				}
				
				$('.current-bullet').removeClass('current-bullet');
				$('#slide-bullet-'+activeSlide).addClass('current-bullet');
				$('#slideNumbering').find('.current').text( ( (activeSlide+1) > 9 ? (activeSlide+1) : '0'+(activeSlide+1) ) );

				var ua = window.navigator.userAgent;
				var is_ie = /MSIE|Trident/.test(ua);
				
				if ( is_ie ) {
					$(rows).css({backfaceVisibility: 'visible'});
					$(rows).find('.n-front').css({zIndex: 1,backfaceVisibility: 'visible'});
					$(rows).find('.n-back').css({zIndex: 0,backfaceVisibility: 'visible'});
				}
						
				anime({
					targets: rows,
					scale: [ {value : 0.8}, {value: 0.5}, {value: 1}],
					translateY: [ {value : 100}, {value : -100}, {value: -50}, {value: 0}],
					rotateX: [ {value : '0deg'}, {value: '180deg'}, {value: '180deg'}],
					duration: settings.speed*3,
					easing: 'easeInOutQuad',
					update: function(anim) {
						if ( is_ie && Math.round(anim.progress) === 34 ) {
							$(rows).find('.n-front').css({zIndex: 0});
							$(rows).find('.n-back').css({zIndex: 1});
						}
					},
					delay: anime.stagger(75, {direction: 'reverse'}),
					complete: function() {
						
						show_content();

						$(v.slides[activeSlide]).css({zIndex: 2, opacity:1});
						$(v.slides[activeSlide]).find('img').css({opacity:1});
						$('.poojyRows').each(function(){
							$(this).css({display: 'none'});
							$(this).find('.n-holder').css({
								webkitTransform: '',
								transform: '',
							});
						});
						v.onPlay = false;
						if ( typeof callback === 'function' ) {
							callback();
						}
					}
				});
			}

			function getParentSize() {		
				if ( $('#countFrame').length < 1 ) {
					var f = document.createElement('iframe');
					f.id = 'countFrame';
					f.style.height = '100%';
					f.style.width = '100%';
					f.style.border = '0';
					f.style.margin = '0';
					f.style.padding = '0';
					f.style.top = '0';
					f.style.left = '0';
					f.style.position = 'fixed';
					f.style.zIndex = '-99';
					body.appendChild(f);
				}

				var iframeWin = document.getElementById('countFrame').contentWindow;
				v.sizes.h = iframeWin.document.body.scrollHeight;
				v.sizes.w = iframeWin.document.body.scrollWidth;
				el.style.height = v.sizes.h+'px';
				
				iframeWin.addEventListener('resize', function(){
					v.sizes.h = this.document.body.scrollHeight;
					v.sizes.w = this.document.body.scrollWidth;
					el.style.height = v.sizes.h+'px';
					setup();
				});
			}

			function attachButtonListener() {
				$(settings.nextButtonId).unbind().on('click', function(e) {
					e.preventDefault();
					loop();
				});

				$(settings.previousButtonId).unbind().on('click', function(e) {
					e.preventDefault();
					loop('prev');
				});

				$('#slideBullets').find('a').each(function(){
					var $a = $(this),
						index = $a.data('index');

					$a.unbind().on('click', function(e) {
						e.preventDefault();

						if ( parseInt(index) !== activeSlide ) {
							loop( parseInt(index) );
						}
					});
				});

				$(document.documentElement).on( 'keyup', function (e) {
					if (e.keyCode == 39) {
						loop();
					}

					if (e.keyCode == 37) {
						loop('prev');
					}
				});
			};

			function init() {
				var c = document.createDocumentFragment();
				for(var i = 0; i < settings.rows; i++ ) {
					var dv = document.createElement('div');
					dv.className = 'poojyRows';
					dv.style.position = 'absolute';
					dv.style.width = '100%';
					dv.style.height = Math.ceil(100/settings.rows)+'%';
					dv.style.left = 0;
					dv.style.top = i*Math.ceil(100/settings.rows)+'%';
					dv.style.zIndex = 1;
					c.appendChild(dv);
					dv.innerHTML = '<div class="n-holder"><div class="n-front"></div><div class="n-back"></div></div>';
				}

				el.appendChild(c);
				getParentSize();
				setup();
				play();
			}
			init();
		});
	};

	$.fn.poojyHeroSlider.defaults = {
		speed: 800,
		autoPlay: false,
		interval: 6000,
		rows: 7,
		nextButtonId: '#project-gallery-next',
		previousButtonId: '#project-gallery-prev',
	};
})(window.jQuery);

( function($) {
	'use strict';
	var self = window.poojy,
		html = document.documentElement,
		body = document.getElementsByTagName('body')[0],
		windowRezize = false;

	PIXI.utils.skipHello();
	// get initial window size
	self.sizes = {}
	self.audioPlayer = false;
	self.activeId = 0;
	self.onPageMove = false;
	self.portfolioOnShow = false;
	self.onAjax = false;
	self.sizes.w = window.innerWidth||html.clientWidth||body.clientWidth;
	self.sizes.h = window.innerHeight||html.clientHeight||body.clientHeight;

	// map all section ids
	self.mainIds = $.map( $('.page-section'), function(el){
		return el.id;
	});

	// replace html class
	html.className = html.className.replace(/\bno-js\b/,'js');

	// set the renderer, use it for global
	self.renderer = new PIXI.autoDetectRenderer( self.sizes.w, self.sizes.h, { transparent: true, autoResize: true });

	// append the canvas to body
	body.appendChild( self.renderer.view );
	// style up the canvas
	self.renderer.view.style.position  = 'fixed';
	self.renderer.view.style.maxWidth  = '100%';
	self.renderer.view.style.width     = '100%';
	self.renderer.view.style.height    = '100%';
	self.renderer.view.style.zIndex    = '-99';
	self.renderer.view.style.top       = '0';
	self.renderer.view.style.left      = '0';
	self.renderer.view.style.webkitPerspective = '1000';
	self.renderer.view.style.perspective = '1000';

	// Create a new stage, will use it for global animations.
	self.pixiStage = new PIXI.Container();
	self.imgParticle = poojyOptions.imgParticle;
	self.audioFile = poojyOptions.audio;
	
	if ( self.audioFile === "" || typeof poojyOptions.audio === 'undefined' ) {
		self.audioFile = false;
	}

	if ( ! PIXI.loader.resources.hasOwnProperty(self.imgParticle) ) {
		PIXI.loader.add( self.imgParticle );
	}

	self.init = function() {
		self.iframeHelper();

		if ( $('#poojy-site-preloader').length ) {
			anime({
				targets: '#poojy-site-preloader',
				scale: [1, 1.2],
				opacity: [1,0],
				duration: 800,
				easing: 'easeInOutSine',
				complete: function() {
					$('#poojy-site-preloader').remove();
				}
			});
		}
		self.mapSetup();
		self.miscFunctions();
		self.singleProjectInit();
		self.mobileMenu();
	};

	// Helper to detect the right active section size in real time
	self.iframeHelper = function() {
		if ( $('.page-section').length < 1 ) {
			return false;
		}

		var c = document.createDocumentFragment(),
			f = document.createElement('iframe');

		c.appendChild(f);
		f.id = 'hFrame';
		f.style.height = '100%';
		f.style.width = '100%';
		f.style.border = '0';
		f.style.margin = '0';
		f.style.padding = '0';
		f.style.top = '0';
		f.style.left = '0';
		f.style.position = 'absolute';
		f.style.zIndex = '-101';

		document.querySelector('#'+self.mainIds[self.activeId]).appendChild(c);

		var iframeHelper = document.getElementById('hFrame').contentWindow;

		iframeHelper.addEventListener('resize', function(){
			var rH = this.document.body.scrollHeight;
			
			if( !self.portfolioOnShow ) {
				if ( $('#'+self.mainIds[self.activeId]).hasClass('site-hero') ) {
					$('#main').css({height: $(window).height()+'px', overflow: '' });
				} else {
					$('#main').css({height: rH+'px', overflow: '' });
				}
			}
		});

		$(window).on('hasChangePage', function() {
			$('#hFrame').appendTo( $('#'+self.mainIds[self.activeId]) );
			iframeHelper = document.getElementById('hFrame').contentWindow;
			iframeHelper.addEventListener('resize', function(){
				var rH = this.document.body.scrollHeight;
				
				if( !self.portfolioOnShow ) {
					if ( $('#'+self.mainIds[self.activeId]).hasClass('site-hero') ) {
						$('#main').css({height: $(window).height()+'px', overflow: '' });
					} else {
						$('#main').css({height: rH+'px', overflow: '' });
					}
				}
			});
		});
	};

	self.setHeaderOverlay = function() {
		var fC = $('#'+self.mainIds[self.activeId]).find('>*:first-child');

		if ( !$(fC).hasClass('section-header') ) {
			if ( $(fC).attr('id') !== 'project-gallery' ) {
				$('#main-header').addClass('no-overlay');
			}
		} else {
			$('#main-header').removeClass('no-overlay');
		}
	};

	// One page init
	self.onePageInit = function() {
		if ( $('.page-section').length < 1 ) {
			return false;
		}

		var sectionWrap = document.querySelector('.inner-pages-wrap');

		// initial document height
		$('#main').css({height: $('#'+self.mainIds[self.activeId]).height()+'px' });
		// set active menu item
		$('.main-nav').find('a[href*="'+self.mainIds[self.activeId]+'"]').parent().addClass('current-menu-item');
		self.setHeaderOverlay();

		if ( self.activeId < 1 ) {
			$('#site-footer').hide();
		}
		// reset
		$(window).scrollTop(0).scrollLeft(0);
		$('body, html').scrollTop(0).scrollLeft(0);
		

		// check if any hash in current URL
		if ( window.location.hash ) {
			var nh = window.location.hash.substring(1);

			if ( nh !== "" ) {
				$('.inner-pages-wrap').css({
					webkitTransform: 'translateY(0) translateX(0) translateZ(0)',
					transform: 'translateY(0) translateX(0) translateZ(0)',
				});
				//safari fix
				$('#main, .inner-pages-wrap').scrollLeft(0);
				window.requestTimeout( function() {
					self.movePage(nh);
				},10);
			}
		}

		$(document).unbind().on('click', 'a', function(e){
			var z=this;

			// link to open single project
			if ( $(z).hasClass('to-single-project') ) {
				e.preventDefault();
				self.openPortfolio(z);
			}

			// check if it has hash
			if ( z.href.indexOf('#') !== -1 ) {
				e.preventDefault();
				var ccid = z.hash.substring(1);
				
				if ( ccid !== "" ) {
					self.movePage(ccid);
				}
			}
		});

		if ("onhashchange" in window) {
			$(window).on('hashchange', function(e) {
				e.preventDefault();
				var nh = window.location.hash.substring(1);

				self.movePage(nh);
			});
		}

		$(window).on('finishResize', function() {
			if( !self.portfolioOnShow ) {
				anime.set(sectionWrap,{
					translateX: (self.sizes.w*self.activeId)*-1,
					translateY: 0,
					translateZ: 0,
				});
			}
		});
	};

	// Page transitions
	self.movePage = function( elid ) {
		if ( typeof elid === 'undefined' || $('#'+elid).length < 1 ) {
			return false;
		}

		if ( self.onPageMove ) {
			return false;
		}

		if ( self.onAjax ) {
			return false;
		}

		var after = false,
			sectionWrap = document.querySelector('.inner-pages-wrap');

		// markup is exists but it is not one of our section ids
		// so it should be id of an element inside the section
		if ( self.mainIds.indexOf(elid) < 0 ) {
			var origtarget = elid,
				parentT = $('#'+origtarget).closest('.page-section');

			// update our elid
			elid = $(parentT).attr('id');

			// tell the script we should move to the target after tansition
			after = function() {
				var posTop = $('#'+origtarget).offset().top;
				anime({
					targets: ['body', 'html'],
					scrollTop: posTop,
					duration: 1000,
					easing: 'easeInOutQuad',
					delay: 200,
					complete: function() {
						window.location.hash = origtarget;
					}
				});
			}
		}

		// the hash is included in main ids
		if ( self.mainIds.indexOf(elid) !== -1 ) {
			self.onPageMove = true;

			if( ! $('.mobile-menu-trigger').is(':hidden') ) {
				anime({
					targets: '.main-nav-wrap',
					translateY: self.sizes.h,
					opacity: 0,
					duration: 500,
					easing: 'easeInOutCirc',
					complete: function() {
						$('.main-nav-wrap').removeAttr('style');
					}
				});	
			}

			if ( self.mainIds.indexOf(elid) === self.activeId ) {
				if ( typeof after === 'function' ) {
					after();
				}
				self.onPageMove = false;
				return false;
			}


			// update the active ID
			self.activeId = self.mainIds.indexOf(elid);
			$('.current-menu-item').removeClass('current-menu-item');
			$('.main-nav').find('a[href*="'+elid+'"]').parent().addClass('current-menu-item');
			$(window).trigger('hasChangePage');

			// Jarallax actually bit confused with our layout,
			// let's hide em, and show it later after init
			$('.jarallax').each(function(){
				var $imim = $(this).find('>img');
				if ( ! $imim.hasClass('jarallax-img') ) {
					anime({
						targets: $imim[0],
						opacity: 0,
						duration: 500,
						easing: 'linear'
					});
				}
			});

			// Scroll to top, if scrollTop is detected
			anime({
				targets: ['body', 'html'],
				scrollTop: 0,
				duration: ( $(window).scrollTop() > 0 ? 1000 : 10 ),
				easing: 'easeInOutCirc',
				complete: function() {

					// set all section height same as window height
					$('#main, .page-section').css({height: self.sizes.h+'px', overflow: 'hidden' });
					// hide footer
					$('#site-footer').hide();

					// Scale them!
					anime({
						targets: document.querySelectorAll('.page-section'),
						scale: [1, 0.75],
						duration: 500,
						easing: 'easeInOutQuad',
						complete: function() {
							
							// Reset the scrollTop value
							$('#'+elid).scrollTop(0);

							// Slide to active section
							anime({
								targets: sectionWrap,
								translateX: (self.sizes.w*self.activeId)*-1,
								translateY: 0,
								translateZ: 0,
								duration: 1000,
								easing: 'easeInOutCirc',
								complete: function() {
									
									// let's forced to focus on active section,
									// to activate window scrollbar if any
									$('#'+elid).trigger('focus');

									// Scale it back!
									anime({
										targets:  document.querySelectorAll('.page-section'),
										scale: 1,
										duration: 500,
										easing: 'easeInOutQuad',
										complete: function() {
											// Reset the height
											$('.page-section').css({height: '', overflow: '' });
											// Set the main container height same with active section height
											$('#main').css({height: $('#'+self.mainIds[self.activeId]).height()+'px', overflow: '' });
											// bind the Jarallax
											self.jarallaxInit();
											self.setHeaderOverlay();
											// change the hash!
											window.location.hash = elid;
											if ( self.activeId < 1 ) {
												$('#site-footer').hide();
											} else {
												$('#site-footer').show();
											}
											self.onPageMove = false;
											if ( typeof after === 'function' ) {
												after();
											}
										}
									});
								}
							});
						}
					});
				}
			});
		}
	};

	// Audio setup
	self.setupAudio = function() {
		if ( ! self.audioFile ) {
			$('.music-sound-ui').remove();
			return false;
		}

		var c = document.createDocumentFragment(),
			dv = document.createElement('button'),
			bars;

		c.appendChild(dv);
		dv.id = 'play-pause-music';
		dv.className = 'initial-play-pause';
		dv.setAttribute('type', 'button');
		bars = '';
		for(var i = 0; i < 10; i++ ) {
			bars += '<span class="bar"></span>';
		}

		bars += '<iframe allow="autoplay" src="assets/images/silence.mp3"></iframe>';
		dv.innerHTML = '<span class="music-bars">'+bars+'</span>';
		if ( $('.music-sound-ui').length ) {
			$('.music-sound-ui').append( $(c) );
		} else {
			document.getElementById('site').appendChild(c);
		}

		PIXI.sound.Sound.from({
			url: self.audioFile,
			autoPlay: true,
			loop: true,
			preload: true,
			singleInstance: true,
			loaded: function(err, sound) {
				var manualPaused = false, initPlay = false;
				sound.volume = poojyOptions.volume/100;
				self.audioPlayer = sound.play();

				// check if browser support the autoplay
				self.audioPlayer.on('progress', function() {
					if ( $('#play-pause-music').hasClass('initial-play-pause') ) {
						$('#play-pause-music').removeClass('initial-play-pause');
						setTimeout(function(){
							initPlay = true
						},500);
					}

					if ( !$('#play-pause-music').hasClass('on-play') ) {
						$('#play-pause-music').addClass('on-play');
					}
				});

				$('#play-pause-music').unbind().on('click', function(e) {
					e.preventDefault();
					if ( !initPlay ) {
						return false;
					}

					if ( $(this).hasClass('on-play') ) {
						$(this).removeClass('on-play');
						manualPaused = true;
						self.audioPlayer = sound.pause();
					} else {
						$(this).addClass('on-play');
						manualPaused = false;
						self.audioPlayer = sound.resume();
					}
				});

				document.addEventListener("visibilitychange", function() {
					if ( document.hidden ) {
						self.audioPlayer = sound.pause();
					} else {
						if( !manualPaused && initPlay ) {
							self.audioPlayer = sound.resume();
						}
					}
				});
			}
		});
	};

	// Intro text, only on first load
	self.intro = function() {
		var x=this, skipButton = $('#skip-intro');

		// change canvas z-index
		self.renderer.view.style.zIndex = '999';
		self.renderer.view.style.pointerEvents = 'none';

		x.pos = 0;
		x.roses = [];
		x.totalSprites = self.renderer instanceof PIXI.WebGLRenderer ? 30 : 10;
		x.el = document.querySelector('#intro');
		x.skip = false;
		x.stages = x.el.querySelectorAll('.intro-stage');
		x.sprites = new PIXI.particles.ParticleContainer(1000, {
			scale: true,
			position: true,
			rotation: true,
			uvs: true,
			alpha: true
		});
		self.pixiStage.addChild(x.sprites);

		x.ticker = new PIXI.ticker.Ticker();
		x.ticker.autoStart = true;
		//x.ticker.stop();

		skipButton.on('click', function(e) {
			e.preventDefault();
			$('canvas').hide();
			$('.intro-stage').css({opacity:0});
			x.skip = true;
			x.stagesAnimate();
		});
		
		for( var i = 0; i < x.stages.length; i++ ) {
			
			$(x.stages[i]).find('>*').each(function(){
				$(this).html( function(i,html) {
					var texts = $.trim(html);
					return '<span class="word-part" style="display:inline-block">'+ texts.replace(/ /g, '</span> <span class="word-part" style="display:inline-block">') +'</span>';
				});
			});

			$(x.stages[i]).find('*').addBack().contents().each(function(){
				if (this.nodeType == 3) {
					var $this = $(this);
					$this.replaceWith($this.text().replace(/\S/g, "<span class=\"text-part\">$&</span>"));
				}
			});
		}

		x.startRender = function() {
			if ( x.ticker !== null && ! x.skip ) {
				self.renderer.render(self.pixiStage);
			}		
		};

		x.stagesAnimate = function() {
			if( x.skip || x.pos === x.stages.length ) {
				// to do, open the content
				anime({
					targets: '#intro',
					opacity: 0,
					duration: 1000,
					easing: 'linear',
					complete: function() {
						$('body').removeClass('intro-start');
						// free up some memory,
						// let's remove unused sprites
						if ( x.sprites ) {
							for (var i = x.sprites.children.length - 1; i >= 0; i--) {
								var c = x.sprites.children[i];
								c.removeAllListeners();
								x.sprites.removeChild(x.sprites.children[i]);
								c.x = 0;
								c.y = 0;
								c.speed = 0;
								c.renderable = false;
								c.visible = false;
							}

							// remove from stage
							self.pixiStage.removeChild(x.sprites);
							// destroy parent sprites
							x.sprites.destroy(true);
							x.sprites = null;
						}

						// let's destory our roses
						window.requestTimeout(function(){
							if ( x.ticker ) {
								x.ticker.stop();
								x.ticker.remove(x.startRender);
								x.ticker.destroy();
								x.ticker = null;
							}

							for( var i=0;i<x.roses.length; i++ ) {
								for( var y=0; y<x.roses[i].length; y++ ) {
									if ( x.roses[i][y] && x.roses[i][y].completed ) {
										x.roses[i][y].alpha = 0;
										x.roses[i][y].destroy(true);
										x.roses[i][y] = null;
									}
								}
							}
							x.roses = [];
						},500);
						
						x.stages = null;
						$('#intro').remove();
						//self.renderer.view.style.zIndex = '-99';
						$('canvas').remove();
					}
				});
				self.onePageInit();
				$('#project-gallery').poojyHeroSlider();
				return false;
			}

			$(x.stages[x.pos]).css({display: 'block'});
			var nextspan = x.stages[x.pos].querySelectorAll('.text-part');
			anime({
				targets: nextspan,
				opacity: 1,
				translateX: [20, 0],
				translateY: [50, 0],
				translateZ: [0, 0],
				duration: 700,
				easing: 'easeInOutQuad',
				delay: function(el, i, l) { return i * 50; },
				complete: function() {
					if ( x.sprites && x.sprites.children.length ) {
						for (var i = x.sprites.children.length - 1; i >= 0; i--) {
							x.sprites.children[i].alpha = 0;
							x.sprites.removeChild(x.sprites.children[i]);
						}
					}
					if (x.stages) {
						x.prepareParticles( x.stages[x.pos] );
					}
					x.pos++;
					nextspan = null;
				}
			});
		};

		x.prepareParticles = function( target ) {
			var m = {
				part: target.querySelectorAll('.text-part'),
				pos: 0,
				player: false,
				onExplode: false,
			};

			for( var i = 0; i < m.part.length; i++ ) {
				var area = m.part[i].getBoundingClientRect();
				
				if ( ! x.roses[i] ) {
					x.roses[i] = [];
				}

				for (var y = 0; y < x.totalSprites; y++) {
					var rose;

					if ( x.roses[i][y] ) {
						rose = x.roses[i][y];
					} else {
						rose = new PIXI.Sprite( PIXI.loader.resources[self.imgParticle].texture );
					}

					rose.anchor.set(0.5);
					rose.scale.set(0.6 + Math.random() * 0.7);

					rose.x = Math.floor( (Math.random() * ((area.left+area.width)-area.left))+area.left);
					rose.y = Math.floor( (Math.random() * ((area.top+(area.height-20))-area.top))+(area.top+20));

					rose.speed = (2 + Math.random() * 2) * 0.2;
					rose.rotation = Math.random() * Math.PI * 2;
					rose.alpha = 0;
					// mark each rose, so we don't animate the wrong one!
					rose.readyNext = 1;

					if ( x.roses[i][y] ) {
						x.roses[i][y] = rose;
					} else {
						x.roses[i].push(rose);
					}
					x.sprites.addChild(rose);
					rose = null;
				}

				area = null;
			}

			window.setTimeout(function() {
				if ( x.skip ) {
					if (m.player) {
						window.clearInterval( m.player );
						m.player = null;
					}
					$(target).css({display: 'none'});
					return false;
				}
				explode();
				m.player = window.setInterval( function() {
					if ( x.skip ) {
						window.clearInterval( m.player );
						m.player = null;
						return false;
					}
					if ( m.pos === m.part.length ) {
						window.clearInterval( m.player );
						m.player = null;
						window.setTimeout(function() {
							$(target).css({display: 'none'});
							if ( !x.skip ) {
								x.stagesAnimate();
							}
						}, (x.pos === x.stages.length ? 2000 : 1000) );
						return false;
					} else {
						explode();
					}
				}, 50);
			}, 1000 );

			function explode() {
				var nowroses = x.roses[m.pos];

				if ( x.skip ) {
					return false;
				}

				for(var y=0; y<nowroses.length; y++ ) {
					var dude = nowroses[y],
						playist = anime,
						dur = ( Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000 )*dude.speed;

					if ( dude.readyNext === 1 ) {
						if ( x.skip ) {
							dude.alpha = 0;
							dude.scale.x = 0;
							dude.scale.y = 0;
						}
						dude.completed = false;
						playist({
							targets: dude,
							y: self.renderer.height,
							x: ( Math.floor(Math.random() * ( (self.renderer.width*0.5) - 0 + 1)) + 0 ),
							alpha: ( x.skip ? 0 : [ (Math.random() * 0.75), 0 ] ),
							readyNext: 0,
							duration: dur,
							delay: function(el,i,l) { return y * 2; },
							easing: 'linear',
							update: function(anim) {
								if ( !dude.visible || x.skip ) {
									anim.pause();
									dude.alpha = 0;
									dude.scale.x = 0;
									dude.scale.y = 0;
								}
							},
							complete: function() {
								dude.alpha = 0;
								dude.completed = true;
								playist = null;
							}
						});
					}
				}

				anime({
					targets: m.part[m.pos],
					filter: ["blur(0px)", "blur(20px)"],
					opacity: [1, 0],
					duration: 400,
					easing: 'linear',
				});
				m.pos++;
				
			}

			x.ticker.add(x.startRender);

		}

		x.stagesAnimate();
	};

	// Close portfolio
	self.closePortfolio = function() {
		anime({
			targets: ['body', 'html'],
			scrollTop: 0,
			duration: ( $(window).scrollTop() > 0 ? 1000 : 10 ),
			easing: 'easeInOutCirc',
			complete: function() {
				anime.set('.inner-pages-wrap',{
					translateX: self.sizes.w
				});

				$('#main > .single-portfolio').stop().animate({
					opacity: 0
				}, 300, function() {

					$(this).remove();
					$('.close-portfolio-wrap').fadeOut(300, function() {
						$(this).remove();
					});
					$('.inner-pages-wrap').show().css({opacity: '', zIndex: '', height: '', position: '', left: '', top: ''});
					self.activeId = 0;

					$('#site-footer').hide();

					if ( $('#'+self.mainIds[self.activeId]).hasClass('site-hero') ) {
						$('#main').css({height: $(window).height()+'px' });
					} else {
						$('#main').css({height: $('#'+self.mainIds[self.activeId]).height()+'px'});
					}

					anime({
						targets: '.inner-pages-wrap',
						translateX: 0,
						easing: 'easeInOutCirc',
						duration: 800,
						complete: function() {
							self.portfolioOnShow = false;
							$('.music-sound-ui').css({marginLeft: ''});
							$('.navbar-brand, .main-nav-wrap, #mobile-menu-trigger').removeAttr('style');

							$(window).trigger('poojyPortfolioClosed');
							if( ! $('.mobile-menu-trigger').is(':hidden') ) {
								anime({
									targets: '.mobile-menu-trigger',
									scale: 1,
									opacity: 1,
									duration: 300,
									easing: 'linear',
									complete: function() {
										$('.mobile-menu-trigger').removeAttr('style');
									}
								});
							}
						}
					});
				});
			}
		});
	};

	self.buttonHandler = function() {
		$(document).on('click', 'button', function(e) {
			if ( this.id === 'close-portfolio' ) {
				e.preventDefault();
				if ( $(this).hasClass('onClosed') ) {
					return false;
				}
				$(this).addClass('onClosed');
				self.closePortfolio();
			}
		});
	};

	// Single portfolio Ajax
	self.openPortfolio = function( caller ) {
		var purl = caller.href;

		if ( self.onAjax ) {
			return false;
		}

		// Move the main container to right
		anime({
			targets: '.inner-pages-wrap',
			translateX: self.sizes.w,
			easing: 'easeInOutCirc',
			duration: 800,
			complete: function() {
				// lock.
				self.onAjax = true;
				anime.set('.inner-pages-wrap',{
					translateX: self.sizes.w*2
				});
				$('.inner-pages-wrap').css({height: self.sizes.h+'px', position: 'absolute', top: 0, left: 0});
				self.loaderIcon('show');

				// AJAX
				$.ajax({
					url : purl,
					type: 'GET',
					error: function(httpRequest, textStatus, errorThrown) {
						alert( 'Something wrong! We got ' + httpRequest.status + ' - ('+ textStatus +') from server. Please try again later!' );
						window.location.reload(false);
						return false;
					},
					success: function(x) {
						var $wholePage = $("<div>").html(x),
							$content = $wholePage.find('#main').html(),
							imgs = $wholePage.find('#main').find('img');

						var btn = $('<div class="close-portfolio-wrap" style="opacity: 0;"><iframe id="cpwc"></iframe><button type="button" id="close-portfolio"><i class="icon ion-ios-close"></i></button></div>');

						// inject the content
						$('#main').removeAttr('style').prepend( $($content) );
						$('.inner-pages-wrap').css({opacity: 0, zIndex: '-999'});
						if ( imgs.length ) {
							// load all images, to make sure all scripts running good
							self.loadAllImages( imgs );

							$(window).on('poojyImagesLoaded', function() {
								self.loaderIcon('hide');

								if( ! $('.mobile-menu-trigger').is(':hidden') ) {
									anime({
										targets: '.mobile-menu-trigger',
										scale: 0,
										opacity: 0,
										duration: 300,
										easing: 'linear'
									});
								}
								anime({
									targets: ['.navbar-brand', '.main-nav-wrap', '#mobile-menu-trigger'],
									opacity: 0,
									translateX: -50,
									duration: 300,
									easing: 'linear',
									complete: function() {
										$('.navbar-brand, .main-nav-wrap, #mobile-menu-trigger').removeAttr('style').hide();
										$('#main-header').prepend( $(btn) );
										$('.music-sound-ui').css({marginLeft: 'auto'});
										anime({
											targets: '.close-portfolio-wrap',
											opacity: 1,
											duration: 300,
											easing: 'linear',
										});
										self.buttonHandler();

										var ifh = document.getElementById('cpwc').contentWindow;
										var rH = ifh.document.body.scrollHeight;
										$('.close-portfolio-wrap').css({width: rH+'px'});

										ifh.addEventListener('resize', function(){
											rH = this.document.body.scrollHeight;
											$('.close-portfolio-wrap').css({width: rH+'px'});
										});
									}
								});

								$('#site-footer').show();
								// trigger functions
								self.singleProjectInit();
								self.miscFunctions();
								self.onAjax = false;
								self.portfolioOnShow = true;
							});
						} else {
							self.loaderIcon('hide');
							
							if( ! $('.mobile-menu-trigger').is(':hidden') ) {
								anime({
									targets: '.mobile-menu-trigger',
									scale: 0,
									opacity: 0,
									duration: 300,
									easing: 'linear'
								});
							}
							anime({
								targets: ['.navbar-brand', '.main-nav-wrap', '#mobile-menu-trigger'],
								opacity: 0,
								translateY: -50,
								duration: 300,
								easing: 'linear',
								complete: function() {
									$('.navbar-brand, .main-nav-wrap, #mobile-menu-trigger').removeAttr('style').hide();
									$('#main-header').prepend( $(btn) );
									$('.music-sound-ui').css({marginLeft: 'auto'});
									anime({
										targets: '.close-portfolio-wrap',
										opacity: 1,
										duration: 300,
										easing: 'linear',
									});
									self.buttonHandler();

									var ifh = document.getElementById('cpwc').contentWindow;
									var rH = ifh.document.body.scrollHeight;
									$('.close-portfolio-wrap').css({width: rH+'px'});

									ifh.addEventListener('resize', function(){
										rH = this.document.body.scrollHeight;
										$('.close-portfolio-wrap').css({width: rH+'px'});
									});
								}
							});

							$('#site-footer').show();
							// trigger functions
							self.singleProjectInit();
							self.miscFunctions();
							self.onAjax = false;
							self.portfolioOnShow = true;
						}

					}
				});
			}
		}); 
	};

	self.loadAllImages = function( imgs ) {
		var c=document.createDocumentFragment(), tracker=[];

		for (var i = imgs.length-1; i >= 0; i--) {
			var im = new Image();
			im.onload = function () {
				tracker.push(im);
				if ( tracker.length >= imgs.length ) {
					$(window).trigger('poojyImagesLoaded');
				}
			};
			im.onerror = function () {
				tracker.push(im);
				if ( tracker.length >= imgs.length ) {
					$(window).trigger('poojyImagesLoaded');
				}
			};
			im.src = $(imgs[i]).attr('src');
			c.appendChild(im);
		}
	};

	self.loaderIcon = function( action ) {
		if ( typeof action === 'undefined' ) {
			action = show;
		}

		if( $('#poojyGlobLoader').length < 1 ) {
			var c = document.createDocumentFragment(),
				dv = document.createElement('div');

			c.appendChild(dv);
			dv.id = 'poojyGlobLoader';
			body.appendChild(c);
		}

		if ( action === 'show' ) {
			$('#poojyGlobLoader').addClass('show');
		} else {
			$('#poojyGlobLoader').removeClass('show');
		}
	};

	self.mobileMenu = function() {
		$('.mobile-menu-button').unbind().on('click', function() {
			if( ! $('.mobile-menu-trigger').is(':hidden') ) {
				anime.set('.main-nav-wrap',{
					translateY: self.sizes.h,
					scale: 1
				});
				anime({
					targets: '.main-nav-wrap',
					translateY: 0,
					opacity: 1,
					duration: 500,
					easing: 'easeInOutCirc'
				});
			}
		});

		$('#mobile-menu-close').unbind().on('click', function() {
			if( ! $(this).is(':hidden') ) {
				anime({
					targets: '.main-nav-wrap',
					translateY: self.sizes.h,
					opacity: 0,
					duration: 500,
					easing: 'easeInOutCirc',
					complete: function() {
						$('.main-nav-wrap').removeAttr('style');
					}
				});
			}
		});
	}

	// Parallax
	self.jarallaxInit = function() {
		if ( $('.jarallax').length ) {
			$('.jarallax').each(function() {
				var t = this, parent = $(this).closest('.page-section');
				if ( ! $(this).find('img').hasClass('jarallax-img') ) {
					$(this).css({opacity: 0})
					$(this).find('img').addClass('jarallax-img').css({opacity: ''});

					if ( /iPad|iPhone|iPod|Android/.test(navigator.userAgent) ) {
						anime({
							targets: t,
							opacity: 1,
							duration: 500,
							easing: 'linear'
						});
					}
				}
				$(this).jarallax({
					speed: 0.2,
					type: 'scale-opacity',
					elementInViewport: '#'+$(parent).attr('id'),
					disableParallax: function() {
						return /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
					},
					onInit: function() {
						anime({
							targets: t,
							opacity: 1,
							duration: 500,
							easing: 'linear'
						});
					}
				});
			});
		}
	};

	// Other functions
	self.miscFunctions = function() {
		var ef=$('.has-reveal-effect');

		// Animated numbers call
		if ( $('.pj-animated-number').length && typeof window.appear !== 'undefined' ) {
			var animNumberReveal = new window.appear({
				elements: function elements() {
					return document.getElementsByClassName('pj-animated-number');
				},
				appear: function appear(el,i) {
					if ( $(el).hasClass('done-animate') ) {
						return;
					}

					$(el).addClass( 'done-animate' );
					
					// animated number
					self.animatedNumber( el );

				},
				bounds: 0
			}); 
		}

		// Progress call
		if ( $('.progress-wrap').length && typeof window.appear !== 'undefined' ) {
			var progressReveal = new window.appear({
				elements: function elements() {
					return document.getElementsByClassName('progress-wrap');
				},
				appear: function appear(el,i) {
					if ( $(el).hasClass('done-animate') ) {
						return;
					}

					$(el).addClass( 'done-animate' );
					
					// animated progress
					self.progressBar( el );

				},
				bounds: 0
			}); 
		}

		// Reveal effects
		if ( ef.length && typeof window.appear !== 'undefined' ) {
			var globReveal = new window.appear({
				elements: function elements() {
					return document.getElementsByClassName('has-reveal-effect');
				},
				appear: function appear(el, dly) {
					if ( $(el).hasClass('done-animate') ) {
						return;
					}

					var effect = $(el).data('effect');
					if ( typeof effect === 'undefined' ) {
						// default
						effect = 'fadeInTop';
					}

					$(el).addClass( 'done-animate' );

					switch( effect ) {
						case 'revealRight':
							$(el).css({opacity:1});
							var rx = $('<span class="revealer" />');
							$(el).addClass('revealOnProc').append( rx );
							rx.css({
								display: 'block',
								left: 0,
								top: 0,
								width: 0,
							});
							anime({
								targets: $(rx)[0],
								width: ['0%', '100%'],
								duration: 500,
								easing: 'easeInOutCirc',
								complete: function() {
									$(rx).css({
										left : 'auto',
										right: 0,
									});
									$(el).removeClass('revealOnProc');

									anime({
										targets: $(rx)[0],
										width: 0,
										duration: 350,
										easing: 'easeInOutCirc',
										delay: 200,
										complete: function() {
											$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
											$(rx).remove();	
										}
									});
								},
							});
							break;
						case 'revealLeft':
							$(el).css({opacity:1});
							var rx = $('<span class="revealer" />');
							$(el).addClass('revealOnProc').append( rx );
							rx.css({
								display: 'block',
								right: 0,
								top: 0,
								width: 0,
							});
							anime({
								targets: $(rx)[0],
								width: ['0%', '100%'],
								duration: 500,
								easing: 'easeInOutCirc',
								complete: function() {
									$(rx).css({
										right : 'auto',
										left: 0,
									});
									$(el).removeClass('revealOnProc');

									anime({
										targets: $(rx)[0],
										width: 0,
										duration: 350,
										easing: 'easeInOutCirc',
										delay: 200,
										complete: function() {
											$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
											$(rx).remove();	
										}
									});
								},
							});
							break;
						case 'revealTop':
							$(el).css({opacity:1});
							var rx = $('<span class="revealer" />');
							$(el).addClass('revealOnProc').append( rx );
							rx.css({
								display: 'block',
								right: 0,
								left: 0,
								bottom: 0,
								height: 0,
							});
							anime({
								targets: $(rx)[0],
								height: ['0%', '100%'],
								duration: 500,
								easing: 'easeInOutCirc',
								complete: function() {
									$(rx).css({
										bottom : 'auto',
										top: 0,
									});
									$(el).removeClass('revealOnProc');

									anime({
										targets: $(rx)[0],
										height: 0,
										duration: 350,
										easing: 'easeInOutCirc',
										delay: 200,
										complete: function() {
											$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
											$(rx).remove();	
										}
									});
								},
							});
							break;
						case 'revealBottom':
							$(el).css({opacity:1});
							var rx = $('<span class="revealer" />');
							$(el).addClass('revealOnProc').append( rx );
							rx.css({
								display: 'block',
								right: 0,
								left: 0,
								top: 0,
								height: 0,
							});
							anime({
								targets: $(rx)[0],
								height: ['0%', '100%'],
								duration: 500,
								easing: 'easeInOutCirc',
								complete: function() {
									$(rx).css({
										top : 'auto',
										bottom: 0,
									});
									$(el).removeClass('revealOnProc');

									anime({
										targets: $(rx)[0],
										height: 0,
										duration: 350,
										easing: 'easeInOutCirc',
										delay: 200,
										complete: function() {
											$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
											$(rx).remove();	
										}
									});
								},
							});
							break;
						case 'fadeIn':
							anime({
								targets: el,
								opacity: [0,1],
								duration: 500,
								easing: 'linear',
								complete: function() {
									$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
								},
							});
							break;
						case 'fadeInLeft':
							anime({
								targets: el,
								opacity: [0,1],
								translateX: [75, 0],
								duration: 500,
								easing: 'easeOutQuad',
								complete: function() {
									$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
								},
							});
							break;
						case 'fadeInRight':
							anime({
								targets: el,
								opacity: [0,1],
								translateX: [-75, 0],
								duration: 500,
								easing: 'easeOutQuad',
								complete: function() {
									$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
								},
							});
							break;
						case 'zoomIn':
							$(el).css({opacity:1,transform: 'scale(0)','-webkit-transform': 'scale(0)'});
							anime({
								targets: el,
								scale: [0, 1],
								duration: 500,
								easing: 'easeOutQuad',
								complete: function() {
									$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
								},
							});
							break;
						case 'fadeInBottom':
							anime({
								targets: el,
								opacity: [0,1],
								translateY: [-75, 0],
								duration: 500,
								easing: 'easeOutQuad',
								complete: function() {
									$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
								},
							});
							break;
						case 'fadeInTop':
						default:
							anime({
								targets: el,
								opacity: [0,1],
								translateY: [100, 0],
								duration: 500,
								easing: 'easeOutQuad',
								complete: function() {
									$(el).removeClass('has-reveal-effect').css({opacity: '', transform: '', '-webkit-transform': ''});
								},
							});
							break;
					}
				},
				bounds: 0
			});
		}

		// Testimonial carousel
		if ( $('.testimonial-carousel-contain').length ) {
			var testiSwiper = new Swiper ('.testimonial-carousel-contain', {
				slidesPerView: 1,
				spaceBetween: 0,
				grabCursor: false,
				navigation: {
					nextEl: '.testimonial-carousel-btn-next',
					prevEl: '.testimonial-carousel-btn-prev',
				},
				speed: 800,
				effect: 'fade',
				fadeEffect: {
					crossFade: true,
				},
				autoplay: {
					delay: 7000,
					disableOnInteraction: false,
				},
				on: {
					init: function() {
						if ( ! $('.testimonial-carousel-contain').hasClass('initted') ) {
							var $slideTotal = $('.testimonial-carousel-contain').find('.pj-testimonial').length,
								$markup = $('<div class="total-slide"><span class="slide-current">01</span>/<span class="slide-total">0'+$slideTotal+'</span></div>');

							$('.testimonial-carousel-contain').addClass('initted')
							$markup.insertAfter( $('.testimonial-carousel-btn-prev') );
							$slideTotal = $markup = null;
						}
					},
					slideChange: function() {
						var crt = "0"+(testiSwiper.activeIndex+1);
						$('.testimonial-carousel-contain').find('.slide-current').html(crt);
						crt = null;
					},
				}
			});

			$(window).on('poojyPortfolioClosed', function() {
				testiSwiper.update();
			});
		}

		// Circular progress
		var circProg = $('.pj-circle-progress');
		if ( circProg.length && typeof window.appear !== 'undefined' ) {
			
			self.circleProgress();

			var circularAppear = new window.appear({
				elements: function elements() {
					return document.getElementsByClassName('svg-circle');
				},
				appear: function appear(el,i) {
					if ( $(el).hasClass('done-animate') ) {
						return;
					}

					$(el).addClass( 'done-animate' );
					var cAnim, cDash = $(el).find('.circ-to-progress').attr('stroke-dashoffset'),
						cDarray = $(el).find('.circ-to-progress').attr('stroke-dasharray'),
						cProg = $(el).find('text').html(),
						cProgdata = { progress: 0 };
					
					cAnim = anime.timeline({
						autoplay: true,
					});
					$(el).find('.circ-to-progress').attr('stroke-dashoffset', cDarray).attr('opacity', 1);
					$(el).find('text').html('');
					cAnim.add({
						targets: $(el).find('.circ-to-progress')[0],
						strokeDashoffset: [cDarray, cDash],
						duration: 1200,
						delay: 100,
						easing: 'easeInOutCirc'
					}).add({
						targets: cProgdata,
						progress: cProg,
						duration: 1200,
						delay: 100,
						easing: 'easeInOutSine',
						update: function() {
							$(el).find('text').html( Math.round(cProgdata.progress)+'%');
						}
					}, '-=1200');
				},
				bounds: 0
			});
		}

		// Portfolio gallery carousel
		if ( $('.pj-carousel-gallery-container').length ) {
			$('.pj-carousel-gallery-container').find('.pj-carousel-item').each(function() {
				var _src = $(this).find('img').attr('src'),
					bg = $(this).find('.pj-carousel-bg');
				bg[0].style.backgroundImage = 'url("'+_src+'")';
			});
			var interleaveOffset = 0.5,
				pcSlideTotal = $('.pj-carousel-gallery-container').find('.pj-carousel-item').length;
			var pCarouselSwiper = new Swiper ('.pj-carousel-gallery-container', {
				loop: true,
				slidesPerView: 1,
				spaceBetween: 0,
				grabCursor: true,
				watchSlidesProgress: true,
				navigation: {
					nextEl: '.pj-gallery-carousel-btn-next',
					prevEl: '.pj-gallery-carousel-btn-prev',
				},
				speed: 700,
				autoplay: {
					delay: 5000,
					disableOnInteraction: false,
				},
				// modify the effect of Swiper transition
				// source : https://codepen.io/udovichenko/pen/LGeQae
				on: {
					init: function() {
						if ( ! $('.pj-carousel-gallery-container').hasClass('initted') ) {
							var $markup = $('<div class="total-slide"><span class="slide-current">01</span>/<span class="slide-total">0'+pcSlideTotal+'</span></div>');

							$('.pj-carousel-gallery-container').addClass('initted');
							$markup.insertAfter( $('.pj-gallery-carousel-btn-prev') );
							$markup = null;
						}
					},
					slideChange: function() {
						var swiper = this,
							crt = "0"+(swiper.realIndex+1);
						$('.pj-carousel-gallery-container').find('.slide-current').html(crt);
						crt = null;
					},
					progress: function() {
						var swiper = this;
						for (var i = 0; i < swiper.slides.length; i++) {
							var slideProgress = swiper.slides[i].progress;
							var innerOffset = swiper.width * interleaveOffset;
							var innerTranslate = slideProgress * innerOffset;
							swiper.slides[i].querySelector(".pj-carousel-bg").style.webkitTransform = "translate3d(" + innerTranslate + "px, 0, 0)";
							swiper.slides[i].querySelector(".pj-carousel-bg").style.transform = "translate3d(" + innerTranslate + "px, 0, 0)";
						}      
					},
					touchStart: function() {
						var swiper = this;
						for (var i = 0; i < swiper.slides.length; i++) {
							swiper.slides[i].style.transition = "";
						}
					},
					setTransition: function(speed) {
						var swiper = this;
						for (var i = 0; i < swiper.slides.length; i++) {
							swiper.slides[i].style.webkitTransition = speed + "ms";
							swiper.slides[i].style.transition = speed + "ms";
							swiper.slides[i].querySelector(".pj-carousel-bg").style.webkitTransition = speed + "ms";
							swiper.slides[i].querySelector(".pj-carousel-bg").style.transition = speed + "ms";
						}
					}
				}
			});
		}

		// Lightbox
		self.magnificPopupInit();

		// Masonry gallery
		self.masonryInit();

		// Contact form init
		self.contactFormInit();
	};

	// Contact form init
	self.contactFormInit = function() {
		var form=$('.contact-form');

		if ( form.length ) {
			form.each( function() {
				var f=this;

				$(f).find('input:not([type="submit"])').each(function() {
					var ip=this;

					( $(ip).val() !== "" ) && $(ip).addClass('has_value');

					$(ip).on('blur', function() {
						( $(ip).val() !== "" ) ? $(ip).addClass('has_value') : $(ip).removeClass('has_value');
					});
				});

				$(f).find('textarea').each(function () {
					var origH = $(this).innerHeight()/4;
					this.style.height = 'auto';
					this.setAttribute('style', 'height:' + (this.scrollHeight+origH-(17*2)) + 'px;overflow-y:hidden;');
					$(this).on('input', function () {
						this.style.height = 'auto';
						this.style.height = (this.scrollHeight+origH-(17*2)) + 'px';
					});
				});
			});

			// Ajax contact form
			self.processContactForm();
		}
	};

	self.mapSetup = function() {
		// map setup
		if ( $('#pj-map').length ) {
			var map = L.map('pj-map',{
				center: [poojyOptions.map.lat, poojyOptions.map.lon],
				zoom: 16,
				scrollWheelZoom: false,
				fadeAnimation: false
			});

			L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			var markerIcon = L.icon({
				iconUrl: poojyOptions.map.marker,
				iconSize: [38, 41],
				iconAnchor: [22, 40],
				popupAnchor: [-3, -36]
			});

			L.marker([poojyOptions.map.lat, poojyOptions.map.lon], {icon: markerIcon}).addTo(map);

			if ( $('#pj-map').find('img.leaflet-marker-icon').length ) {
				var origImg = $('#pj-map').find('img.leaflet-marker-icon'),
					classes = origImg.attr('class'),
					styles = origImg.attr('style');

				$.get(poojyOptions.map.marker, function(data) {
					// Get the SVG tag, ignore the rest
					var $svg = $(data).find('svg'),
						c = document.createDocumentFragment(),
						dv = document.createElement('div');

					c.appendChild(dv);
					dv.className = classes;
					dv.setAttribute('style', styles );

					// Remove any invalid XML tags as per http://validator.w3.org
					$svg = $svg.removeAttr('xmlns:a');

					// Check if the viewport is set, if the viewport is not set the SVG wont't scale.
					if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
						$svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
					}

					dv.appendChild( $svg[0] );
					
					$(origImg).replaceWith( $(c) );

				}, 'xml');
			}
		}
	};

	// Process contact form
	self.processContactForm = function() {
		var $form=$('#poojy-contact-form'), onSend = false;

		$form.on('submit', function(e) {
			e.preventDefault();

			if ( onSend ) {
				return false;
			}

			if ( $form.find('textarea[name="message"]').val() === "" ) {
				$form.find('textarea[name="message"]').trigger('focus').addClass('border-danger');
				return false;
			}

			$form.find('.border-danger').removeClass('border-danger');
			$form.find('button').addClass('on-submit');
			onSend = true;

			var from_data = $form.serialize();

			$.ajax({
				url  : $form.attr('action'),
				type : 'post',
				data : from_data,
				dataType : 'json',
				success: function( cb ) {
					$form.find('.cf-message').html('<div class="alert alert-success">'+ cb.messages +'</div>');
					$(window).scrollTop( $form.offset().top-100 );
					$form.trigger('reset');
					$form.find('input').trigger('blur');
					$form.find('textarea').removeAttr('style').trigger('input');
					$form.find('button').removeClass('on-submit');
					window.setTimeout(function() {
						$form.find('.cf-message').find('.alert').animate({
							opacity : 0
						}, 300, function() {
							$form.find('.cf-message').html('');
							onSend = false;
						});
					}, 3000);
				},
				error: function( cb ) {
					var err = JSON.parse( cb.responseText );

					$form.find('.cf-message').html('<div class="alert alert-danger">'+ err.messages +'</div>');
					$(window).scrollTop( $form.offset().top-100 );
					$form.find('button').removeClass('on-submit');
					window.setTimeout(function() {
						$form.find('.cf-message').find('.alert').animate({
							opacity : 0
						}, 300, function() {
							$form.find('.cf-message').html('');
							onSend = false
						});
					}, 3000);
				}
			});

		});
	},

	// Animated numbers
	self.animatedNumber = function(el) {
		var fnlObj, fnl=$(el).data('final-number'), drt=(typeof $(el).data('duration') === 'undefined') ? 1500 : $(el).data('duration');

		if ( typeof fnl === 'undefined' ) {
			return false;
		}
		fnlObj = {progress: 0};
		anime({
			targets: fnlObj,
			progress: [0, fnl],
			duration: Math.round(drt),
			easing: 'easeInSine',
			update: function() {
				$(el).html( Math.round(fnlObj.progress).toLocaleString() );
			}
		});
	};

	// Progress bars
	self.progressBar = function(el) {
		var fnlObj,
			bar = $(el).find('.progress-bar'),
			progValue = ( typeof $(bar).data('progress') === 'undefined' ? 100 : parseInt($(bar).data('progress')) ),
			c = document.createDocumentFragment(),
			sp = document.createElement('span');

		c.appendChild(sp);
		sp.className = 'progress-value';
		el.appendChild(c);

		fnlObj = {progress: 0};
		anime({
			targets: fnlObj,
			progress: [0, progValue],
			duration: progValue*5,
			easing: 'easeInSine',
			update: function() {
				bar.css({width: Math.round(fnlObj.progress)+'%'});
				sp.innerHTML = Math.round(fnlObj.progress)+'%';
			}
		});
	};

	// Lightbox
	self.magnificPopupInit = function() {
		if ( $('.pj-gallery').length ) {
			$('.pj-gallery').each(function(z) {
				var f=this, gal=false;
				if ( $(f).find('a').length ) {
					$(f).find('a').each( function(i, el) {
						var href_value = el.href;
						if (/\.(jpg|jpeg|png|gif)$/.test(href_value)) {
							gal=true;
						}
					});

					if ( gal ) {
						$(f).magnificPopup({
							delegate: 'a',
							type: 'image',
							removalDelay: 300,
							mainClass: 'mfp-fade',
							gallery:{
								enabled:true
							}
						});
					}
				}
			});
		}
	};

	// Circular progress
	self.circleProgress = function() {
		$('.pj-circle-progress').each(function() {
			if ( $(this).hasClass('circReady') ) {
				return;
			}

			var _x=this, r= 0,
				c = document.createDocumentFragment(),
				data = $(_x).data('progress');

			var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
				circ = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
				circBG = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
				progText = document.createElementNS("http://www.w3.org/2000/svg", "text");
			svg.setAttribute( 'viewBox', '0 0 250 250');
			svg.setAttribute( 'width', '250');
			svg.setAttribute( 'height', '250');
			c.appendChild(svg);
			svg.appendChild(circBG);
			svg.appendChild(circ);
			svg.appendChild(progText);

			circ.setAttribute( 'class', 'circ-to-progress' );
			circ.setAttribute( 'fill', 'none' );
			circ.setAttribute( 'stroke', data['color'] );
			circ.setAttribute( 'cx', '125' );
			circ.setAttribute( 'cy', '125' );

			circBG.setAttribute( 'fill', 'none' );
			circBG.setAttribute( 'stroke', data['background'] );
			circBG.setAttribute( 'cx', '125' );
			circBG.setAttribute( 'cy', '125' );

			progText.setAttribute('x', '50%');
			progText.setAttribute('y', '50%');
			progText.setAttribute('dominant-baseline', 'middle');
			progText.setAttribute('text-anchor', 'middle');

			progText.innerHTML = data.percent;

			r = (250/2)-(30/2);
			circ.setAttribute( 'r', r );
			circ.setAttribute( 'stroke-width', '30');
			circ.setAttribute( 'opacity', '0');

			circBG.setAttribute( 'r', r );
			circBG.setAttribute( 'stroke-width', '30');

			switch( data.size ) {
				case 'small':
					svg.setAttribute( 'class', 'svg-circle small' );
					break;
				case 'big':
					svg.setAttribute( 'class', 'svg-circle big' );
					break;
				case 'medium':
				default:
					svg.setAttribute( 'class', 'svg-circle medium' );
					break;
			}
			circ.setAttribute('stroke-dashoffset',(2*Math.PI*r)*(1-(parseInt(data.percent)/100)));
			circ.setAttribute('stroke-dasharray', 2*Math.PI*r );
			circ.setAttribute('transform', 'rotate(-90, 125, 125)');
			
			_x.appendChild(c);
			$(_x).addClass('circReady');
		});
	};

	// Masonry gallery
	self.masonryInit = function() {
		var masonGallery, metroGallery;

		if ( $('.pj-masonry-gallery').length ) {
			var grids = $('.masonry-grid')
			masonGallery = grids.masonry({
				itemSelector: '.masonry-grid-item',
				columnWidth: '.masonry__sizer',
				percentPosition: true,
				transitionDuration: '0.3s',
				gutter: 0,
			});

			masonGallery.masonry().masonry('layout');
		}

		if ( $('.pj-metro-gallery').length ) {
			var mGrids = $('.metro-grid')
			metroGallery = mGrids.masonry({
				itemSelector: '.metro-grid-item',
				columnWidth: '.metro__sizer',
				percentPosition: true,
				transitionDuration: '0.3s',
				gutter: 0,
			});

			metroGallery.masonry().masonry('layout');
		}
	};

	self.singleProjectInit = function() {
		if ( $('.single-portfolio').length < 1 ) {
			return false;
		}

		if ( $('.portfolio-header-bg').length ) {
			$('.portfolio-header-bg').find('img').css({opacity: 0}).addClass('jarallax-img');		
		}

		anime({
			targets: '.single-portfolio',
			translateY: [100, 0],
			opacity: [0,1],
			duration: 350,
			easing: 'linear',
			complete: function() {
				$('.portfolio-header-bg').jarallax({
					speed: 0.2,
					disableParallax: function() {
						return /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
					},
					onInit: function() {
						anime({
							targets: '.portfolio-header-bg img',
							opacity: 1,
							duration: 500,
							easing: 'linear'
						});
					}
				});

				if ( /iPad|iPhone|iPod|Android/.test(navigator.userAgent) ) {
					$('.portfolio-header-bg').addClass('jarallax');
					anime({
						targets: '.portfolio-header-bg img',
						opacity: 1,
						duration: 500,
						easing: 'linear'
					});
				}
			}
		});
	};

	// If preloader removed, run the init from here
	if ( $('#poojy-site-preloader').length < 1 ) {
		PIXI.loader.load(function(loader, resources){
			if ( $('#intro').length ) {
				$('body').addClass('intro-start');
				self.setupAudio();
				self.intro();
			} else {
				self.setupAudio();
				self.onePageInit();
				$('#project-gallery').poojyHeroSlider();
			}
			self.init();
		});
	} else {
		// Window loaded
		$(window).on('load', function() {
			PIXI.loader.load(function(loader, resources){
				if ( $('#intro').length ) {
					$('body').addClass('intro-start');
					self.setupAudio();
					self.intro();
				} else {
					self.setupAudio();
					self.onePageInit();
					$('#project-gallery').poojyHeroSlider();
				}
				self.init();
			});
		});		
	}

	// Window on scroll
	$(window).on('scroll', function() {
		var scrollY = window.pageYOffset || html.scrollTop || body.scrollTop || 0;
		var $header = $('#main-header');

		if ( scrollY > 50 ) {
			$header.addClass('scrolled');
		} else {
			$header.removeClass('scrolled');
		}
	});

	$(window).on('resize', function() {
		if ( windowRezize ) {
			clearTimeout( windowRezize );
		}

		windowRezize = setTimeout(function() {
			self.sizes.w = $(window).width();
			self.sizes.h = $(window).height();

			if ( $('#intro').length > 0 ) {
				self.renderer.resize(self.sizes.w, self.sizes.h);
			}

			if( $('.mobile-menu-trigger').is(':hidden') && !self.portfolioOnShow ) {
				$('.main-nav-wrap').removeAttr('style');
			}
			$('#main, .inner-pages-wrap').scrollLeft(0);
			$(window).trigger('finishResize');
		},10);
	});
})(window.jQuery);
