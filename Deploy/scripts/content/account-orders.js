chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.key === "popup_opened") {
            var currentUrl = window.location.href;
            const regx = /.*orders[/]?/i;

            var id = currentUrl.replace(regx, '');
            if (id) {
                parseOrdersAndSend(id);
            } else {
                var data = JSON.parse(localStorage.getItem(localStorageDataName));
                sendDataToExtension('order_data_efood', data);
            }
        }
    }
);

function parseOrdersAndSend(id) {
    var orders = JSON.parse(localStorage.getItem(localStorageOrdersName)) || [];

    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        if (order.id == id) {
            var parsedData = parseOrder(order);

            if (parsedData && parsedData.data) {
                sendDataToExtension('order_data_efood', parsedData.data);
            }
            break;
        }
    }
}

function parseOrder(order) {
    var discount = order.discount;
    var total = order.discountedTotal + order.discount;
    var products = [];
    var extras = order.tip + order.deliveryCost;

    $.each(order.products, function (i, product) {
        products.push({
            name: product.name,
            description: product.customisation,
            price: product.full_price,
            quantity: product.quantity
        });
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


injectScripts(['scripts/common.js', 'scripts/injectable/orders-export.js']);