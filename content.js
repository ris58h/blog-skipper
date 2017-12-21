function commentElements() { //TODO work with async comments loading
	var url = window.location.href;
	console.log('>>>url ' + url);
	var nodeList;
	//TODO it shouldn't be a hardcode
	if (window.location.hostname == 'habrahabr.ru') {
		nodeList = document.querySelectorAll('.comment');
	} else if (window.location.hostname == 'news.ycombinator.com') {
		nodeList = document.querySelectorAll('.comhead > a.hnuser');
	} else {
		return [];
	}
	return [].slice.call(nodeList);
}

var comments = commentElements();
console.log('>>> total comments found: ' + comments.length); //TODO
if (comments.length > 0) {
	comments.sort(function (a, b) {
		var aRect = a.getBoundingClientRect();
		var bRect = b.getBoundingClientRect();
		return aRect.top - bRect.top;
	});
	
	var history = [];
	var currentIndex = null;
	var initialScroll = document.documentElement.scrollTop || document.body.scrollTop;//TODO do before first move
	console.log('>>> initial scroll: ' + initialScroll);

	function goTo(nextIndex, addToHistory) {
		addToHistory = typeof addToHistory !== 'undefined' ? addToHistory : true;
		console.log(">>> go to " + nextIndex); //TODO
		if (addToHistory && currentIndex != null) {
			history.push(currentIndex);
		}
		console.log(history);
		comments[nextIndex].scrollIntoView();
		currentIndex = nextIndex;
	}

	function level(index) {
		return comments[index].getBoundingClientRect().left;
	}

	function parent(index) {
		var currentLevel = level(index);
		var prevIndex = index - 1;
		while (prevIndex >= 0 && level(prevIndex) >= currentLevel) {
			prevIndex--;
		}
		return prevIndex;
	}

	function root(index) {
		var rootIndex = index;
		var parentIndex = parent(index);
		while (parentIndex >= 0) {
			rootIndex = parentIndex;
			parentIndex = parent(parentIndex);
		}
		return rootIndex;
	}

	function nextSameLevelTree(index) {
		var currentLevel = level(index);
		var nextIndex = index + 1;
		while (nextIndex < comments.length && level(nextIndex) > currentLevel) {
			nextIndex++;
		}
		if (nextIndex < comments.length && level(nextIndex) == currentLevel) {
			return nextIndex;
		} else {
			return -1;
		}
	}

	function keyHandler(e) {
		if (e.key == 'c') { // Current
			goTo(currentIndex == null ? 0 : currentIndex, false);
		} else if (e.key == 'n') { // Next
			var nextIndex = currentIndex == null ? 0 : currentIndex + 1;
			if (nextIndex < comments.length) {
				goTo(nextIndex);
			}
		} else if (e.key == 'p') { // Prev
			if (currentIndex != null) {
				var prevIndex = currentIndex - 1;
				if (prevIndex >= 0) {
					goTo(prevIndex);	
				}
			}
		} else if (e.key == 'b') { // Back
			if (history.length > 0) {
				var nextIndex = history.pop();
				goTo(nextIndex, false);
			} else {
				currentIndex = null;
				document.documentElement.scrollTop = document.body.scrollTop = initialScroll;
			}
		} else if (e.key == 'f') { // Parent
			if (currentIndex != null) {
				var parentIndex = parent(currentIndex);
				if (parentIndex >= 0) {
					goTo(parentIndex);
				}
			}
		} else if (e.key == 'r') { // Root
			if (currentIndex != null) {
				var rootIndex = root(currentIndex);
				if (rootIndex != currentIndex) {
					goTo(rootIndex);
				}
			}
		} else if (e.key == 's') { // Skip Subtree
			if (currentIndex != null) {
				var nextIndex = nextSameLevelTree(currentIndex);
				if (nextIndex >= 0) {
					goTo(nextIndex);
				}
			}
		} else if (e.key == 't') { // Skip Tree
			if (currentIndex != null) {
				var rootIndex = root(currentIndex);
				var nextIndex = nextSameLevelTree(rootIndex);
				if (nextIndex >=0) {
					goTo(nextIndex);
				}
			}
		}
	};

	document.onkeyup = keyHandler;
}