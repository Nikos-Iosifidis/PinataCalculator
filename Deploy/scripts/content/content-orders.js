function parseCartSaveAndSend() {
    var cartDiscount = $('#component-cart .cart-header .cart-discount-notice .cart-discount-notice-amount');
    var cartTotal = $('#component-cart .cart-header .cart-total-price');
    var cartProductList = $('#component-cart .cart-body .cart-product-list .cart-product-list-item').not('.notice-vat-wrapper');
    var cartExtras = $('#component-cart .cart-body .cart-delivery-cost-amount, #component-cart .cart-body .cart-discount-notice-amount, #component-cart .cart-body .cart-csr-list .cart-product-list-item-price').not('.notice-vat-wrapper');


    var parsedData = parseCart(cartDiscount, cartTotal, cartExtras, cartProductList);
    var savedVerification = JSON.parse(localStorage.getItem(localStorageVerificationName)) || {};
    var newVerification = {
        productsHash: parsedData.productsHash,
        discount: parsedData.data.discount,
        extras: parsedData.data.extras
    };

    if (newVerification.productsHash !== null && (newVerification.productsHash !== savedVerification.productsHash || savedVerification.discount > newVerification.discount || savedVerification.extras != newVerification.extras)) {
        localStorage.setItem(localStorageDataName, JSON.stringify(parsedData.data));
        localStorage.setItem(localStorageVerificationName, JSON.stringify(newVerification));
        sendDataToExtension('order_data_efood', parsedData.data);
    }
};

var cartComponent = document.getElementById('component-cart');
var config = {
    attributes: false,
    childList: true,
    subtree: true
};

var totalPriceObserver;
var cartObserver = new MutationObserver(function () {
    parseCartSaveAndSend();

    var totalPriceElements = document.getElementsByClassName('cart-total-price');

    if (totalPriceElements.length > 0 && !totalPriceObserver) {
        var config2 = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        };
        var totalPriceObserver = new MutationObserver(parseCartSaveAndSend);
        totalPriceObserver.observe(totalPriceElements[0], config2);
        cartObserver.disconnect();
    }
});

cartObserver.observe(cartComponent, config);