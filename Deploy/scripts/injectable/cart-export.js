var saveCart = function () {
    var cart = window.ComponentCart.cart();

    if (cart) {
        var discount = window.ComponentCart.joker();
        if (discount) {
            discount = discount.getTierDiscount();
        } else {
            discount = 0;
        }
        var parsedCart = parseCart(cart, discount);
        localStorage.setItem(localStorageDataName, JSON.stringify(parsedCart));
    }
};

function parseCart(cart, discount) {
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
                name: product.offer_title,
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
        products: products,
        total: total,
        discount: -discount,
        extras: extras
    };
};

var pageComponent = document.getElementById('checkout-page');
var config = {
    attributes: false,
    childList: true,
    subtree: true
};

var pageObserver = new MutationObserver(function () {
    saveCart();
});

pageObserver.observe(pageComponent, config);