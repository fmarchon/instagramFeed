

(function () {
    window._setGalleryComponentConfiguration = [];
	window.onload = function () {
	    window._setGalleryComponentConfiguration.forEach(
	                    function(listener) {
                            var _config = listener();
                            start(_config);
                        });
	};

	function start(config) {
	    if(config.renderGallery) {
	        // set gallery defaults
            		config.galleries = config.galleries.map(function(galleryConfig) {
            			galleryConfig.images = galleryConfig.images.map(function(imageConfig){
            				if (!imageConfig.height && galleryConfig.defaultHeight) {
            					imageConfig.height = galleryConfig.defaultHeight;
            				}
            				if (!imageConfig.width && galleryConfig.defaultWidth) {
            					imageConfig.width = galleryConfig.defaultWidth;
            				}
            				return imageConfig;
            			});
            			return galleryConfig;
            		});
            		config.galleries.forEach(function(galleryConfig) {
            			renderImageGallery(galleryConfig);
            		});
	    }
		initPhotoSwipeFromDOM(config.photoswipeSelector);
	}

	// dynamic rendering of image galleries
	function renderImageGallery(galleryConfig) {
		var fragment = document.createDocumentFragment();
		galleryConfig.images.forEach(function (image) {
			var figureElement = document.createElement('figure'),
				imageElement = document.createElement('div');
			imageElement.classList.add('image');
			imageElement.setAttribute('src', image.url);
			imageElement.style.backgroundImage = "url('"+image.url+"')";
			imageElement.style.backgroundSize = 'cover';
			imageElement.style.backgroundPosition = 'center';
			imageElement.setAttribute('height', image.height);
			imageElement.setAttribute('width', image.width);
			figureElement.classList.add('feed');
			figureElement.appendChild(imageElement);
			fragment.appendChild(figureElement);
		});
		document.querySelector(galleryConfig.domEntrypoint).appendChild(fragment);
	}

	// initialize photoswipe
	function initPhotoSwipeFromDOM(photoswipeSelector) {
		var photoswipeElement = document.createElement('div');
		photoswipeElement.innerHTML = '<div class=pswp aria-hidden=true role=dialog tabindex=-1><div class=pswp__bg></div><div class=pswp__scroll-wrap><div class=pswp__container><div class=pswp__item></div><div class=pswp__item></div><div class=pswp__item></div></div><div class="pswp__ui pswp__ui--hidden"><div class=pswp__top-bar><div class=pswp__counter></div><button class="pswp__button pswp__button--close"title="Close (Esc)"></button> <button class="pswp__button pswp__button--share"title=Share></button> <button class="pswp__button pswp__button--fs"title="Toggle fullscreen"></button> <button class="pswp__button pswp__button--zoom"title="Zoom in/out"></button><div class=pswp__preloader><div class=pswp__preloader__icn><div class=pswp__preloader__cut><div class=pswp__preloader__donut></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class=pswp__share-tooltip></div></div><button class="pswp__button pswp__button--arrow--left"title="Previous (arrow left)"></button> <button class="pswp__button pswp__button--arrow--right"title="Next (arrow right)"></button><div class=pswp__caption><div class=pswp__caption__center></div></div></div></div></div>';
		photoswipeElement = photoswipeElement.childNodes[0];
		document.querySelector('body').appendChild(photoswipeElement);

		var gallerySelector = photoswipeSelector;
		// parse slide data (url, title, size ...) from DOM elements
		// (children of gallerySelector)
		var parseThumbnailElements = function (el) {
			var thumbElements = el.childNodes,
				numNodes = thumbElements.length,
				items = [],
				figureEl,
				item;

			for (var i = 0; i < numNodes; i++) {
				figureEl = thumbElements[i]; // <figure> element

				// include only element nodes
				if (figureEl.nodeType !== 1) {
					continue;
				}
				imageEl = figureEl.children[0]; // image element
				item = {
					src: imageEl.getAttribute('src'),
					msrc: imageEl.getAttribute('src'),
					w: parseInt(imageEl.getAttribute('width'), 10),
					h: parseInt(imageEl.getAttribute('height'), 10)
				};

				item.el = figureEl; // save link to element for getThumbBoundsFn
				items.push(item);
			}

			return items;
		};

		// find nearest parent element
		var closest = function closest(el, fn) {
			return el && ( fn(el) ? el : closest(el.parentNode, fn) );
		};

		// triggers when user clicks on thumbnail
		var onThumbnailsClick = function (e) {
			e = e || window.event;
			e.preventDefault ? e.preventDefault() : e.returnValue = false;

			var eTarget = e.target || e.srcElement;

			// find root element of slide
			var clickedListItem = closest(eTarget, function (el) {
				return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
			});

			if (!clickedListItem) {
				return;
			}

			// find index of clicked item by looping through all child nodes
			// alternatively, you may define index via data- attribute
			var clickedGallery = clickedListItem.parentNode,
				childNodes = clickedListItem.parentNode.childNodes,
				numChildNodes = childNodes.length,
				nodeIndex = 0,
				index;

			for (var i = 0; i < numChildNodes; i++) {
				if (childNodes[i].nodeType !== 1) {
					continue;
				}

				if (childNodes[i] === clickedListItem) {
					index = nodeIndex;
					break;
				}
				nodeIndex++;
			}


			if (index >= 0) {
				// open PhotoSwipe if valid index found
				openPhotoSwipe(index, clickedGallery);
			}
			return false;
		};

		// parse picture index and gallery index from URL (#&pid=1&gid=2)
		var photoswipeParseHash = function () {
			var hash = window.location.hash.substring(1),
				params = {};

			if (hash.length < 5) {
				return params;
			}

			var vars = hash.split('&');
			for (var i = 0; i < vars.length; i++) {
				if (!vars[i]) {
					continue;
				}
				var pair = vars[i].split('=');
				if (pair.length < 2) {
					continue;
				}
				params[pair[0]] = pair[1];
			}

			if (params.gid) {
				params.gid = parseInt(params.gid, 10);
			}

			return params;
		};

		var openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
			var pswpElement = document.querySelectorAll('.pswp')[0],
				gallery,
				options,
				items;

			items = parseThumbnailElements(galleryElement);

			// define options (if needed)
			options = {

				// define gallery index (for URL)
				galleryUID: galleryElement.getAttribute('data-pswp-uid'),

				getThumbBoundsFn: function (index) {
					// See Options -> getThumbBoundsFn section of documentation for more info
					var thumbnail = items[index].el.getElementsByClassName('image')[0], // find thumbnail
						pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
						rect = thumbnail.getBoundingClientRect();

					return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
				}

			};

			// PhotoSwipe opened from URL
			if (fromURL) {
				if (options.galleryPIDs) {
					// parse real index when custom PIDs are used
					// http://photoswipe.com/documentation/faq.html#custom-pid-in-url
					for (var j = 0; j < items.length; j++) {
						if (items[j].pid == index) {
							options.index = j;
							break;
						}
					}
				} else {
					// in URL indexes start from 1
					options.index = parseInt(index, 10) - 1;
				}
			} else {
				options.index = parseInt(index, 10);
			}

			// exit if index not found
			if (isNaN(options.index)) {
				return;
			}

			if (disableAnimation) {
				options.showAnimationDuration = 0;
			}

			// Pass data to PhotoSwipe and initialize it
			gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.init();
		};

		// loop through all gallery elements and bind events
		var galleryElements = document.querySelectorAll(gallerySelector);

		for (var i = 0, l = galleryElements.length; i < l; i++) {
			galleryElements[i].setAttribute('data-pswp-uid', i + 1);
			galleryElements[i].onclick = onThumbnailsClick;
		}

		// Parse URL and open gallery if it contains #&pid=3&gid=1
		var hashData = photoswipeParseHash();
		if (hashData.pid && hashData.gid) {
			openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
		}
	}
})();