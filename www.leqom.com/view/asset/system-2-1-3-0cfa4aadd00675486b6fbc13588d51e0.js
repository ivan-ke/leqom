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

$(function() {
    initItemOption();
    initItemRestock();
    initItemSkuRestock();
    initItemSkuInformation();
    initItemFavorite();
    initItemCart();
    initItemSkuCart();
    initItemContact();
});

function initItemOption()
{
    var optionData = $('#makeshop-page-item-option-data');
    var purchaseTypeNormal = optionData.attr('data-purchase-type-normal');
    var purchaseTypeSubscription = optionData.attr('data-purchase-type-subscription');
    var optionIdPrefix = optionData.attr('data-id-option-prefix');
    var priceIdPrefix = optionData.attr('data-id-price-prefix');
    var priceExcludedTaxIdPrefix = optionData.attr('data-id-price-excluded-tax-prefix');
    var taxIdPrefix = optionData.attr('data-id-tax-prefix');
    var pointIdPrefix = optionData.attr('data-id-point-prefix');

    $('[data-id^="' + optionIdPrefix + '"]').on('change', function() {
    	var optionListIndex = $('[data-id="' + $(this).attr('data-id') + '"]').index(this);
        var optionListSetCount = $('[data-id="' + optionIdPrefix + '1"]').length;

        var priceIdPrefixCount = $('[data-id^="' + priceIdPrefix + '"]').length;
        var priceExcludedTaxIdPrefixCount = $('[data-id^="' + priceExcludedTaxIdPrefix + '"]').length;
        var taxIdPrefixCount = $('[data-id^="' + taxIdPrefix + '"]').length;
        var pointIdPrefixCount = $('[data-id^="' + pointIdPrefix + '"]').length;
        
        var priceIdCount = $('[data-id="' + priceIdPrefix + purchaseTypeNormal + '"]').length;
        var priceExcludedTaxIdCount = $('[data-id="' + priceExcludedTaxIdPrefix + purchaseTypeNormal + '"]').length;
        var taxIdCount = $('[data-id="' + taxIdPrefix + purchaseTypeNormal + '"]').length;
        var pointIdCount = $('[data-id="' + pointIdPrefix + purchaseTypeNormal + '"]').length;

        var subscriptionPriceIdCount = $('[data-id="' + priceIdPrefix + purchaseTypeSubscription + '"]').length;
        var subscriptionPriceExcludedTaxIdCount = $('[data-id="' + priceExcludedTaxIdPrefix + purchaseTypeSubscription + '"]').length;
        var subscriptionTaxIdCount = $('[data-id="' + taxIdPrefix + purchaseTypeSubscription + '"]').length;
        var subscriptionPointIdCount = $('[data-id="' + pointIdPrefix + purchaseTypeSubscription + '"]').length;
        
        var ajaxLoop = [];
        if (optionListSetCount === priceIdPrefixCount) {
        	var purchaseType = $('[data-id^="' + priceIdPrefix + '"]').eq(optionListIndex).attr('data-id').replace(priceIdPrefix, '');
        	ajaxLoop.push({ is_repeat_sale: (purchaseType === purchaseTypeSubscription) });
        } else if (optionListSetCount === priceExcludedTaxIdPrefixCount) {
        	var purchaseType = $('[data-id^="' + priceExcludedTaxIdPrefix + '"]').eq(optionListIndex).attr('data-id').replace(priceExcludedTaxIdPrefix, '');
        	ajaxLoop.push({ is_repeat_sale: (purchaseType === purchaseTypeSubscription) });
        } else {
        	if (0 < priceIdCount || 0 < priceExcludedTaxIdCount) {
        	    ajaxLoop.push({ is_repeat_sale: false });
        	}
        	if (0 < subscriptionPriceIdCount || 0 < subscriptionPriceExcludedTaxIdCount) {
        	    ajaxLoop.push({ is_repeat_sale: true });
        	}
        }

        var optionList = [];
        if (optionListSetCount !== 0) {
            var optionMax = $('[data-id^="' + optionIdPrefix + '"]').length / optionListSetCount;
            for (var i = 0; i < optionMax; i++) {
                optionList.push($('[data-id="' + optionIdPrefix + (i + 1) + '"]').eq(optionListIndex).val());
            }
        }

        for (var ajaxIndex in ajaxLoop) {
	        $.ajax({
	            url: '/shop/item_info.html',
	            type: 'POST',
	            data: JSON.stringify({
	            	'element_index': optionListIndex,
	                'item_code': optionData.attr('data-brandcode'),
	                'option_list': optionList,
	                'is_repeat_sale': ajaxLoop[ajaxIndex].is_repeat_sale
	            }),
	            contentType: 'application/json',
	            dataType: 'json'
	        }).done(function(data) {
	        	var purchaseType = purchaseTypeNormal;
	        	if (data.is_repeat_sale) {
	        		purchaseType = purchaseTypeSubscription;
	        	}

	        	updateItemOptionPrice(data.element_index, data.final_price, optionListSetCount, priceIdPrefix, priceIdPrefixCount, priceIdCount, subscriptionPriceIdCount, purchaseType);
            	updateItemOptionPrice(data.element_index, data.final_price_excluded_tax, optionListSetCount, priceExcludedTaxIdPrefix, priceExcludedTaxIdPrefixCount, priceExcludedTaxIdCount, subscriptionPriceExcludedTaxIdCount, purchaseType);
	        	updateItemOptionPrice(data.element_index, data.final_tax, optionListSetCount, taxIdPrefix, taxIdPrefixCount, taxIdCount, subscriptionTaxIdCount, purchaseType);
	        	updateItemOptionPrice(data.element_index, data.final_point, optionListSetCount, pointIdPrefix, pointIdPrefixCount, pointIdCount, subscriptionPointIdCount, purchaseType);

	            if (typeof MakeShop_afterItemOptionChange === 'function') {
	                var hookData = {
	                    elementIndex: data.element_index,
	                    originalCode: data.original_code,
	                    isSoldout: data.is_soldout,
	                    imageL: data.image_l,
	                    imageS: data.image_s,
	                    method: {
	                        modal: openModalMessage
	                    }
	                };
	                if (MakeShop_afterItemOptionChange(hookData) === false) {
	                    return;
	                }
	            }
	        });
        }
        
        return false;
    }).trigger('change');
}

