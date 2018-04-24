// import {load} from "./settings";
// import {isHidden} from "./utils"
// import {guessComentSelector} from "./skipper"

let autoDetectComments = false;
let commentSelector = null;
let shortcuts = {};

//TODO: race condition
load(function (settings) {
	if (settings.autoDetectComments != null) {
		autoDetectComments = settings.autoDetectComments;
	}
	if (settings.sites) {
		for (const site of settings.sites) {
			const urlRegex = new RegExp("^" + site.urlPattern.replace(/\*/g, ".*") + "$");
			if (urlRegex.test(window.location.href) && site.commentSelector) {
				commentSelector = site.commentSelector;
				break;
			}
		}
	}
	if (settings.shortcuts) {
		shortcuts = settings.shortcuts;
	}
});

let prescrollPosition = null;

function doFullSkip(pageY, params) {
	prescrollPosition = {
		'x': window.scrollX,
		'y': window.scrollY
	}
	const headerHeight = doSkip(pageY, params);
	chrome.runtime.sendMessage({
		type: 'scroll-parent-header',
		data: {
			scrolled: headerHeight
		}
	})
}

let clickY;

document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY;
});

chrome.runtime.onMessage.addListener(function(msg) {
	if (msg.type == 'skip') {
		doFullSkip(clickY, {autoDetectComments, commentSelector});
	} else if (msg.type == 'scroll-header') {
		const fixedHeaderHeight = calcFixedHeaderHeight();//TODO sticky header
		window.scrollBy(0, -(fixedHeaderHeight - msg.data.scrolled));
	}
});

document.addEventListener('keyup', function(e) {
	if (document.activeElement 
		&& (document.activeElement.tagName == "INPUT" 
		|| document.activeElement.tagName == "SELECT"
			|| document.activeElement.tagName == "TEXTAREA")) {
				return;
	}
	if (e.key == shortcuts["skip"]) {
		const fixedHeaderHeight = calcFixedHeaderHeight();
		const headerHeight = fixedHeaderHeight;
		const startFrom = window.scrollY + headerHeight + 1; //TODO sticky header
		doFullSkip(startFrom, {fixedHeaderHeight, autoDetectComments, commentSelector});
	} else if (e.key == shortcuts["undo"]) {
		if (prescrollPosition != null) {
			window.scrollTo(prescrollPosition.x, prescrollPosition.y);
			prescrollPosition == null;
		}
	}
});
