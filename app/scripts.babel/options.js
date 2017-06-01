'use strict';

$(function(){
	let defaults = {
		enable5000: true,
		enableMoriogai: true,
		enableHosii: true
	};
	
	chrome.storage.local.get(defaults, (items) => {
		$('#5000trillion').prop('checked', items.enable5000);
		$('#morimori').prop('checked', items.enableMoriogai);
		$('#hosii').prop('checked', items.enableHosii);
	});

	$('#5000trillion').change(function() {
		let checked = $(this).is(':checked');
		let object = {
			enable5000: checked
		};
		chrome.storage.local.set(object, function(){});
	});

	$('#morimori').change(function() {
		let checked = $(this).is(':checked');
		let object = {
			enableMoriogai: checked
		};
		chrome.storage.local.set(object, function(){});
	});

	$('#hosii').change(function() {
		let checked = $(this).is(':checked');
		let object = {
			enableHosii: checked
		};
		chrome.storage.local.set(object, function(){});
	});
});