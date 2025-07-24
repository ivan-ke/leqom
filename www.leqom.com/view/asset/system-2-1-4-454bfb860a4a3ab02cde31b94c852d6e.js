var $jQueryMakeShop = $.noConflict(true);
(function($) {
$(function() {
    initCommonLogin();
    initCommonCart();
    initCommonOrderForm();
    initCommonFavorite();
    initCommonSearchForm();
    initCommonContactForm();
    initCommonSlideshow();
});

// Deletion Candidate
function initCommonLogin()
{
    var loginUrlPrefix = '#makeshop-common-login-url:';
    $('[href^="' + loginUrlPrefix + '"]').on('click', function() {
        var key = $(this).attr('href').replace(loginUrlPrefix, '');
        switch (key) {
            case 'login':    location.replace('/view/member/login'); break;
            case 'mypage':   location.replace('/view/member/mypage'); break;
            case 'confirm':  location.replace('/view/member/order-history'); break;
            case 'reserve':  location.replace('/view/member/point'); break;
            case 'favorite': location.replace('/view/member/favorite'); break;
            case 'member':   location.replace('/view/member/member-edit'); break;
            default:         break;
        }
        
        return false;
    });
}

function initCommonCart()
{
    var pageData = $('#makeshop-page-common-cart-data');
    var cartUrl = pageData.attr('data-cart-url');
    var entryUrlPrefix = pageData.attr('data-cart-entry-url-prefix');
    var removeUrlPrefix = pageData.attr('data-cart-remove-url-prefix');
    var quantityUrlPrefix = pageData.attr('data-cart-quantity-url-prefix');
    var quantityIdPrefix = pageData.attr('data-id-quantity-prefix');

    $('[href^="' + entryUrlPrefix + '"]').on('click', function() {
        var source = $(this).attr('href');
        var index = $('[href="' + source + '"]').index(this);
        var itemCode = source.replace(entryUrlPrefix, '');
        
        $.ajax({
            url: '/api/cart/',
            type: 'POST',
            data: JSON.stringify({
                'action': 'add',
                'source': source,
                'element_index': index,
                'item_code': itemCode,
                'option_list': [],
                'quantity': 1,
                'is_subscription': false,
                'name_print' : []
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (data.result && data.ga4.event) {
                makeshop_ga_gtag('event', data.ga4.event, data.ga4.parameters);
            }

            if (typeof MakeShop_afterListCartEntry === 'function') {
                var hookData = {
                    result: data.result,
                    source: data.source,
                    elementIndex: data.element_index,
                    systemCode: data.item_code,
                    totalQuantity: data.total_quantity,
                    error: data.error,
                    method: {
                        modal: openModalMessage
                    }
                };
                if (MakeShop_afterListCartEntry(hookData) === false) {
                    return;
                }
            }
            
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }

            location.href = cartUrl;
        });
        
        return false;
    });

    $('[href^="' + removeUrlPrefix + '"]').on('click', function() {
        var source = $(this).attr('href');
        var index = $('[href="' + source + '"]').index(this);
        var key = source.replace(removeUrlPrefix, '');
        var item = key.split('-');
        
        $.ajax({
            url: '/api/cart/',
            type: 'POST',
            data: JSON.stringify({
                'action': 'remove',
                'source': source,
                'element_index': index,
                'item_code': item[0],
                'option1': item[1],
                'option2': item[2],
                'option_group': item[3],
                'name_print_number': item[4]
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (typeof MakeShop_afterCartRemove === 'function') {
                var hookData = {
                    result: data.result,
                    source: data.source,
                    elementIndex: data.element_index,
                    systemCode: data.item_code,
                    totalQuantity: data.total_quantity,
                    error: data.error,
                    method: {
                        modal: openModalMessage
                    }
                };
                if (MakeShop_afterCartRemove(hookData) === false) {
                    return;
                }
            }
            
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }
            location.href = cartUrl;
        });
        
        return false;
    });

    $('[href^="' + quantityUrlPrefix + '"]').on('click', function() {
    	var source = $(this).attr('href');
        var index = $('[href="' + source + '"]').index(this);
        var key = source.replace(quantityUrlPrefix, '');
        var item = key.split('-');

        var quantity = getFormValue(quantityIdPrefix + key, index);
        
        $.ajax({
            url: '/api/cart/',
            type: 'POST',
            data: JSON.stringify({
                'action': 'quantity',
                'source': source,
                'element_index': index,
                'item_code': item[0],
                'option1': item[1],
                'option2': item[2],
                'option_group': item[3],
                'name_print_number': item[4],
                'quantity': quantity
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (typeof MakeShop_afterCartQuantity === 'function') {
                var hookData = {
                    result: data.result,
                    source: data.source,
                    elementIndex: data.element_index,
                    systemCode: data.item_code,
                    totalQuantity: data.total_quantity,
                    error: data.error,
                    method: {
                        modal: openModalMessage
                    }
                };
                if (MakeShop_afterCartQuantity(hookData) === false) {
                    return;
                }
            }
            
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }
            location.href = cartUrl;
        });
        
        return false;
    });
}

function initCommonOrderForm()
{
    var pageData = $('#makeshop-page-common-order-data');
    var orderUrl = pageData.attr('data-order-url');

    $('[href="' + orderUrl + '"]').on('click', function() {
        $.ajax({
            url: '/api/cart/',
            type: 'POST',
            data: JSON.stringify({
                'service_type': 'makeshop',
                'action': 'order'
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }

            if (data.action === 'login') {
                var opt = '&ssl_tempid=' + $('#makeshop-form-common-order input[name=ssl_tempid]').val();
                ssl_login(data.login_type, opt);
                return;
            }
            
            $('#makeshop-form-common-order').attr('action', data.order_url);

            $('#makeshop-form-common-order').trigger('submit');
        });
        
        return false;
    });
}

function initCommonFavorite()
{
    var pageData = $('#makeshop-page-common-favorite-data');
    var entryUrlPrefix = pageData.attr('data-favorite-entry-url-prefix');
    var removeUrlPrefix = pageData.attr('data-favorite-remove-url-prefix');

    $('[href^="' + entryUrlPrefix + '"]').on('click', function() {
    	var source = $(this).attr('href');
        var index = $('[href="' + source + '"]').index(this);
        var itemCode = source.replace(entryUrlPrefix, '');
        
        $.ajax({
            url: '/api/favorite/',
            type: 'POST',
            data: JSON.stringify({
                'action': 'add',
                'source': source,
                'element_index': index,
                'item_code': itemCode
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (typeof MakeShop_afterListFavoriteEntry === 'function') {
                var hookData = {
                    result: data.result,
                    source: data.source,
                    elementIndex: data.element_index,
                    systemCode: data.item_code,
                    error: data.error,
                    method: {
                        modal: openModalMessage
                    }
                };
                if (MakeShop_afterListFavoriteEntry(hookData) === false) {
                    return;
                }
            }
        	
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }

            openModalMessage(data.message);
        });
        
        return false;
    });

    $('[href^="' + removeUrlPrefix + '"]').on('click', function() {
    	var source = $(this).attr('href');
        var index = $('[href="' + source + '"]').index(this);
        var itemCode = source.replace(removeUrlPrefix, '');
        
        $.ajax({
            url: '/api/favorite/',
            type: 'POST',
            data: JSON.stringify({
                'action': 'remove',
                'source': source,
                'element_index': index,
                'item_code': itemCode
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (typeof MakeShop_afterListFavoriteRemove === 'function') {
                var hookData = {
                    result: data.result,
                    source: data.source,
                    elementIndex: data.element_index,
                    systemCode: data.item_code,
                    error: data.error,
                    method: {
                        modal: openModalMessage
                    }
                };
                if (MakeShop_afterListFavoriteRemove(hookData) === false) {
                    return;
                }
            }
        	
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }

            openModalMessage(data.message);
        });
        
        return false;
    });
}

function initCommonSearchForm()
{
    var pageData = $('#makeshop-page-common-search-data');
    var searchUrl = pageData.attr('data-search-url');
    var keywordId = pageData.attr('data-id-keyword');
    var nameId = pageData.attr('data-id-name');
    var priceLowId = pageData.attr('data-id-price-low');
    var priceHighId = pageData.attr('data-id-price-high');
    var categoryId = pageData.attr('data-id-category');
    var originalCodeId = pageData.attr('data-id-original-code');
    
    $('[href="' + searchUrl + '"]').on('click', function() {
        var index = $('[href="' + searchUrl + '"]').index(this);
        var count = $('[href="' + searchUrl + '"]').length;

        var keyword = getFormValue(keywordId, count === $('[data-id="' + keywordId + '"]').length ? index : 0);
        var name = getFormValue(nameId, count === $('[data-id="' + nameId + '"]').length ? index : 0);
        var priceLow = getFormValue(priceLowId, count === $('[data-id="' + priceLowId + '"]').length ? index : 0);
        var priceHigh = getFormValue(priceHighId, count === $('[data-id="' + priceHighId + '"]').length ? index : 0);
        var category = getFormValue(categoryId, count === $('[data-id="' + categoryId + '"]').length ? index : 0);
        var originalCode = getFormValue(originalCodeId, count === $('[data-id="' + originalCodeId + '"]').length ? index : 0);
        
        $.ajax({
            url: '/shop/shopsearch_url.html',
            type: 'POST',
            data: JSON.stringify({
                'keyword': keyword,
                'name': name,
                'price_low': priceLow,
                'price_high': priceHigh,
                'category': category,
                'original_code': originalCode
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function(data) {
            if (!data.result) {
                openModalMessage(data.error.message);
                return;
            }
            location.href = data.url;
        });

        return false;
    });
}

function initCommonContactForm()
{
    var pageData = $('#makeshop-page-common-contact-data');
    var contactUrl = pageData.attr('data-contact-url');
    
    $('[href="' + contactUrl + '"]').on('click', function() {
        $('#makeshop-form-common-contact').trigger('submit');
        return false;
    });
}

function initCommonSlideshow()
{
    var pageData = $('#makeshop-page-common-slideshow-data');
    
    if (pageData.attr('data-enabled') !== 'Y') {
        return;
    }

    $('#M_slider .M_sliderFirstImage').remove();
    $('#M_slider li').show();
    $('#M_slider').bxSlider({
        pause: pageData.attr('data-pause'),
        speed: pageData.attr('data-speed'),
        controls: pageData.attr('data-controls') === 'Y',
        captions: pageData.attr('data-captions') === 'Y',
        mode: pageData.attr('data-mode'),
        auto: true
    });
}

function openModalMessage(message, callback)
{
    $('[data-remodal-id=makeshop-common-modal] .error-text').html(message);
    var modal = $('[data-remodal-id=makeshop-common-modal]').remodal({
        hashTracking: false,
        closeOnOutsideClick: false,
        modifier: 'makeshop-modal'
    });
    if (callback !== undefined) {
        $(document).on('closed', '.makeshop-modal .remodal', function (e) {
        	callback();
        });
    }
    modal.open();
}

function getFormValue(dataId, index)
{
    var result = $('[data-id="' + dataId + '"]').eq(index).val();
    return (result === undefined) ? '' : result;
}

function setFormValue(dataId, index, value)
{
    $('[data-id="' + dataId + '"]').eq(index).val(value);
}

})($jQueryMakeShop);
$jQueryMakeShop = null;