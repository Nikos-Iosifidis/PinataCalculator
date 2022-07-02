chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.key === "popup_opened") {
            parseCartSaveAndSend();
        }
    }
);

function parseCartSaveAndSend() {
    var cart = JSON.parse(localStorage.getItem(localStorageCartName)) || {}
    var parsedData = parseCart(cart);

    if (parsedData && parsedData.data) {
        localStorage.setItem(localStorageDataName, JSON.stringify(parsedData.data));
        sendDataToExtension('order_data_efood', parsedData.data);
    }
}

function parseCart(cartWrap) {
    var cart = cartWrap.cart;
    var discount = cartWrap.discount;
    var total = 0;
    var products = [];
    var extras = 0;

    for (var i = 0; i < cart.attributes.length; i++) {
        if (cart.attributes[i].key.startsWith('tip_')) {
            extras += cart.attributes[i].value;
        }
    }
    extras += cart.delivery_cost;
    if (cart.csr) {
        extras += cart.csr.selectedAmount;
    }

    total = cart.products_cost + extras;

    var groupedProducts = [];
    $.each(cart.products, function (i, product) {
        if (!groupedProducts[product.group_id]) {
            groupedProducts[product.group_id] = [product];
        } else {
            groupedProducts[product.group_id].push(product);
        }
    });

    $.each(Object.keys(groupedProducts), function (i, key) {
        var product = groupedProducts[key][0];
        if (product.offer_title) {
            var names = [];
            $.each(groupedProducts[key], function (i, product) {
                names.push(product.name);
            });
            products.push({
                name: product.offer_title ,
                description: names.join(','),
                price: product.offer_total,
                quantity: 1
            });
        } else {
            products.push({
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: product.quantity
            });
        }
    });

    return {
        data: {
            products: products,
            total: total,
            discount: -discount,
            extras: extras
        }
    };
};

injectScripts(['scripts/common.js', 'scripts/injectable/cart-export.js']);