function updateItemOptionPrice(index, value, optionListSetCount, idPrefix, idPrefixCount, idCount, subscriptionIdCount, purchaseType)
{
    if (optionListSetCount === idPrefixCount) {
    	$('[data-id^="' + idPrefix + '"]').eq(index).html(value);
    } else if (optionListSetCount === idCount || optionListSetCount === subscriptionIdCount) {
    	$('[data-id="' + idPrefix + purchaseType + '"]').eq(index).html(value);
    } else {
    	$('[data-id="' + idPrefix + purchaseType + '"]').eq(0).html(value);
    }
}

function initItemRestock()
{
    var restockData = $('#makeshop-page-item-restock-data');
    var restockUrl = restockData.attr('data-restock-url');
    var hasOption = restockData.attr('data-has-option');
    var optionIdPrefix = restockData.attr('data-id-option-prefix');
    
    $('[href="' + restockUrl + '"]').on('click', function() {
        window.open('about:blank', 'itemRestockWindow', 'width=448,height=450,scrollbars=yes,resizable=yes');
        
        var optionString = '';
        if (hasOption === 'Y') {
            var optionList = [];
            $('[data-id^="' + optionIdPrefix + '"]').each(function() {
                optionList.push($(this).val());
            });
            if (optionList.length == 1) {
                optionList.push(0);
            }
            optionString = optionList.join('_');
        }
        
        $('#makeshop-form-item-restock [name=restock_option]').val(optionString);
        $('#makeshop-form-item-restock').trigger('submit');
        return false;
    });
}

function initItemSkuRestock()
{
    var restockData = $('#makeshop-page-item-restock-data');
    var restockUrlPrefix = restockData.attr('data-sku-restock-url-prefix');
    
    $('[href^="' + restockUrlPrefix + '"]').on('click', function() {
        var params = $(this).attr('href').replace(restockUrlPrefix, '').split('-');
        var optionString = params[0] + '_' + params[1];
        
        window.open('about:blank', 'itemRestockWindow', 'width=448,height=450,scrollbars=yes,resizable=yes');
        $('#makeshop-form-item-restock [name=restock_option]').val(optionString);
        $('#makeshop-form-item-restock').trigger('submit');
        return false;
    });
}

