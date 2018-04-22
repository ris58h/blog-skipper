// import {isHidden} from "./utils"

const loggingEnabled = false;
function log(s) {
	if (loggingEnabled) {
		console.log(s);
	}
}

/*export*/ function guessComentSelector() {
	if (document.querySelectorAll(".comment").length > 1) {
		log("Dumb comments detection is used!");
		return {
			selector: ".comment",
			parent: 0,
		};
	} 
	for (const commentCandidatesSelector of commentCandidatesSelectors) {
		const stats = {};
		const commentCandidates = document.querySelectorAll(commentCandidatesSelector);
		for (const candidate of commentCandidates) {
			if (isHidden(candidate)) {
				continue;
			}
			const cs = extractCommentSelector(candidate);
			if (cs) {
				const n = siblingIndex(candidate);
				const selector = cs + ":nth-child(" + n + ")";
				if (!stats[selector]) {
					stats[selector] = 0;
				}
				stats[selector]++;
			}
		}
		log(stats);
		const topSelectors = topKeys(stats);
		log(topSelectors);
		let bestSelector = null;
		if (topSelectors.length == 0) {
			// do nothing
		} else if (topSelectors.length == 1) {
			bestSelector = {
				selector: topSelectors[0],
				parent: 0,
			};
		} else {
			// Lowest Common Ancestor & the closest comment element
			let lcaIndex = 0;
			let closestSelector = topSelectors[0];
			let parentGap = 0;
			const path = []; {
				let element = document.querySelector(closestSelector);
				do {
					path.push(element);
				} while ((element = element.parentElement) != null);
			}
			for (let i = 1; i < topSelectors.length; i++) {
				const selector = topSelectors[i];
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
		log(bestSelector);
		if (bestSelector) {
			return bestSelector;
		}
	}
	return null;
}

function extractCommentSelector(element) {
	if (element.id && includesCommentWord(element.id)) {
		if (endsWithInt(element.id)) {
			return startsWithSelector("id", trimIntEnding(element.id));
		} else {
			return '#' + element.id;
		}
	}
	const fpArray = [];
	for (const className of element.classList) {
		if (includesCommentWord(className)) {
			if (endsWithInt(className)) {
				fpArray.push(containsSelector('class', trimIntEnding(className)));
			} else {
				fpArray.push('.' + className);
			}
		}
	}
	if (fpArray.length > 0) {
		return fpArray.sort().join('');
	} else {
		return null;
	}
}

const commentWords = ["comment"];
const commentCandidatesSelectors = [];
for (const commentWord of commentWords) {
	const idSelector = containsSelector("id", commentWord) + ":not(code)";
	const classSelector = containsSelector("class", commentWord) + ":not(code)";
	commentCandidatesSelectors.push(idSelector + ',' + classSelector);
}
const includesCommentWord = s => commentWords.some(cw => s.includes(cw));

const intEndingRegexp = /\d+$/;

function endsWithInt(s) {
	return intEndingRegexp.test(s);
}

function trimIntEnding(s) {
	return s.replace(intEndingRegexp, '');
}

function startsWithSelector(attr, s) {
	return "[" + attr + "^='" + s + "']";
}

function containsSelector(attr, s) {
	return "[" + attr + "*='" + s + "']";
}

function siblingIndex(element) {
	let i = 1;
	while(element = element.previousSibling) {
		if (element.nodeType == 1) {
			i++;
		}
	}
	return i;
}

// TODO better name for this function.
function topKeys(stats) {
	const keys = Object.keys(stats);
	if (keys.length == 0) {
		return [];
	}
	if (keys.length == 1) {
		return keys;
	}
	keys.sort((a, b) => stats[b] - stats[a]);
	const topKeys = [];
	for (let i = 0; topKeys.length == 0 || stats[keys[i]] == stats[keys[0]]; i++) {
		topKeys.push(keys[i]);
	}
	if (topKeys.length == 1) {
		const topKeys2 = [];
		const start = topKeys.length;
		for (let i = start; topKeys2.length == 0 || stats[keys[i]] == stats[keys[start]]; i++) {
			topKeys2.push(keys[i]);
		}
		if (topKeys2.length > 1 && stats[topKeys[0]] - stats[topKeys2[0]] == 1) {
			return topKeys2;
		}
	}
	return topKeys;
}
