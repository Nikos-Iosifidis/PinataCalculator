chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.key === "popup_opened") {
            parseCartAndSend();
        }
    }
);

function parseCartAndSend() {
    var cartDiscount = $('#component-cart .cart-discount-notice-amount');
    var cartTotal = $('#component-cart .cart-total-price');
    var cartProductList = $('#component-cart .cart-body .cart-product-list .cart-product-list-item').not('.notice-vat-wrapper');
    var cartExtras = $('#component-cart .cart-body .cart-delivery-cost-amount').not('.notice-vat-wrapper');

    var data = parseCart(cartDiscount, cartTotal, cartExtras, cartProductList);
    sendDataToExtension('preview_order_data_efood', data.data);
}