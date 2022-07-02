(function (xhr) {

    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            var url = this._url ? this._url.toLowerCase() : this._url;
            if (url.indexOf("api.e-food.gr/api/v1/user/orders/history") > 0) {
                if (this.responseText) {
                    try {
                        var ordersData = JSON.parse(this.responseText).data;
                        if (ordersData.orders && ordersData.orders.length > 0) {
                            var parsedOrders = [];
                            for (var i = 0; i < ordersData.orders.length; i++) {
                                parsedOrders.push(parseOrder(ordersData.orders[i]));
                            }
                            saveMissingOrders(parsedOrders);
                        } else {
                            var parsedOrder = parseOrder(ordersData);
                            saveMissingOrders([parsedOrder]);
                        }                     
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }

            function parseOrder(order) {               
                return {
                    id: order.id,
                    products: order.products,
                    discountedTotal: order.price,
                    discount: order.joker_discount,
                    tip: order.tip,
                    deliveryCost: order.delivery_cost,
                };
            };

            function saveMissingOrders(orders) {
                var existingOrders = JSON.parse(localStorage.getItem(localStorageOrdersName)) || [];
                for (var i = 0; i < orders.length; i++) {
                    if (!existingOrders.filter((o) => { return o.id == orders[i].id }).length) {
                        existingOrders.push(orders[i]);
                    }                        
                }
                localStorage.setItem(localStorageOrdersName, JSON.stringify(existingOrders));
            };
        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);