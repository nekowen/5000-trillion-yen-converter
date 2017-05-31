'use strict';

(() => {
	class Core {
		constructor() {
			this.observer = new MutationObserver((records) => {
				if (records.length != 0) {
					this.process();
				}
			});
		}
		
		getImageTag(srcPath, style) {
			return $('<img>', {src: srcPath}).css(style).prop('outerHTML');
		}
		
		getStyle(height) {
			return {
				'height': height,
				'vertical-align': 'top',
			};
		}
		
		get5000(height) {
			let style = this.getStyle(height);
			let path = chrome.extension.getURL('images/5000-trillion-yen.png');
			return this.getImageTag(path, style);
		}
		
		start() {
			this.process();
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
			//	Disconnect Observer
			this.disconnect();
			
			/**
			 *	Replace Process
			 */
			let self = this;
			$('p,a,span').filter(function() {
				let text = $(this).text();
				return text.match(/((5000|５０００)兆円)/g);
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

				html = html.replace(/(5000|５０００)兆円/g, self.get5000(height));
				return html;
			});
			
			//	Reconnect
			this.observe();
		}
	}
	

	const core = new Core;
	core.start();
})();