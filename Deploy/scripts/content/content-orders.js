chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.key === "popup_opened") {
            parseCartAndSend();
        }
    }
);

function parseCartAndSend() {
    var shopId = localStorage.getItem(localStorageShopId);
    var localStorKey = `cart_new__${shopId}`;
    var cart = JSON.parse(localStorage.getItem(localStorKey)) || {};
    var parsedCart = parseCart(cart);
    localStorage.setItem(localStorageDataName, JSON.stringify(parsedCart));

    sendDataToExtension('order_data_efood', parsedCart);
}

injectScripts(['scripts/common.js', 'scripts/injectable/shop-info-export.js']);