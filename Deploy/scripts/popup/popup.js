//Html elements
var table;
var imageContainer;
var notEfoodDiv;
var efoodDiv;
var oopsDiv;
var noOrdersDiv;
var btnCopy;
var btnDone;
//----------------------

var cookieFound = false;
var addresses;
var orderId;

function init() {
    table = $('#table-wraper');
    imageContainer = $('#img-out');
    notEfoodDiv = $('#not-efood');
    efoodDiv = $('#efood');
    oopsDiv = $('#oops');
    noOrdersDiv = $("#no-orders");
    btnCopy = $('#btn-copy');
    btnDone = $('#btn-done');

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.key === 'order_data_efood' || request.key === 'preview_order_data_efood') {
            var orderData = request.data;
            updateVisibleElementsInEfood(orderData);
        }
    });

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        var currentTab = tabs[0];

        var groups = currentTab.url.match(/(?:.*(?:order_id=)(?<id>\d*).*)|(?:.*(?:orders\/)(?<id2>\d*).*)/i)?.groups;
        orderId = groups?.id || groups?.id2;

        if (currentTab.url.includes('e-food.gr')) {
            notifyThatPopUpOpened(currentTab);
        } else {
            showElement(notEfoodDiv);
        }
    });

    document.getElementById('copyImageButton').addEventListener('click', function () {
        createTableImage(copyImage);
    });

    document.getElementById('efood-link').addEventListener('click', function () {
        chrome.tabs.create({ url: 'https://www.e-food.gr/account/orders' });
        window.close();
    });

    document.getElementById('old-link').addEventListener('click', function () {
        chrome.tabs.create({ url: 'https://www.e-food.gr/account/orders/' + orderId });
        window.close();
    });
}
$(init);

function createTableImage(onLoadCallback) {
    imageContainer.empty();
    return htmlToImage.toPng(table[0], { quality: 1, backgroundColor: 'rgba(0,0,0,0)' }).then(function (dataUrl) {
        imageContainer.on('load', function () {
            if (onLoadCallback) {
                onLoadCallback();
            }
        });
        imageContainer.attr('src', dataUrl);
    });
}

function copyImage() {
    var image = imageContainer[0];
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    copyCanvas(canvas);

    triggerCopiedAnimation();
}

function copyCanvas(canvas) {
    canvas.toBlob(function (blob) {
        if (navigator?.clipboard?.write) {
            // Create a ClipboardItem with the Blob
            const clipboardItem = new ClipboardItem({ 'image/png': blob });

            // Use Clipboard API to copy the image data to the clipboard
            navigator.clipboard.write([clipboardItem]);
        } else {
            blob.arrayBuffer().then(function (buffer) {
                browser.clipboard.setImageData(buffer, 'png');
            });
        }
    }, 'image/png');
}

function triggerCopiedAnimation() {
    hideElement(btnCopy);
    showElement(btnDone);

    setTimeout(function () {
        hideElement(btnDone);
        showElement(btnCopy);
    }, 2000);
}

function updateVisibleElementsInEfood(orderData) {
    if (orderData) {
        hideElement(notEfoodDiv);
        hideElement(oopsDiv);
        hideElement(noOrdersDiv);
        showElement(efoodDiv);
        calculatePrices(orderData);
        updateTable(orderData);
    }
    else if (orderId) {
        hideElement(notEfoodDiv);
        hideElement(efoodDiv);
        hideElement(noOrdersDiv);
        showElement(oopsDiv);
    } else {
        hideElement(notEfoodDiv);
        hideElement(efoodDiv);
        hideElement(oopsDiv);
        showElement(noOrdersDiv);
    }
}

function notifyThatPopUpOpened(currentTab) {
    chrome.tabs.sendMessage(currentTab.id, { key: 'popup_opened' });
}

function getNameTdElement(product) {
    var descriptionClass = 'product-description';
    if (!product.description) {
        descriptionClass += ' hidden';
    }

    return '<td>' + '<p class="product-name">' + product.name + '</p>' + '<p class="' + descriptionClass + '">' + product.description + '</p>' + '</td>';
}

function getPriceTdElement(product) {
    var secondaryPriceClass = 'secondary-price text-muted';
    if (product.quantity == 1) {
        secondaryPriceClass += ' hidden';
    }

    return (
        '<td class="text-center">' +
        '<p>' +
        product.price +
        '&#x20AC;</p>' +
        '<p class="' +
        secondaryPriceClass +
        '">(' +
        (product.price * product.quantity).toFixed(2) +
        '&#x20AC;)</p>' +
        '</td>'
    );
}

function getExtraTdElement(product) {
    var secondaryPriceClass = 'secondary-price text-muted';
    if (product.quantity == 1) {
        secondaryPriceClass += ' hidden';
    }

    return (
        '<td class="text-center">' +
        '<p>' +
        product.extras +
        '&#x20AC;</p>' +
        '<p class="' +
        secondaryPriceClass +
        '">(' +
        (product.extras * product.quantity).toFixed(2) +
        '&#x20AC;)</p>' +
        '</td>'
    );
}

function getPriceToPayTdElement(product) {
    var secondaryPriceClass = 'secondary-price text-muted';
    if (product.quantity == 1) {
        secondaryPriceClass += ' hidden';
    }

    return (
        '<td class="text-center">' +
        '<p>' +
        product.toPay.toFixed(2) +
        '&#x20AC;</p>' +
        '<p class="' +
        secondaryPriceClass +
        '">(' +
        (product.toPay * product.quantity).toFixed(2) +
        '&#x20AC;)</p>' +
        '</td>'
    );
}

function getTotalPriceToPayInnerElement(realTotal, totalToPay) {
    var diff = totalToPay - realTotal;

    return (
        '<div class="text-center">' +
        '<p>' +
        (realTotal + diff).toFixed(2) +
        '&#x20AC;</p>' +
        '<p class="text-muted secondary-price">(' +
        realTotal.toFixed(2) +
        '&#x20AC; + ' +
        diff.toFixed(2) +
        '&#x20AC;)</p>' +
        '</div>'
    );
}

function updateTable(data) {
    var totalToPay = 0;
    var tbody = $('tbody');
    tbody.empty();
    $.each(data.products, function (i, product) {
        var tableRow =
            '<tr>' +
            getNameTdElement(product) +
            '<td class="text-center">' +
            product.quantity +
            '</td>' +
            '<td class="text-center">' +
            (100 - product.payFactor * 100).toFixed(2) +
            '%</td>' +
            getExtraTdElement(product) +
            getPriceTdElement(product) +
            getPriceToPayTdElement(product) +
            '</tr>';
        totalToPay += product.toPay * product.quantity;
        tbody.append(tableRow);
    });
    $('#total').html(data.total.toFixed(2) + '&#x20AC;');
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
        var price = product.price;
        var orderFactor = price / totalWithoutExtras;
        var extras = orderFactor * totalExtras;

        product.payFactor = payFactor;
        product.price = price.toFixed(2);
        product.toPay = (payFactor * (price + extras)).toFixed(2) * 1.0;
        product.extras = extras.toFixed(2);
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
