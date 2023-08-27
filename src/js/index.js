var nft = new Swiper('.nft .swiper-container', {
    slidesPerView: 2,
    slidesPerColumn: 2,
    spaceBetween: 10,
    pagination: {
        el: '.nft .swiper-pagination',
        type: 'custom',
        renderCustom: function(swiper, current, total) {
            return `${current} / ${total}`;
        },
    },
});


var about = new Swiper('.about-slider .swiper-container', {
    slidesPerView: 1,
    pagination: {
        el: '.about-slider .swiper-pagination',
        type: 'custom',
        renderCustom: function(swiper, current, total) {
            return `${current} / ${total}`;
        },
    },
    navigation: {
        nextEl: '.about-slider .next',
        prevEl: '.about-slider .prev',
    },
});