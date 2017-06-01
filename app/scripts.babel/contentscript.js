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
			this.enableHosii = false;

			this._regex5000 = new RegExp('((5000|５０００)兆円)(?!"|\')', 'g');
			this._regexHosii = new RegExp('(ほ|欲)しい(!|！)(?!"|\')', 'g');
			this._regexMoriogai = new RegExp('森鴎外(?!"|\')', 'g');
		}

		get regex5000() {
			return this._regex5000;
		}

		get regexHosii() {
			return this._regexHosii;
		}

		get regexMoriogai() {
			return this._regexMoriogai;
		}

		get defaultSettings() {
			return {
				enable5000: true,
				enableMoriogai: true,
				enableHosii: true
			}
		}

		loadSettings(defaults, callback = null) {
			chrome.storage.local.get(defaults, (items) => {
				this.enable5000 = items.enable5000;
				this.enableMoriogai = items.enableMoriogai;
				this.enableHosii = items.enableHosii;

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
					if (changes.enableHosii) {
						this.enableHosii = changes.enableHosii.newValue;
					}
				}
			});
		}

		ready() {
			let defaults = this.defaultSettings;
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
			let path = chrome.extension.getURL('images/morimori.png');
			return this.getImageTag(path, style, alt);
		}

		getHosii(height, alt) {
			let style = this.getStyle(height);
			let path = chrome.extension.getURL('images/hosii.png');
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

		isMatchText(text) {
			if (this.enable5000 && text.match(this.regex5000)) {
				return true;
			}
			if (this.enableMoriogai && text.match(this.regexMoriogai)) {
				return true;
			}
			if (this.enableHosii && text.match(this.regexHosii)) {
				return true;
			}
			return false;
		}
		
		process() {
			if (!this.enable5000 && !this.enableMoriogai && !this.enableHosii) {
				//	disabled
				return;
			}
			//	Disconnect Observer
			this.disconnect();
			
			/**
			 *	置き換え処理
			 */
			let self = this;
			$('p,a,span').filter(function() {
				let text = $(this).text();
				return self.isMatchText(text);
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

				/**
				 * 正規表現について
				 * 現状、ネストしているタグの中身を置き換えちゃったりする問題が発生しているので
				 * ダブルクォーテーション or シングルクォーテーションで囲ってある文字列を弾くという
				 * アレな対策でなんとかしてる状態です。なにかいい解決方法はないか…
				 */
				if (self.enable5000) {
					html = html.replace(self.regex5000, (text) => {
						return self.get5000(height, text);
					});
				}

				if (self.enableMoriogai) {
					html = html.replace(self.regexMoriogai, (text) => {
						return self.getMoriogai(height, text);
					});
				}

				if (self.enableHosii) {
					html = html.replace(self.regexHosii, (text) => {
						return self.getHosii(height, text);
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