let sites = [];
let offset = null;

let shortcuts = {};

//TODO: race condition
load(function (settings) {
	sites = settings.sites.map(site => {
		return {
			urlRegex: new RegExp("^" + site.urlPattern.replace(/\*/g, ".*") + "$"),
			commentSelector: site.commentSelector
		}
	});
	if (settings.shortcuts) {
		shortcuts = settings.shortcuts;
	}
});

let prescrollPosition = null;

let clickY;
document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY;
});
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.type == 'skip') {
		doSkip(clickY);
	} else if (msg.type == 'scroll-header') {
		const fixedHeaderHeight = calcFixedHeaderHeight();//TODO sticky header
		window.scrollBy(0, -(fixedHeaderHeight - msg.data.scrolled));
	}
});

let precalcFixedHeaderHeight = null;//TODO get rid of this hack to improve performance
document.addEventListener('keyup', function(e) {
	if (document.activeElement 
		&& (document.activeElement.tagName == "INPUT" 
			|| document.activeElement.tagName == "SELECT"
			|| document.activeElement.tagName == "TEXTAREA")) {
		return;
	}
	if (e.key == shortcuts["skip"]) {
		let additionalScroll;
		if (offset == null) {
			precalcFixedHeaderHeight = calcFixedHeaderHeight();
			additionalScroll = precalcFixedHeaderHeight;
		} else {
			additionalScroll = offset;
		}
		const startFrom = window.scrollY + additionalScroll + 1; //TODO sticky header
		doSkip(startFrom);
		precalcFixedHeaderHeight = null;
	} else if (e.key == shortcuts["undo"]) {
		if (prescrollPosition != null) {
			window.scrollTo(prescrollPosition.x, prescrollPosition.y);
			prescrollPosition == null;
		}
	}
});

function doSkip(pageY) {
	const next = nextTarget(pageY);
	if (next != null) {
		goTo(next);
	}
}

function nextTarget(pageY) {
	const elements = [];
	
	let commentsBounds = null;
	let commentSelector = null;
	for (site of sites) {
		if (site.urlRegex.test(window.location.href)) {
			if (site.commentSelector) {
				commentSelector = site.commentSelector;
			}
			break;
		}
	}
	if (commentSelector != null) {
		const commentList = document.querySelectorAll(commentSelector);
		for (const comment of commentList) {
			if (!isHidden(comment)) {
				elements.push(comment);
				const rect = comment.getBoundingClientRect();
				if (commentsBounds == null) {
					commentsBounds = {
						left: rect.left,
						top: rect.top,
						bottom: rect.bottom
					};
				} else {
					if (rect.left < commentsBounds.left) {
						commentsBounds.left = rect.left;
					}
					if (rect.top < commentsBounds.top) {
						commentsBounds.top = rect.top;
					}
					if (rect.bottom > commentsBounds.bottom) {
						commentsBounds.bottom = rect.bottom;
					}
				}
			}
		}
	}

	const inVertCommentBounds = function (e) {
		if (commentsBounds == null) {
			return false;
		}
		const rect = e.getBoundingClientRect();
		return commentsBounds.top <= rect.top && rect.bottom <= commentsBounds.bottom;	
	}

	const headersSelector = 'article h1,article h2,article h3,article h4,article h5,article h6';
	let headerList = document.querySelectorAll(headersSelector);
	if (headerList.length == 0) {
		const headersSelector2 = 'h1,h2,h3,h4,h5,h6';
		headerList = document.querySelectorAll(headersSelector2);
	}
	for (const header of headerList) {
		if (!isHidden(header) && !inVertCommentBounds(header)) {
			elements.push(header);
		}
	}

	if (elements.length == 0) {
		return 0;
	}

	elements.sort(compareTop);

	const index = indexOfSorted(elements, pageY);
	const curIndex = index < 0 ? -index - 2 : index;
	if (curIndex >= elements.length - 1) {
		return null;
	} else {
		if (curIndex < 0 || !inVertCommentBounds(elements[curIndex])) {
			return elements[curIndex + 1];
		} else {
			let lastComment = null;
			for (let i = curIndex + 1; i < elements.length; i++) {
				const e = elements[i];
				if (inVertCommentBounds(e)) {
					if (e.getBoundingClientRect().left === commentsBounds.left) {
						return e;
					}
					lastComment = e;
				}
			}
			return lastComment;
		}
	}
}

function compareTop(a, b) {
	const aRect = a.getBoundingClientRect();
	const bRect = b.getBoundingClientRect();
	return aRect.top - bRect.top;	
}

function goTo(element) {
	prescrollPosition = {
		'x': window.scrollX,
		'y': window.scrollY
	}
	
	element.scrollIntoView();

	let additionalScroll;
	if (offset == null) {
		const fixedHeaderHeight = precalcFixedHeaderHeight == null ? calcFixedHeaderHeight() 
				: precalcFixedHeaderHeight;
		const stickyHeaderHeight = calcStickyHeaderHeight(element);
		additionalScroll = fixedHeaderHeight + stickyHeaderHeight;	
	} else {
		additionalScroll = offset;
	}
	window.scrollBy(0, -additionalScroll);
	chrome.runtime.sendMessage({
		type: 'scroll-parent-header',
		data: {
			scrolled: additionalScroll
		}
	})
}

function calcFixedHeaderHeight() {
	const maxHeight = window.innerHeight / 2;
	for (const e of document.body.querySelectorAll("div,nav,header")) {
		if (e.offsetHeight > 0
			&& e.offsetHeight < maxHeight
			&& window.getComputedStyle(e, null).getPropertyValue('position') == 'fixed'
			&& e.getBoundingClientRect().top == 0) {
			return e.offsetHeight;
		}
	}
	return 0;
}

function calcStickyHeaderHeight(element) {
	let parent = element;
	while ((parent = parent.parentElement) != null) {
		for (const e of parent.children) {
			if (e.offsetHeight > 0
				&& e.offsetHeight < e.offsetWidth
				&& window.getComputedStyle(e, null).getPropertyValue('position') == 'sticky') {
				return e.offsetHeight;
			}
		}
	}
	return 0;
}

function matches(elem, selector) {
	const proto = window.Element.prototype;
	const nativeMatches = proto.matches ||
		proto.mozMatchesSelector ||
		proto.msMatchesSelector ||
		proto.oMatchesSelector ||
		proto.webkitMatchesSelector;
  
	if (!elem || elem.nodeType !== 1) {
	  return false;
	}
  
	return nativeMatches.call(elem, selector);
}

function isHidden(el) {
	if (el.offsetParent === null) {
		return true;
	}
    const style = window.getComputedStyle(el);
    return (style.display === 'none')
}

function indexOfSorted(elements, pageY) { //TODO binary search
	const y = pageY - window.scrollY;
	let prevBottom = Number.NEGATIVE_INFINITY;
	for (let i = 0; i < elements.length; i++) {
		const rect = elements[i].getBoundingClientRect();
		if (y < rect.top) {
			if (y <= prevBottom) {
				return i - 1;
			} else {
				return -i - 1;
			}
		}
		prevBottom = rect.bottom;
	}
	return -elements.length - 1;
}