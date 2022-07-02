var saveCart = function () {
    var cart = window.ComponentCart.cart();

    if (cart) {
        var discount = window.ComponentCart.joker();
        if (discount) {
            discount = discount.getTierDiscount();
        } else {
            discount = 0;
        }

        localStorage.setItem(localStorageCartName, JSON.stringify({ cart, discount }));
    }
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
