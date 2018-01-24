let commentSelector = null;
let offset = null;

//TODO: race condition
chrome.storage.sync.get("settings", function(result) {
    if (result && result.settings) {
      	processSettings(result.settings);
    } else {
		const settingsUrl = chrome.runtime.getURL('settings.json');
		fetch(settingsUrl).then(function(response) {
			response.json().then(function(settings) {
				processSettings(settings);
			});
		});
    }
});

function processSettings(settings) {
	for (site of settings.sites) {
		const urlRegExp = new RegExp("^" + site.urlPattern.replace(/\*/g, ".*") + "$");
		if (urlRegExp.test(window.location.href)) {
			if (site.commentSelector) {
				commentSelector = site.commentSelector;
			}
			return;
		}
	}
}

let prescrollPosition = null;

let clickY;
document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY;
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	doSkip(clickY);	
});

let precalcFixedHeaderHeight = null;//TODO get rid of this hack to improve performance
document.addEventListener('keyup', function(e) {//TODO Z
	if (e.key == 'z') { //TODO
		let additionalScroll;
		if (offset == null) {
			// let t1 = Date.now();//TODO
			precalcFixedHeaderHeight = calcFixedHeaderHeight();
			// let t2 = Date.now();//TODO
			// console.log('>>> fixed: ' + (t2 - t1));//TODO
			additionalScroll = precalcFixedHeaderHeight;
		} else {
			additionalScroll = offset;
		}
		const startFrom = window.scrollY + additionalScroll + 1; //TODO sticky header
		doSkip(startFrom);
		precalcFixedHeaderHeight = null;
	} else if (e.key == 'Z') { //TODO
		if (prescrollPosition != null) {
			window.scrollTo(prescrollPosition.x, prescrollPosition.y);
		}
	}
});

function doSkip(pageY) {
	// let t1 = Date.now();//TODO
	const next = nextTarget(pageY);
	// let t2 = Date.now();//TODO
	if (next != null) {
		goTo(next);
	}
	// let t3 = Date.now();//TODO
	// console.log('>>> next: ' + (t2 - t1));
	// console.log('>>> goTo: ' + (t3 - t2));
}

function nextTarget(pageY) {
	const elements = [];
	
	const headersSelector = 'article h1,article h2,article h3,article h4,article h5,article h6';
	let headerList = document.querySelectorAll(headersSelector);
	if (headerList.length == 0) {
		const headersSelector2 = 'h1,h2,h3,h4,h5,h6';
		headerList = document.querySelectorAll(headersSelector2);
	}
	for (const header of headerList) {
		if (!isHidden(header)) {
			elements.push(header);
		}
	}

	let rootLevel = null;
	if (commentSelector != null) {
		const commentList = document.querySelectorAll(commentSelector);
		for (const comment of commentList) {
			if (!isHidden(comment)) {
				markAsComment(comment);
				elements.push(comment);
				const commentLevel = level(comment);
				if (rootLevel == null || commentLevel < rootLevel) {
					rootLevel = commentLevel;
				}
			}
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
		if (curIndex < 0 || !isMarkedAsComment(elements[curIndex])) {
			return elements[curIndex + 1];
		} else {
			let lastComment = null;
			for (let i = curIndex + 1; i < elements.length; i++) {
				const e = elements[i];
				if (isMarkedAsComment(e)) {
					if (level(e) === rootLevel) {
						return e;
					}
					lastComment = e;
				}
			}
			return lastComment;
		}
	}
}

const markKey = '_blog-skipper-is-comment';

function markAsComment(element) {
	element[markKey] = true;
}

function isMarkedAsComment(element) {
	return element[markKey];
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
	if (additionalScroll != 0) {
		window.scrollBy(0, -additionalScroll);
	}
}

function calcFixedHeaderHeight() {
	const minWidth = window.innerWidth / 2;
	const maxHeight = window.innerHeight / 2;
	for (const e of document.body.getElementsByTagName("*")) {
		// we have to perform fast checks first
		// TODO how to make it faster???
		if (e.offsetWidth > minWidth
			&& e.offsetHeight > 0
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
			const style = window.getComputedStyle(e, null);
			if (style.getPropertyValue('position') == 'sticky') {
				if (e.offsetHeight > 0) {
					return e.offsetHeight;
				}
			}
		}
	}
	return 0;
}

function level(comment) {
	return comment.getBoundingClientRect().left;
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