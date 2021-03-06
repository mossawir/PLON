/**
 * =================================================================================
 *
 * PLON Component : Tabs
 *
 * @author     Bartosz Perończyk (peronczyk.com)
 * @modified   2019-03-19
 * @repository https://github.com/peronczyk/plon
 *
 * =================================================================================
 */

window.plon = window.plon || {};

window.plon.Tabs = function(elem, options) {

	'use strict';

	// Default configuration
	var defaults = {

		/**
		 * Decide if you want to see all informations in console
		 * @var {Boolean}
		 */
		debug: false,

		/**
		 * CSS selector for tab elements.
		 */
		tabSelector: '[role="tab"]',

		/**
		 * CSS selector for tabs panel.
		 */
		panelSelector: '[role="tabpanel"]',

		/**
		 * Decide if hovering the tab will mark it as active.
		 * @var {Boolean}
		 */
		hoverCangesTab: false,

		/**
		 * Plugin events namespace.
		 */
		eventsNameSpace: '.plon.tabs',

		/**
		 * Data attribute that binds tabs list with panels.
		 */
		dataBinder: 'data-tabs-panels',

		/**
		 * Specify which tab will be automatically selected when the page loads.
		 * 0 means first tab.
		 * @var {Integer|null}
		 */
		autoActivateTab: 0,

		/**
		 * Decide if tab element will be focused after tabs navigation action (next
		 * / previous). Setting this option to false prevents from viewport position
		 * change when tab is automatically changed within some external script.
		 * @var {Boolean}
		 */
		focusOnTabNavAction: false,

		/**
		 * Define the size of the viewport in which tab change will automatically
		 * scroll the page to the tab content. This is usefull in mobile versions
		 * of tabs.
		 * @var {Number|Boolean}
		 */
		autoScrollOnScreenNarrowerThan: false,

		/**
		 * Run provided callback when tab changes.
		 * @var {Function}
		 */
		tabChangeCallback: null,

		/**
		 * CSS class names (without dot at the beginning).
		 */
		classNames: {
			active: 'is-Active'
		},
	};

	// Shortcuts
	var $document = $(document);

	// Variables available for constructor
	this.config;
	this.activeTabIndex = null;
	this.panelsId;
	this.monitoredEvents;
	this.$tabsContainer;
	this.$tabsList;
	this.$panelsContainer;
	this.$panelsList;


	/** ----------------------------------------------------------------------------
	 * METHOD: Change Tab
	 * @param {Number} newTabIndex
	 */
	this.changeTab = (newTabIndex) => {
		if (newTabIndex > this.$panelsList.length - 1 || newTabIndex < 0) {
			if (this.config.debug) {
				console.warn('[PLON / Tabs] Tabs panel with index "' + newTabIndex + '" does not exist.');
			}
			return false;
		}

		let $activeTab   = this.$tabsList.eq(newTabIndex);
		let $activePanel = this.$panelsList.eq(newTabIndex);

		this.$tabsList
			.removeClass(this.config.classNames.active)
			.attr('tabindex', -1);

		$activeTab
			.addClass(this.config.classNames.active)
			.attr('tabindex', 0);

		if (this.config.focusOnTabNavAction) {
			$activeTab.trigger('focus', { selfInitiated: true });
		}

		this.$panelsList
			.removeClass(this.config.classNames.active)
			.attr('aria-hidden', true);

		$activePanel
			.addClass(this.config.classNames.active)
			.attr('aria-hidden', false);

		// Trigger catchable event
		this.$tabsContainer.add(this.$panelsContainer).trigger({
			type        : 'change' + this.config.eventsNameSpace,
			oldTabIndex : this.activeTabIndex,
			newTabIndex : newTabIndex,
			tab         : $activeTab,
			panel       : $activePanel
		});

		this.activeTabIndex = newTabIndex;

		// Auto scroll to active panel on defined resolutions
		if (this.config.autoScrollOnScreenNarrowerThan && $(window).width() < this.config.autoScrollOnScreenNarrowerThan) {
			this.scrollToPanels();
		}

		if (typeof this.config.tabChangeCallback === 'function') {
			this.config.tabChangeCallback(this);
		}

		if (this.config.debug) {
			console.info('[PLON / Tabs] Switched to tab with index: ' + newTabIndex);
		}
	};


	/** ----------------------------------------------------------------------------
	 * METHOD: Naxt Tab
	 */

	this.nextTab = () => {
		let newTabIndex = 0;

		if (this.activeTabIndex !== null) {
			newTabIndex = (this.activeTabIndex === this.$tabsList.length - 1)
				? 0
				: this.activeTabIndex + 1;
		}

		if (this.config.debug) {
			console.log('[PLON / Tabs] Switching to next tab (index: ' + newTabIndex + ')');
		}

		this.changeTab(newTabIndex);
	};


	/** ----------------------------------------------------------------------------
	 * METHOD: Previous Tab
	 */

	this.previousTab = () => {
		let newTabIndex = (this.activeTabIndex <= 0)
			? this.$tabsList.length - 1
			: this.activeTabIndex - 1;

		this.changeTab(newTabIndex);

		if (this.config.debug) {
			console.info('[PLON / Tabs] Switching to previous tab (index: ' + newTabIndex + ')');
		}
	};


	/** ----------------------------------------------------------------------------
	 * METHOD: Bind Keyboard Nav
	 */

	this.bindKeyboardNav = () => {
		$document.on('keydown' + this.config.eventsNameSpace, (event) => {
			switch (event.which) {
				case 32: // Space
					event.preventDefault();
					this.changeTab($(event.currentTarget).index());
					break;

				case 37: // Arrow left
				case 38: // Arrow up
					event.preventDefault();
					this.previousTab();
					break;

				case 39: // Arrow right
				case 40: // Arrow down
					event.preventDefault();
					this.nextTab();
					break;
			}
		});
	};


	/** ----------------------------------------------------------------------------
	 * METHOD: Unbind Keyboard Nav
	 */

	this.unbindKeyboardNav = () => {
		$document.off(this.config.eventsNameSpace);
	};


	/** ----------------------------------------------------------------------------
	 * METHOD: Scroll viewport to tab panels wrapper. If wrapper is smaller than
	 * viewport height bottom of the wrapper is taken as the base. Thanks to this
	 * behavior both tabs and panels are visible after scrolling.
	 */

	this.scrollToPanels = () => {
		let panelsTopOffset = this.$panelsContainer.offset().top;
		let panelsHeight = this.$panelsContainer.height();
		let windowHeight = $(window).height();

		let scrollDestPoint = (panelsHeight < windowHeight)
			? panelsTopOffset + panelsHeight - windowHeight + 100
			: panelsTopOffset - 150;

		$('html,body')
			.stop()
			.animate(
				{ scrollTop: scrollDestPoint },
				600
			);
	};


	/** ----------------------------------------------------------------------------
	 * Initiate script - check passed options, etc.
	 */

	this.init = () => {
		this.config = { ...defaults, ...options };

		this.$tabsContainer = $(elem);

		this.monitoredEvents =
			' click' + this.config.eventsNameSpace +
			' focusin' + this.config.eventsNameSpace +
			' focusout' + this.config.eventsNameSpace;

		if (this.config.hoverCangesTab) {
			this.monitoredEvents += ' mouseenter' + this.config.eventsNameSpace;
		}

		if (!this.$tabsContainer.length) {
			if (this.config.debug) {
				console.warn('[PLON / Tabs] TabList container not found: ' + elem);
			}
			return false;
		}

		this.$tabsList = this.$tabsContainer.find(this.config.tabSelector);
		if (!this.$tabsList.length) {
			if (this.config.debug) {
				console.warn('[PLON / Tabs] No tabs found');
			}
			return false;
		}

		this.panelsId = this.$tabsContainer.attr(this.config.dataBinder);
		if (typeof this.panelsId === 'undefined' || this.panelsId === false) {
			let $elemWithBindingId = this.$tabsContainer.closest('[' + this.config.dataBinder + ']');

			if ($elemWithBindingId.length) {
				this.panelsId = $elemWithBindingId.attr(this.config.dataBinder);
			}
			else {
				if (this.config.debug) {
					console.warn('[PLON / Tabs] Selected tabs list container or any parent element doesn\'t have data selector (' + this.config.dataBinder + ') or it\'s empty: "' + this.panelsId + '".');
				}
				return false;
			}
		}

		this.$panelsContainer = $('#' + this.panelsId);
		if (!this.$panelsContainer) {
			if (this.config.debug) {
				console.warn('[PLON / Tabs] Specified panels container doesn\'t exist: ' + this.panelsId);
			}
			return false;
		}

		this.$panelsList = this.$panelsContainer.children(this.config.panelSelector);
		this.activeTabIndex = this.$tabsContainer.find('.' + this.config.classNames.active).index();


		/**
		 * Events monitoring
		 */

		this.$tabsList.on(this.monitoredEvents, (event, params) => {
			if (event.type === 'click' || (this.config.hoverCangesTab && event.type === 'mouseenter')) {
				this.changeTab($(event.currentTarget).index());
			}

			// Turn ON or OFF keyboard monitoring
			// if event wasn't triggered by this component
			if (!params || !params.selfInitiated) {
				switch (event.type) {
					case 'focusin':
						this.bindKeyboardNav();
						break;

					case 'focusout':
						this.unbindKeyboardNav();
						break;
				}
			}
		});


		/**
		 * Auto activating configured tab if none of tabs are active.
		 */

		if (this.config.autoActivateTab !== false && this.activeTabIndex === -1) {
			this.changeTab(this.config.autoActivateTab);
		}
	};

	return this.init();
};