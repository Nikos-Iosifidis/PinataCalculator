function saveShopId(shopId) {
    localStorage.setItem(localStorageShopId, shopId);
}

var pageComponent = document.getElementById('shop-profile-page');
if (pageComponent) {
    var config = {
        attributes: false,
        childList: true,
        subtree: false
    };

    var pageObserver = new MutationObserver(function () {
        saveShopId(window.dataLayer[0].shopID);
    });

    pageObserver.observe(pageComponent, config);
} else {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    saveShopId(params.shop_id);
}