function initItemSkuInformation()
{
    var informationData = $('#makeshop-page-item-information-data');
    var informationUrlPrefix = informationData.attr('data-sku-information-url-prefix');
    
    $('[href^="' + informationUrlPrefix + '"]').on('click', function() {
        var source = $(this).attr('href');
        var urlIndex = $('[href="' + source + '"]').index(this);
        var params = source.replace(informationUrlPrefix, '').split('-');
        
        getItemInformation({
            'source': source,
            'element_index': urlIndex,
            'item_code': informationData.attr('data-brandcode'),
            'option_list': [params[0], params[1]]
        });
        
        return false;
    });
}

function initItemFavorite()
{
    var favoriteData = $('#makeshop-page-item-favorite-data');
    var favoriteEntryUrlPrefix = favoriteData.attr('data-favorite-entry-url-prefix');
    var favoriteRemoveUrlPrefix = favoriteData.attr('data-favorite-remove-url-prefix');
    
    $('[href^="' + favoriteEntryUrlPrefix + '"]').on('click', function() {
        var source = $(this).attr('href');
        var favoriteEntryUrlIndex = $('[href="' + source + '"]').index(this);
        var params = source.replace(favoriteEntryUrlPrefix, '').split('-');

        addItemFavorite({
            'source': source,
            'element_index': favoriteEntryUrlIndex,
            'item_code': favoriteData.attr('data-brandcode'),
            'option_list': [params[0], params[1]]
        });
        
        return false;
    });
    
    $('[href^="' + favoriteRemoveUrlPrefix + '"]').on('click', function() {
        var source = $(this).attr('href');
        var favoriteRemoveUrlIndex = $('[href="' + source + '"]').index(this);
        var params = source.replace(favoriteRemoveUrlPrefix, '').split('-');

        removeItemFavorite({
        	'source': source,
            'element_index': favoriteRemoveUrlIndex,
            'item_code': favoriteData.attr('data-brandcode'),
            'option_list': [params[0], params[1]]
        });
        
        return false;
    });
}

function initItemCart()
{
    var cartData = $('#makeshop-page-item-cart-data');
    var cartEntryUrlPrefix = cartData.attr('data-cart-entry-url-prefix');
    var purchaseTypeNormal = cartData.attr('data-purchase-type-normal');
    var purchaseTypeSubscription = cartData.attr('data-purchase-type-subscription');
    var quantityId = cartData.attr('data-id-quantity');
    var optionIdPrefix = cartData.attr('data-id-option-prefix');
    var namePrintIdPrefix = cartData.attr('data-id-name-print-prefix');
    
    $('[href^="' + cartEntryUrlPrefix + '"]').on('click', function() {
    	var source = $(this).attr('href');
        var cartEntryUrlPrefixIndex = $('[href^="' + cartEntryUrlPrefix + '"]').index(this);
        var cartEntryUrlIndex = $('[href="' + source + '"]').index(this);

        var cartEntryUrlPrefixCount = $('[href^="' + cartEntryUrlPrefix + '"]').length;
        var cartEntryUrlCount = $('[href="' + source + '"]').length;
        
        var quantityIndex = 0;
        var quantityCount = $('[data-id="' + quantityId + '"]').length;
        if (quantityCount === cartEntryUrlPrefixCount) {
            quantityIndex = cartEntryUrlPrefixIndex;
        } else if (quantityCount === cartEntryUrlCount) {
            quantityIndex = cartEntryUrlIndex;
        }
        var quantity = getFormValue(quantityId, quantityIndex);
        quantity = (quantity === '') ? 1 : quantity;
        
        var optionListIndex = 0;
        var optionListSetCount = $('[data-id="' + optionIdPrefix + '1"]').length;
        if (optionListSetCount === cartEntryUrlPrefixCount) {
            optionListIndex = cartEntryUrlPrefixIndex;
        } else if (optionListSetCount === cartEntryUrlCount) {
            optionListIndex = cartEntryUrlIndex;
        }
        var optionList = [];
        if (optionListSetCount !== 0) {
            var optionMax = $('[data-id^="' + optionIdPrefix + '"]').length / optionListSetCount;
            for (var i = 0; i < optionMax; i++) {
                optionList.push($('[data-id="' + optionIdPrefix + (i + 1) + '"]').eq(optionListIndex).val());
            }
        }

        var namePrintListCount = $('[data-id="' + namePrintIdPrefix + '1"]').length;
        var namePrintListIndex = getItemElementIndex(namePrintListCount, cartEntryUrlPrefixCount, cartEntryUrlPrefixIndex, cartEntryUrlCount, cartEntryUrlIndex);
        var namePrintList = [];
        if (namePrintListCount !== 0) {
            var namePrintMax = $('[data-id^="' + namePrintIdPrefix + '"]').length / namePrintListCount;
            for (var i = 0; i < namePrintMax; i++) {
                namePrintList.push($('[data-id="' + namePrintIdPrefix + (i + 1) + '"]').eq(namePrintListIndex).val());
            }
        }
        
        var purchaseType = source.replace(cartEntryUrlPrefix, '');
        
        addItemCart({
            'source': source,
            'element_index': cartEntryUrlIndex,
            'item_code': cartData.attr('data-brandcode'),
            'option_list': optionList,
            'quantity': quantity,
            'is_subscription': (purchaseType === purchaseTypeSubscription),
            'name_print': namePrintList,
            'end_url': cartData.attr('data-cart-url')
        });

        return false;
    });
}

