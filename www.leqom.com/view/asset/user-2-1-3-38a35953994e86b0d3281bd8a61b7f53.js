/* -----------------------------------
  * header height
----------------------------------- */
const breakPoint = 767;
let headerHeight = 0;
if (window.innerWidth <= breakPoint) {
    headerHeight = $('header').outerHeight();
}

/* -----------------------------------
    * Smooth Scroll
  ----------------------------------- */
$(function(){
    const urlHash = location.hash;
    if (urlHash) {
        $('body,html').stop().scrollTop(0);
        setTimeout(function(){
            let target = $(urlHash);
            let position = target.offset().top - headerHeight;
            $('body,html').stop().animate({scrollTop:position}, 500);
        }, 100);
    }

    $('a[href^="#"]').click(function() {
        let href= $(this).attr("href");
        let target = $(href);
        let position = target.offset().top - headerHeight;
        $('body,html').stop().animate({scrollTop:position}, 500);
    });
});/* Smooth Scroll END*/

/* -----------------------------------
* Hamburger Menu
----------------------------------- */
$(function(){
    let state = false;
    let scrollPos;
    $('#js_menu_btn').click(function() {
        if(state == false) {
            scrollPos = $(window).scrollTop();
            $('#js_all_wrap').addClass('is_fixed').css({'top': -scrollPos});
            $(this).addClass('is_active');
            $('#js_gnav').fadeIn().addClass('is_open');
            state = true;
        } else {
            $('#js_all_wrap').removeClass('is_fixed').css({'top': 0});
            window.scrollTo( 0 , scrollPos );
            $('#js_gnav').fadeOut().removeClass('is_open');
            $(this).removeClass('is_active');
            state = false;
        }
    });

    /* Hamburger Menu Link
  ----------------------------------- */
    $('#js_gnav a').click(function(){
        if(state == true) {
            $('#js_menu_btn').trigger("click");
        }
    });

});/* Hamburger Menu END*/

/* -----------------------------------
    * fixed fadeIn fadeOut
  ----------------------------------- */
$(window).on('load', function(){
    $(window).scroll(function () {
        const fvHeight = $('#js_fv_wrap').outerHeight(),
            TargetPos = fvHeight + headerHeight,
            scrollPos = $(window).scrollTop();

        if (scrollPos >= TargetPos) {
            $("#js_top_btn").fadeIn();
        } else {
            $("#js_top_btn").fadeOut();
        }
    });
});/* fixed fadeIn fadeOut END*/

/* -----------------------------------
    * accordion
  ----------------------------------- */
$('.js_acd_btn').on('click', function() {
    if( $(this).parent().is('.is_open') ) {
        $(this).parent().removeClass('is_open');
        $(this).parent().next('.js_acd_cont').slideUp();
    } else {
        $(this).parent().addClass('is_open');
        $(this).parent().next('.js_acd_cont').slideDown();
    }
});

/* -----------------------------------
  * fade up
----------------------------------- */
$(window).on('load scroll', function(){
	let fadeUpTiming = 50;
	if (window.innerWidth <= breakPoint) {
    fadeUpTiming = 0;
	}
    const fadeUpScroll = $(window).scrollTop();
    const fadeUpWindowHeight = $(window).height();

    $('.js_fade_up').each(function(){
        const elemPos = $(this).offset().top;
        if (fadeUpScroll > elemPos - fadeUpWindowHeight + fadeUpTiming){
            $(this).addClass('is_fade_up');
        }
    });

    //1文字ずつ表示させる場合は、こちら
    $('.js_fade_up_one_wrap.ttl_fade').find('.js_fade_up_one').each(function(index){
        const elemPos = $(this).offset().top;
        if (fadeUpScroll > elemPos - fadeUpWindowHeight + fadeUpTiming){
            $(this).delay(index * 10).queue(function(){
                $(this).addClass('is_fade_up');
            });
        }
    });
});

/* -----------------------------------
  * ページ最下部より下にスクロールした時に波線が見えないようにするための記述です。
----------------------------------- */
$(window).on('load scroll', function () {
        const doch = $(document).innerHeight();
        const winh = $(window).innerHeight();
        const bottom = doch - winh;
        if (bottom - 200 <= $(window).scrollTop()) {
            $("#fixed_wavy_lines_hide_bg").addClass('is_show');
        } else {
            $("#fixed_wavy_lines_hide_bg").removeClass('is_show');
        }
    });

/* -----------------------------------
    * PC search btn
  ----------------------------------- */
$(document).on('click', function(e) {
const searchWrap = '#js_search_wrap',
    searchBox = '#js_search_box',
    searchBtn = '#js_search_btn';
    
    if(!$(e.target).closest(searchWrap).length && !$(e.target).closest(searchBtn).length){
        $(searchWrap).slideUp(300, function() {
            $(searchWrap).removeClass('is_show');
            $(searchBox).removeClass('is_show');
        });
    } else if($(e.target).closest(searchBtn).length){

        if($(searchWrap).is('.is_show')){
            $(searchWrap).removeClass('is_show');
            $(searchWrap).slideUp(300, function() {
                $(searchBox).removeClass('is_show');
            });
        } else {
            $(searchWrap).addClass('is_show');
            $(searchWrap).slideDown(300);
            $(searchBox).addClass('is_show');
        }
    }
});

$(function() {
    // 商品画像の拡大表示
    $('.modal-image').on('click', function() {
        var imgSrc = $(this).attr('src');
        $('.bigimg').children().attr('src', imgSrc);
        $('.image-modal').fadeIn();
        $('body, html').css('overflow-y', 'hidden');
        return false;
    });
    $('.image-modal').on('click', function() {
        $('.image-modal').fadeOut();
        $('body, html').css('overflow-y', 'visible');
        return false;
    });

    slickSetting();
});

function MakeShop_afterItemOptionChange(data){
    if (data.isSoldout) {
        $('.instock').removeClass('on').addClass('off');
        $('.outstock').removeClass('off').addClass('on');
    } else {
        $('.instock').removeClass('off').addClass('on');
        $('.outstock').removeClass('on').addClass('off');
    }
}

function slickSetting() {
    $('.item-image-list').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        asNavFor: '.item-image-thumb'
    });

    $('.item-image-thumb').slick({
        slidesToShow: 6,
        swipeToSlide: true,
        asNavFor: '.item-image-list',
        centerMode: true,
        focusOnSelect: true,
        arrows: false
    }); 

}
