export function loadDefault(callback) {
    const settingsUrl = chrome.runtime.getURL('settings.json');
    fetch(settingsUrl).then(function(response) {
        response.json().then(function(settings) {
            callback(settings);
        });
    });
}

export function load(callback) {
    chrome.storage.sync.get("settings", function(result) {
        if (result && result.settings) {
            callback(result.settings);
        } else {
            loadDefault(callback);
        }
    });
}

export function save(settings) {
    chrome.storage.sync.set({
        "settings": settings
    });
}