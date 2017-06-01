'use strict';

(() => {
	class Core {
		constructor() {
			this.observer = new MutationObserver((records) => {
				if (records.length != 0) {
					this.process();
				}
			});

			//	設定
			this.enable5000 = false;
			this.enableMoriogai = false;
		}

		defaultSettings() {
			return {
				enable5000: true,
				enableMoriogai: true
			}
		}

		loadSettings(defaults, callback = null) {
			chrome.storage.local.get(defaults, (items) => {
				if (items.enable5000 && items.enableMoriogai) {
					this.enable5000 = items.enable5000;
					this.enableMoriogai = items.enableMoriogai;
				}
				if (callback) {
					callback();
				}
			});

			chrome.storage.onChanged.addListener((changes, namespace) => {
				if (namespace === 'local') {
					if (changes.enable5000) {
						this.enable5000 = changes.enable5000.newValue;
					}
					if (changes.enableMoriogai) {
						this.enableMoriogai = changes.enableMoriogai.newValue;
					}
				}
			});
		}

		ready() {
			let defaults = this.defaultSettings();
			this.loadSettings(defaults, () => {
				this.process();
			});
		}
		
		getImageTag(srcPath, style, alt = '5000兆円') {
			return $('<img>', {src: srcPath, alt: alt}).css(style).prop('outerHTML');
		}
		
		getStyle(height) {
			return {
				'height': height,
				'vertical-align': 'top',
			};
		}
		
		get5000(height, alt) {
			let style = this.getStyle(height);
			let path = chrome.extension.getURL('images/5000-trillion-yen.png');
			return this.getImageTag(path, style, alt);
		}

		getMoriogai(height, alt) {
			let style = this.getStyle(height);
			let path = chrome.extension.getURL('images/5000-trillion-yen.png');
			return this.getImageTag(path, style, alt);
		}
				
		observe() {
			let options = {
				characterData: true,
				childList: true,
				subtree: true
			};
			this.observer.observe($('body').get(0), options);
		}
		
		disconnect() {
			this.observer.disconnect();
		}
		
		process() {
			if (!this.enable5000 && !this.enableMoriogai) {
				//	disabled
				return;
			}
			//	Disconnect Observer
			this.disconnect();
			
			/**
			 *	Replace Process
			 */
			let self = this;
			console.log('process');
			$('p,a,span').filter(function() {
				let text = $(this).text();
				return text.match(/((5000|５０００)兆円|森鴎外)/g);
			}).html(function() {
				let html = $(this).html();
				//	利用できそうなCSSの値を拾ってくる
				let heightkey = ['line-height', 'font-size'].find((element) => {
					const value = $(this).css(element);
					return !Number.isNaN(parseInt(value));
				});
				let height = '22px'; //	Default
				if (heightkey !== undefined) {
					height = $(this).css(heightkey);
				}

				if (this.enable5000) {
					html = html.replace(/(5000|５０００)兆円/g, (text) => {
						return self.get5000(height, text);
					});
				}

				if (this.enableMoriogai) {
					html = html.replace(/森鴎外/g, (text) => {
						return self.getMoriogai(height, text);
					});
				}

				return html;
			});
			
			//	Reconnect
			this.observe();
		}
	}
	

	const core = new Core;
	core.ready();
})();