function initItemSkuCart()
{
    var cartData = $('#makeshop-page-item-cart-data');
    var cartEntryUrlPrefix = cartData.attr('data-sku-cart-entry-url-prefix');
    var purchaseTypeNormal = cartData.attr('data-purchase-type-normal');
    var purchaseTypeSubscription = cartData.attr('data-purchase-type-subscription');
    var quantityId = cartData.attr('data-id-quantity');
    var namePrintIdPrefix = cartData.attr('data-id-name-print-prefix');

    $('[href^="' + cartEntryUrlPrefix + '"]').on('click', function() {
    	var source = $(this).attr('href');
        var cartParams = source.replace(cartEntryUrlPrefix, '').split('-');
        var purchaseType = cartParams[0];
        var optionList = [];
        optionList.push(cartParams[1]);
        optionList.push(cartParams[2]);
        
        var cartEntryUrlIndex = $('[href="' + source + '"]').index(this);
        var cartEntryUrlCount = $('[href="' + source + '"]').length;
        
        var cartEntryUrlMatchIndex = $('[href^="' + cartEntryUrlPrefix + '"][href$="-' + cartParams[1] + '-' + cartParams[2] + '"]').index(this);
        var cartEntryUrlMatchCount = $('[href^="' + cartEntryUrlPrefix + '"][href$="-' + cartParams[1] + '-' + cartParams[2] + '"]').length;;
        
        var quantityIndex = 0;
        var quantityCount = $('[data-id="' + quantityId + '"]').length;
        if (quantityCount === cartEntryUrlCount) {
            quantityIndex = cartEntryUrlIndex;
        } else if (quantityCount === cartEntryUrlMatchCount) {
            quantityIndex = cartEntryUrlMatchIndex;
        }
        var quantity = getFormValue(quantityId, quantityIndex);
        quantity = (quantity === '') ? 1 : quantity;
        
        var namePrintListCount = $('[data-id="' + namePrintIdPrefix + '1"]').length;
        var namePrintListIndex = getItemElementIndex(namePrintListCount, cartEntryUrlCount, cartEntryUrlIndex, cartEntryUrlMatchCount, cartEntryUrlMatchIndex);
        var namePrintList = [];
        if (namePrintListCount !== 0) {
            var namePrintMax = $('[data-id^="' + namePrintIdPrefix + '"]').length / namePrintListCount;
            for (var i = 0; i < namePrintMax; i++) {
                namePrintList.push($('[data-id="' + namePrintIdPrefix + (i + 1) + '"]').eq(namePrintListIndex).val());
            }
        }
        
        addItemCart({
            'source': source,
            'element_index': cartEntryUrlIndex,
            'item_code': cartData.attr('data-brandcode'),
            'option_list': optionList,
            'quantity': quantity,
            'is_subscription': (purchaseType === purchaseTypeSubscription),
            'name_print': namePrintList,
            'end_url': cartData.attr('data-cart-url')
        });

        return false;
    });
}

