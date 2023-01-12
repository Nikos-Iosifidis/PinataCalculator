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

function parseCart(cart) {
    var total = 0;
    var products = [];
    var extras = 0;
    var discount = 0;

    extras += cart.delivery.deliveryCost || 0;
    extras += cart.tip || 0;
    extras += (cart.donations.csr || {}).amount || 0;

    total = cart.productsCost + extras;

    if (cart.jokerDiscount > 0) {
        discount = cart.jokerDiscount;
    } else if (cart.coupon.couponDiscount > 0) {
        discount = cart.coupon.couponDiscount;
        total += discount;
    } else {
        discount = 0;
    }

    $.each(cart.products, function (i, product) {
        products.push({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity
        });
    });

    return {
        products: products,
        total: total,
        discount: -discount,
        extras: extras
    };
};