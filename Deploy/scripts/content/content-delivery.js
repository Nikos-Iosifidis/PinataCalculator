chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.key === "popup_opened") {
            parseCartAndSend();
        }
    }
);

function parseCartAndSend() {
    var cartDiscount = $('#component-cart .cart-charge-notice-full-amount');
    var cartTotal = $('#component-cart .cart-total-price');
    var cartProductList = $('#component-cart .cart-body .cart-product-list .cart-product-list-item');
    var cartExtras = $('#component-cart .cart-charge-notice').not(':contains("περιβαλλοντικό τέλος")').find('.cart-charge-notice-amount');

    var data = parseCart(cartDiscount, cartTotal, cartExtras, cartProductList);
    sendDataToExtension('preview_order_data_efood', data.data);
}

function parseCart(cartDiscount, cartTotal, cartExtras, cartProductList) {
    var discount = 0;
    var total = 0;
    var products = [];
    var extras = 0;

    if (cartDiscount.length !== 0) {
        $.each(cartDiscount, function (i, value) {
            var parsed = parseNumber($(value).text());
            if (parsed < 0) {
                discount += parsed;
            }
        });
    }

    if (cartTotal.length !== 0) {
        total = parseNumber(cartTotal.text()) - discount;
    }

    if (cartExtras.length !== 0) {
        $.each(cartExtras, function (i, value) {
            var parsed = parseNumber($(value).text());
            if (parsed > 0) {
                extras += parsed;
            }
        });
    }

    if (cartProductList.length !== 0) {
        $.each(cartProductList, function (i, productElement) {
            var obj = $(productElement);
            var normalPrice = obj.find('.cart-product-list-item-price');
            var offerPrice = obj.find('span.font-weight-bold');
            var quantityElement = obj.find('.cart-product-list-item-quantity');

            var quantity = 1;
            if (quantityElement.length > 0) {
                quantity = parseInt(quantityElement.text());
            }

            var price = null;

            if (normalPrice.length > 0) {
                price = normalPrice.text();
            }
            else if (offerPrice.length > 0) {
                price = offerPrice.text();
            }
            if (price !== null) {
                products.push({
                    name: obj.find('.cart-product-list-item-name').text(),
                    description: obj.find('.cart-product-list-item-description').text(),
                    price: parseNumber(price) / quantity,
                    quantity: quantity
                });
            }
        });
    }

    return {
        data: {
            products: products,
            total: total,
            discount: discount,
            extras: extras
        }
    };
};