function getItemElementIndex(count, cartEntryUrlPrefixCount, cartEntryUrlPrefixIndex, cartEntryUrlCount, cartEntryUrlIndex)
{
    var result = 0;
    
    if (count === cartEntryUrlPrefixCount) {
        result = cartEntryUrlPrefixIndex;
    } else if (count === cartEntryUrlCount) {
        result = cartEntryUrlIndex;
    }
    
    return result;
}

function addItemCart(params)
{
    $.ajax({
        url: '/api/cart/',
        type: 'POST',
        data: JSON.stringify({
            'action': 'add',
            'source': params.source,
            'element_index': params.element_index,
            'item_code': params.item_code,
            'option_list': params.option_list,
            'quantity': params.quantity,
            'is_subscription': params.is_subscription,
            'name_print' : params.name_print
        }),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function(data) {
        if (data.result && data.ga4.event) {
            makeshop_ga_gtag('event', data.ga4.event, data.ga4.parameters);
        }

        if (typeof MakeShop_afterCartEntry === 'function') {
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
            if (MakeShop_afterCartEntry(hookData) === false) {
                return;
            }
        }
        
        if (!data.result) {
            openModalMessage(data.error.message);
            return;
        }

        location.href = params.end_url;
    });
}

function getItemInformation(params)
{
    $.ajax({
        url: '/shop/item_info.html',
        type: 'POST',
        data: JSON.stringify({
            'source': params.source,
            'element_index': params.element_index,
            'item_code': params.item_code,
            'option_list': params.option_list
        }),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function(data) {
        if (typeof MakeShop_afterItemOptionInformation === 'function') {
        	const optionRelatedImageList = [];
        	for (const image of data.option_related_image_list) {
        		optionRelatedImageList.push({ imageL: image.image_l, imageS: image.image_s });
        	}
            var hookData = {
                elementIndex: data.element_index,
                isSoldout: data.is_soldout,
                imageL: data.image_l,
                imageS: data.image_s,
                optionRelatedImageList: optionRelatedImageList,
                method: {
                    modal: openModalMessage
                }
            };
            if (MakeShop_afterItemOptionInformation(hookData) === false) {
                return;
            }
        }
    });
}

function addItemFavorite(params)
{
    $.ajax({
        url: '/api/favorite/',
        type: 'POST',
        data: JSON.stringify({
            'action': 'add',
            'source': params.source,
            'element_index': params.element_index,
            'item_code': params.item_code,
            'option_list': params.option_list
        }),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function(data) {
        if (typeof MakeShop_afterFavoriteEntry === 'function') {
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
            if (MakeShop_afterFavoriteEntry(hookData) === false) {
                return;
            }
        }
        
        if (!data.result) {
            openModalMessage(data.error.message);
            return;
        }

        openModalMessage(data.message);
    });
}

function removeItemFavorite(params)
{
    $.ajax({
        url: '/api/favorite/',
        type: 'POST',
        data: JSON.stringify({
            'action': 'remove',
            'source': params.source,
            'element_index': params.element_index,
            'item_code': params.item_code,
            'option1': params.option_list[0],
            'option2': params.option_list[1]
        }),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function(data) {
        if (typeof MakeShop_afterFavoriteRemove === 'function') {
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
            if (MakeShop_afterFavoriteRemove(hookData) === false) {
                return;
            }
        }
        
        if (!data.result) {
            openModalMessage(data.error.message);
            return;
        }

        openModalMessage(data.message);
    });
}

function initItemContact()
{
    var contactData = $('#makeshop-page-item-contact-data');
    var contactUrl = contactData.attr('data-contact-url');

    $('[href="' + contactUrl + '"]').on('click', function() {
        $('#makeshop-form-item-contact').trigger('submit');
        return false;
    });
}

})($jQueryMakeShop);
$jQueryMakeShop = null;