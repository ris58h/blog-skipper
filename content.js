let autoDetectComments = false;
let sites = [];
let shortcuts = {};

//TODO: race condition
load(function (settings) {
	if (settings.autoDetectComments != null) {
		autoDetectComments = settings.autoDetectComments;
	}
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
chrome.runtime.onMessage.addListener(function(msg) {
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
		precalcFixedHeaderHeight = calcFixedHeaderHeight();
		const headerHeight = precalcFixedHeaderHeight;
		const startFrom = window.scrollY + headerHeight + 1; //TODO sticky header
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
	for (const site of sites) {
		if (site.urlRegex.test(window.location.href) && site.commentSelector) {
			commentSelector = {
				selector: site.commentSelector,
				parent: 0,
			};
			break;
		}
	}
	if (!commentSelector && autoDetectComments) {
		commentSelector = guessComentSelector();
	}
	if (commentSelector) {
		let commentList = querySuperSelector(commentSelector);
		for (const comment of commentList) {
			if (!isHidden(comment)) {
				elements.push(comment);
				const rect = comment.getBoundingClientRect();
				if (commentsBounds == null) {
					commentsBounds = {
						contentLeft: rect.left + leftPadding(comment),
						top: rect.top,
						bottom: rect.bottom
					};
				} else {
					if (rect.left + leftPadding(comment) < commentsBounds.contentLeft) {
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
		return null;
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
					const rect = e.getBoundingClientRect();
					if (rect.left + leftPadding(e) === commentsBounds.contentLeft) {
						return e;
					}
					lastComment = e;
				}
			}
			return lastComment;
		}
	}
}

function querySuperSelector(superSelector) {
	const elements = document.querySelectorAll(superSelector.selector);
	if (superSelector.parent == 0) {
		return elements;
	}
	const parents = [];
	const processedKey = Symbol();
	for (const element of elements) {
		let parent = element;
		for (let i = 0; i < superSelector.parent; i++) {
			parent = parent.parentElement;
		}
		if (!parent[processedKey]) {
			parents.push(parent);
			parent[processedKey] = true;
		}
	}
	for (const parent of parents) {
		delete parent[processedKey];
	}
	return parents;
}

function leftPadding(e) {
	return window.getComputedStyle(e, null).getPropertyValue('padding-left')
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

	const fixedHeaderHeight = precalcFixedHeaderHeight == null ? calcFixedHeaderHeight() 
			: precalcFixedHeaderHeight;
	const stickyHeaderHeight = calcStickyHeaderHeight(element);
	const headerHeight = fixedHeaderHeight + stickyHeaderHeight;	
	window.scrollBy(0, -headerHeight);
	chrome.runtime.sendMessage({
		type: 'scroll-parent-header',
		data: {
			scrolled: headerHeight
		}
	})
}

function calcFixedHeaderHeight() {
	const maxHeight = window.innerHeight / 2;
	const minWidth = window.innerWidth / 2;
	let lowestBottom = 0;
	for (const e of document.body.querySelectorAll("div,nav,header")) {
		if (e.offsetHeight > 0
			&& e.offsetHeight < maxHeight
			&& e.offsetWidth > minWidth
			&& window.getComputedStyle(e, null).getPropertyValue('position') == 'fixed') {
			const bottom = e.getBoundingClientRect().bottom;
			if (bottom < window.innerHeight / 2 && bottom > lowestBottom) {
				lowestBottom = bottom;
			}
		}
	}
	return lowestBottom;
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

function isHidden(el) {
	if (el.offsetParent === null) {
		return true;
	}
    const style = window.getComputedStyle(el);
    return style.display === 'none' || style.opacity == '0';
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

const commentWords = ["comment", "post", "message"];
const commentCandidatesSelectors = [];
for (const commentWord of commentWords) {
	commentCandidatesSelectors.push(containsSelector("id", commentWord));
	commentCandidatesSelectors.push(containsSelector("class", commentWord));
}
const commentCandidatesSelector = commentCandidatesSelectors.join();
const includesCommentWord = s => commentWords.some(cw => s.includes(cw));

function normalizeSelector(value) {
	return value.replace(/\d+$/, '*');
}

function denormalizeSelector(s) {
	if (!s.endsWith('*')) {
		return s;
	}
	if (s.startsWith('#')) {
		return startsWithSelector('id', s.substring(1, s.length - 1));
	} else if (s.startsWith('.')) {
		// StartsWith matches against whole class list string.
		// We have to use contains instead.
		// return startsWithSelector('class', s.substring(1, s.length - 1));
		return containsSelector('class', s.substring(1, s.length - 1));
	} else {
		return s;
	}
}

function startsWithSelector(attr, s) {
	return "[" + attr + "^='" + s + "']";
}

function containsSelector(attr, s) {
	return "[" + attr + "*='" + s + "']";
}


function footprint(element) {
	if (element.id && includesCommentWord(element.id)) {
		return normalizeSelector('#' + element.id);
	}
	const fpArray = [];
	for (const className of element.classList) {
		if (includesCommentWord(className)) {
			fpArray.push(normalizeSelector('.' + className));
		}
	}
	if (fpArray.length > 0) {
		return fpArray.sort().join(' ');
	} else {
		return null;
	}
}

function pairFootprintToSelector(pairFootprint) {
	const pair = pairFootprint.split(' | ');
	const parentFootprint = pair[0];
	const second = pair[1];
	const spaceIndex = second.indexOf(' ');
	const index = second.substring(0, spaceIndex);
	const childFootprint = second.substring(spaceIndex + 1);
	const parentSelector = footprintToSelector(parentFootprint);
	const childSelector = footprintToSelector(childFootprint);
	return parentSelector + ' > ' + childSelector + ":nth-child(" + index + ")";
}

function footprintToSelector(footprint) {
	const split = footprint.split(' ');
	if (split.length == 1) {
		return denormalizeSelector(split[0]);
	} else {
		return split.map(denormalizeSelector).join('');
	}
}

function guessComentSelector() {
	const stats = {};
	const commentCandidates = document.querySelectorAll(commentCandidatesSelector);
	const elementsToCheck = [];
	const processedKey = Symbol();
	for (const commentCandidate of commentCandidates) {
		if (!commentCandidate[processedKey] && !isHidden(commentCandidate)) {
			commentCandidate[processedKey] = true;
			elementsToCheck.push(commentCandidate);
		}
		const parent = commentCandidate.parentElement;
		if (parent && !parent[processedKey] && !isHidden(parent)) {
			parent[processedKey] = true;
			elementsToCheck.push(parent);
		}
	}
	for (const parent of elementsToCheck) {
		delete parent[processedKey];
		const parentFootprint = footprint(parent) || '*';
		let i = 0;
		for (const child of parent.children) {
			i++;
			if (isHidden(child)) {
				continue;
			}
			//TODO
			// It's just a quick hack for 4pda.ru.
			// There are nested comment lists even for 'leaf' comments (empty of course),
			// that spoil stats.
			if (!child.hasChildNodes()) {
				continue;
			}
			const childFootprint = footprint(child) || '*';
			if (parentFootprint == '*' && childFootprint == '*') {
				continue;
			}
			if (childFootprint) {
				const pairFootprint = parentFootprint + ' | ' + i + ' ' + childFootprint;
				if (!stats[pairFootprint]) {
					stats[pairFootprint] = 0;
				}
				stats[pairFootprint]++;
			}
		}
	}
	console.log(stats);//TODO
	const topFootprints = topKeys(stats);
	console.log(topFootprints);//TODO
	let bestSelector = null;
	if (topFootprints.length == 0) {
		// do nothing
	} else if (topFootprints.length == 1) {
		bestSelector = {
			selector: pairFootprintToSelector(topFootprints[0]),
			parent: 0,
		};
	} else {
		// Lowest Common Ancestor & the closest comment element
		let lcaIndex = 0;
		let closestSelector = pairFootprintToSelector(topFootprints[0]);
		let parentGap = 0;
		const path = []; {
			let element = document.querySelector(closestSelector);
			do {
				path.push(element);
			} while ((element = element.parentElement) != null);
		}
		for (let i = 1; i < topFootprints.length; i++) {
			const selector = pairFootprintToSelector(topFootprints[i]);
			let element = document.querySelector(selector);
			let parentCount = -1;
			do {
				parentCount++;
				const index = path.indexOf(element);
				if (index >= 0) {
					if (index == lcaIndex && parentCount < parentGap) {
						parentGap = parentCount;
						closestSelector = selector;
					} else if (index > lcaIndex) {
						const currentGap = index - lcaIndex;
						if (parentCount  < currentGap) {
							parentGap = parentCount;
							closestSelector = selector;
						} else {
							parentGap += currentGap;
						}
						lcaIndex = index;
					}
					break;
				}
			} while ((element = element.parentElement) != null);
			if (element == null) {
				throw "Separated trees?!";
			}
		}
		bestSelector = {
			selector: closestSelector,
			parent: parentGap,
		}
	}
	console.log(bestSelector);//TODO
	return bestSelector;
}

function topKeys(stats) {
	let topCount = 0;
	let topKeys = [];
	for (const key of Object.keys(stats)) {
		const count = stats[key];
		if (count > topCount) {
			topCount = count;
			topKeys = [];
			topKeys.push(key);
		} else if (count == topCount) {
			topKeys.push(key);
		}
	}
	return topKeys;
}
