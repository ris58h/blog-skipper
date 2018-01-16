let commentSelector = null;
let offset = 0;
//TODO it shouldn't be hardcoded
if (window.location.hostname == 'habrahabr.ru') {
	commentSelector = '.comment';
} else if (window.location.hostname == 'news.ycombinator.com') {
	commentSelector = '.comment';
	offset = 25;
} else if (window.location.hostname == '4pda.ru') {
	commentSelector = '[id^="comment-"]';
	offset = 50;
} else if (window.location.hostname.endsWith('.d3.ru')) {
	commentSelector = '[id^="b-comment-"] > .b-comment__body';
} else if (window.location.hostname == 'vc.ru') {
	commentSelector = '.comments__item__self';
	offset = 100;
} else if (window.location.hostname == 'disqus.com') {
	commentSelector = '.post-content';
} else if (window.location.hostname == 'www.reddit.com') {
	commentSelector = '[id^="form-t1_"]';
	offset = 25;
} else if (window.location.hostname == 'pikabu.ru') {
	commentSelector = '.b-comment__body';
} else if (window.location.hostname.endsWith('.livejournal.com')) {
	commentSelector = '.mdspost-thread';
	offset = 50;
}

let clickY;
document.addEventListener('contextmenu', function(e) {
	clickY = e.pageY;
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	doSkip(clickY);	
});

document.addEventListener('keyup', function(e) {
	if (e.key == 'z') { //TODO
		const windowCenterY = window.scrollY + (window.innerHeight / 2);
		doSkip(windowCenterY);
	}
});

function doSkip(pageY) {
	let next = nextCommentRoot(pageY);
	if (next == null) {
		next = nextHeader(pageY);
	}
	if (next != null) {
		goTo(next);
	}
}

function nextCommentRoot(pageY) {
	if (commentSelector == null) {
		return null;
	}

	const comments = [];
	let rootLevel = null;
	const nodeList = document.querySelectorAll(commentSelector);
	if (nodeList.length == 0) {
		return null;
	}
	for (const comment of nodeList) {
		if (!isHidden(comment)) {
			comments.push(comment);
			const commentLevel = level(comment);
			if (rootLevel == null || commentLevel < rootLevel) {
				rootLevel = commentLevel;
			}
		}
	}
	comments.sort(compareTop);

	const clickedIndex = indexOfClicked(comments, pageY);
	if (clickedIndex >= 0) {
		for (let i = clickedIndex + 1; i < comments.length; i++) {
			const comment = comments[i];
			if (level(comment) === rootLevel) {
				return comment;
			}
		}
	}

	return null;
}

function nextHeader(pageY) {
	const headers = [];
	const headersSelector = 'article h1,article h2,article h3,article h4,article h5,article h6';
	let nodeList = document.querySelectorAll(headersSelector);
	if (nodeList.length == 0) {
		const headersSelector2 = 'h1,h2,h3,h4,h5,h6';
		nodeList = document.querySelectorAll(headersSelector2);
	}
	if (nodeList.length == 0) {
		return null;
	}
	for (header of nodeList) {
		if (!isHidden(header)) {
			headers.push(header);
		}
	}
	headers.sort(compareTop);

	const clickedIndex = indexOfClicked(headers, pageY);
	if (clickedIndex >= 0) {
		if (clickedIndex < headers.length - 1) {
			return headers[clickedIndex + 1];
		}
	}

	return null;
}

function compareTop(a, b) {
	const aRect = a.getBoundingClientRect();
	const bRect = b.getBoundingClientRect();
	return aRect.top - bRect.top;	
}

function goTo(comment) {
	comment.scrollIntoView();
	window.scrollBy(0, -offset);
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

function indexOfClicked(elements, pageY) {
	for (let i = 0; i < elements.length; i++) {
		const elementY = window.scrollY + elements[i].getBoundingClientRect().top;
		if (elementY < pageY) {
			const isLast = i === elements.length - 1;
			const nextElementY = window.scrollY 
				+ (isLast ? elements[i].getBoundingClientRect().bottom 
					: elements[i + 1].getBoundingClientRect().top);
			if (pageY < nextElementY) {
				return i;
			}
		}
	}
	return -1;
}