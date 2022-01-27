//Html elements
var table;
var imageContainer;
var notEfoodDiv;
var efoodDiv;
var infoContainer;
var header;
var previewHeader;
//----------------------

var cookieFound = false;
var addresses;

function init() {
    table = $('#table-wraper');
    imageContainer = $("#img-out");
    notEfoodDiv = $('#not-efood');
    efoodDiv = $('#efood');
    infoContainer = $('.info-container');
    header = $('#pinata-header');
    previewHeader = $('#pinata-preview-header');

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.key === 'order_data_efood') {
                var orderData = request.data;
                if (orderData) {
                    updateVisibleElementsInEfood(orderData, false);
                }
            }
            else if (request.key === 'preview_order_data_efood') {
                var orderData = request.data;
                if (orderData) {
                    updateVisibleElementsInEfood(orderData, true);
                }
            }
        }
    );

    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true },
        function (tabs) {
            var currentTab = tabs[0];
            if (currentTab.url.includes('e-food.gr')) {
                notifyThatPopUpOpened(currentTab);
                showElement(efoodDiv);
                hideElement(notEfoodDiv);
            }
            else {
                hideElement(efoodDiv);
                showElement(notEfoodDiv);
            }
        });
};
$(init);

function updateVisibleElementsInEfood(orderData, isPreview) {
    hideElement(notEfoodDiv);
    showElement(efoodDiv);
    if (!isPreview) {
        showElement(header);
        hideElement(previewHeader);
    }
    else {
        showElement(previewHeader);
        hideElement(header);
    }
    calculatePrices(orderData);
    updateTable(orderData);
    if (!isPreview) {
        replaceWithImage();
        showElement(infoContainer);
        showElement(imageContainer);
    } else {
        hideElement(infoContainer);
        hideElement(imageContainer);
    }
}

function notifyThatPopUpOpened(currentTab) {
    chrome.tabs.sendMessage(currentTab.id, { 'key': 'popup_opened' });
};

function getNameTdElement(product) {
    var descriptionClass = 'product-description';
    if (!product.description) {
        descriptionClass += ' hidden';
    }

    return '<td>' +
        '<p class="product-name">' + product.name + '</p>' +
        '<p class="' + descriptionClass + '">' + product.description + '</p>' +
        '</td>';
};

function getPriceTdElement(product) {
    var secondaryPriceClass = 'secondary-price text-muted';
    if (product.quantity == 1) {
        secondaryPriceClass += ' hidden';
    }

    return '<td class="text-center">' +
        '<p>' + product.price + '&#x20AC;</p>' +
        '<p class="' + secondaryPriceClass + '">(' + (product.price * product.quantity).toFixed(2) + '&#x20AC;)</p>' +
        '</td>';
};

function getExtraTdElement(product) {
    var secondaryPriceClass = 'secondary-price text-muted';
    if (product.quantity == 1) {
        secondaryPriceClass += ' hidden';
    }

    return '<td class="text-center">' +
        '<p>' + product.extras + '&#x20AC;</p>' +
        '<p class="' + secondaryPriceClass + '">(' + (product.extras * product.quantity).toFixed(2) + '&#x20AC;)</p>' +
        '</td>';
};

function getPriceToPayTdElement(product) {
    var secondaryPriceClass = 'secondary-price text-muted';
    if (product.quantity == 1) {
        secondaryPriceClass += ' hidden';
    }

    return '<td class="text-center">' +
        '<p>' + product.toPay.toFixed(2) + '&#x20AC;</p>' +
        '<p class="' + secondaryPriceClass + '">(' + (product.toPay * product.quantity).toFixed(2) + '&#x20AC;)</p>' +
        '</td>';
};

function getTotalPriceToPayInnerElement(realTotal, totalToPay) {
    var diff = totalToPay - realTotal;

    return '<div class="text-center">' +
        '<p>' + (realTotal + diff).toFixed(2) + '&#x20AC;</p>' +
        '<p class="text-muted secondary-price">(' + realTotal.toFixed(2) + '&#x20AC; + ' + diff.toFixed(2) + '&#x20AC;)</p>' +
        '</div>';
};

function updateTable(data) {
    var totalToPay = 0;
    var tbody = $('tbody');
    tbody.empty();
    $.each(data.products, function (i, product) {
        var tableRow =
            '<tr>' +
            getNameTdElement(product) +
            '<td class="text-center">' + product.quantity + '</td>' +
            '<td class="text-center">' + (100 - product.payFactor * 100).toFixed(2) + '%</td>' +
            getExtraTdElement(product) +
            getPriceTdElement(product) +
            getPriceToPayTdElement(product) +
            '</tr>';
        totalToPay += product.toPay * product.quantity;
        tbody.append(tableRow);
    });
    //$('#total-extras').html(data.extras + '&#x20AC;');
    $('#total').html(data.total + '&#x20AC;');
    var realTotal = data.total + data.discount;
    $('#total-with-discount').html(getTotalPriceToPayInnerElement(realTotal, totalToPay));
}

function calculatePrices(data) {
    var total = data.total;
    var totalExtras = data.extras;
    var totalWithDiscount = total + data.discount;
    var payFactor = totalWithDiscount / total;
    var totalWithoutExtras = total - totalExtras;

    $.each(data.products, function (i, product) {
        var price = product.price / product.quantity
        var orderFactor = price / totalWithoutExtras;
        var extras = orderFactor * totalExtras;

        product.payFactor = payFactor;
        product.price = price.toFixed(2);
        product.toPay = Math.ceil((payFactor * (price + extras)).toFixed(2) * 10.0) / 10.0;
        product.extras = extras.toFixed(2);
    })
}

function replaceWithImage() {
    imageContainer.empty();
    showElement(table);
    html2canvas($(table), {
        onrendered: function (canvas) {
            hideElement(table);
            imageContainer.append(Canvas2Image.convertToPNG(canvas, canvas.width, canvas.height));
        }
    });
}

function showElement(element) {
    if (!element) {
        return;
    }
    element.removeClass('hidden');
}

function hideElement(element) {
    if (!element) {
        return;
    }
    element.addClass('hidden');
}