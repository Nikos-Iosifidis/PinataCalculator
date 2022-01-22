var localStorageDataName = "pinata_extension";
var localStorageVerificationName = "pinata_extension_verification";

function parseNumber(number) {
    return parseFloat(number.replace(',', '.'))
};

function parseCart(cartDiscount, cartTotal, cartExtras, cartProductList) {
    var discount = 0;
    var total = 0;
    var products = [];
    var extras = 0;

    if (cartDiscount.length !== 0) {
        discount = parseNumber(cartDiscount.text());
    }

    if (cartTotal.length !== 0) {
        total = parseNumber(cartTotal.text()) - discount;
    }

    if (cartExtras.length !== 0) {
        $.each(cartExtras, function (i, extra) {
            extras += parseNumber($(extra).text());
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
                    price: parseNumber(price),
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
        },
        productsHash: products.length > 0 ? getHash(JSON.stringify(products)) : null
    };
};

function getHash(data) {
    if (typeof hex_md5 === 'undefined') {
        return '';
    }
    return hex_md5(JSON.stringify(data));
}

function sendDataToExtension(key, data) {
    chrome.runtime.sendMessage({
        'data': data,
        'key': key
    });
};

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}