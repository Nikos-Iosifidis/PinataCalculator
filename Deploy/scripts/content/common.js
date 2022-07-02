function parseNumber(number) {
    return parseFloat(number.replace(',', '.'))
};

function sendDataToExtension(key, data) {
    chrome.runtime.sendMessage({
        'data': data,
        'key': key
    });
};

function injectScripts(list) {
    for (var i = 0; i < list.length; i++) {
        var script = document.createElement('script');
        script.src = chrome.runtime.getURL(list[i]);        ;
        (document.head || document.documentElement).appendChild(script);
    }
}