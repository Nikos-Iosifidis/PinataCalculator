chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.key === "popup_opened") {
            var data = JSON.parse(localStorage.getItem(localStorageDataName));
            sendDataToExtension('order_data_efood', data);
        }
    }
);