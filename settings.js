function loadDefault(callback) {
    const settingsUrl = chrome.runtime.getURL('settings.json');
    fetch(settingsUrl).then(function(response) {
        response.json().then(function(settings) {
            callback(settings);
        });
    });
}

function load(callback) {
    chrome.storage.sync.get("settings", function(result) {
        if (result && result.settings) {
            callback(result.settings);
        } else {
            loadDefault(callback);
        }
    });
}