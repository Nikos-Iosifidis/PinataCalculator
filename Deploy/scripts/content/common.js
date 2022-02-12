function parseNumber(number) {
    return parseFloat(number.replace(',', '.'))
};

function sendDataToExtension(key, data) {
    chrome.runtime.sendMessage({
        'data': data,
        'key': key
    });
};