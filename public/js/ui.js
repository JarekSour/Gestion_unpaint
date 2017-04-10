var datetime = null,
time = null,
date = null;

var update = function () {
	moment.locale('es'); 
	date = moment(new Date())
	datetime.html(date.format('DD MMMM'));
	time.html(date.format('H:mm'));
};


$(window).on('load', function(){
    //Preloader
    setTimeout(function(){
    	$('.preloader-anim').removeClass("la-animate");
    }, 600);

    setTimeout(function(){
    	$('.preloader').fadeOut(500);
    	$('body').css('overflow-y', 'scroll');
    }, 800);
});

var originalText = $(".loading-anim").text(),
i  = 0;
setInterval(function() {

	$(".loading-anim").append(".");
	i++;

	if(i == 4)
	{
		$(".loading-anim").html(originalText);
		i = 0;
	}

}, 400);

function id(identifier) {
	return document.getElementById(identifier);
};

var wrap_content =      id('wrap-content'),
overlay =           id('overlay'),

wrap_menu =         id('wrap-menu'),
menu_btn_open =     id('menu-btn-open'),
menu_btn_close =    id('menu-btn-close'),
menu =              id('menu'),


backet =            id('backet'),
backet_btn =        id('backet-btn'),

message_btn =         id('message-btn'),
message_content =     id('message-content');

if($("#menu")[0]){
	var  menu_span =         menu.querySelectorAll('span'),
	menu_li =           menu.querySelectorAll('li'),
	menu_btn_back =     id('menu-btn-back');
}
var ui = {
	menu: {
		active: function() {
			wrap_content.classList.add('menu-active');
			wrap_menu.classList.add('active');
		},
		passive: function() {
			wrap_content.classList.remove('menu-active');
			wrap_menu.classList.remove('active');
		},
		sub: {
			active: function() {
//                wrap_content.classList.add('menu-active');
//                wrap_menu.classList.add('active');
},
passive: function() {
//                wrap_content.classList.remove('menu-active');
//                wrap_menu.classList.remove('active');
}
}
},
backet: {
	toggle: function() {
		backet.classList.toggle('active');
	},
	passive: function() {
		backet.classList.remove('active');
	}
},
message: {
	toggle: function() {
		message_btn.classList.toggle('active');
		message_content.classList.toggle('active');
		$(".message-content .unit span").toggleClass("animated bounceIn");
		$(".message-content .unit p").toggleClass("animated slideInRight");
		$("#message-content .unit-scroll").niceScroll({
			horizrailenabled: false,
			cursorwidth: "8px",
			cursorborderradius: 0,
			cursorcolor: "rgb(114, 102, 186)"
		});
	},
	passive: function() {
		message_btn.classList.remove('active');
		message_content.classList.remove('active');
		$("#user-content").removeClass("active");
		$("#message-content .unit-scroll").getNiceScroll().remove();
	}
},
overlay: {
	active: function() {
		overlay.classList.add('active');
	},
	passive: function() {
		overlay.classList.remove('active');
	}
}
};

$(document).ready(function() {

	if($('.unit.time')[0]) {
		datetime = $('.current-date');
		time = $('.current-time');

		update();
		setInterval(update, 1000);
	}


	$("#user-btn").click(function(){
		$("#user-content").toggleClass("active");
		message_content.classList.remove('active');
		message_btn.classList.remove('active');
	});

    //menu
    if($("#menu")[0]){
    	menu_btn_open.onclick = function(){
    		ui.menu.active();
    		ui.overlay.active();
    		$(".wrap-menu").getNiceScroll().resize();
    	};
    	menu_btn_close.onclick = function(){
    		ui.menu.passive();
    		ui.overlay.passive();
    	};
    }

    //alert(menu_span.toArray);
    for (var i=0; i<menu_span.length; i++) {
    	menu_span[i].addEventListener('click', function(){
    		menu.classList.add('sub-active');
    		this.parentNode.classList.add('active');
    		$(".wrap-menu").getNiceScroll().resize();
    	});
    };

    menu_btn_back.onclick = function() {
    	menu.classList.remove('sub-active');
    	for (var i=0; i<menu_li.length; i++) {
    		menu_li[i].classList.remove('active');
    	}
    	$(".wrap-menu").getNiceScroll().resize();
    };

    //message
    message_btn.onclick = function(){
    	ui.message.toggle();
    	if($("#backet")[0]){
    		ui.backet.passive();
    	}
    }


    $("#backet .btn-close").on('click', function () {
    	var thiss = $(this);
    	swal({
    		title: "Are you sure?",
    		type: "warning",
    		showCancelButton: true,
                //confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function(isConfirm) {
            	if (isConfirm) {
            		swal("Deleted!", "Your imaginary file has been deleted.", "success");
            		deleteProduct();
            	} else {
            		swal("Cancelled", "Your imaginary file is safe :)", "error");
            	}
            });
    	function deleteProduct() {
    		thiss.parent().remove();
    	}
    });

    $('[data-toggle="popover"]').popover();

    $(".close-block").click(function(){
    	var removedBlock = $(this).closest(".content-block").remove();
    	var removedPanel = $(this).closest(".panel").remove();
    });

    //Refresh button
    $('.refresh-btn').click(function(e){
    	var refreshBox = $(this).closest('div.content-block');
    	$("<div class='refresh-preloader'><div class='la-line-scale-pulse-out la-2x'><div></div><div></div><div></div><div></div><div></div></div></div>").appendTo(refreshBox).fadeIn(300);

    	setTimeout(function(){
    		var refreshPreloader = refreshBox.find('.refresh-preloader'),
    		deletedRefreshBox = refreshPreloader.fadeOut(300, function(){
    			refreshPreloader.remove();
    		});
    	},1500);

    	e.preventDefault();
    });

      //mapWidget
      function widgetUsed(id, number) {
      	$("#" + id).prop('Counter',0).animate({
      		Counter: number
      	}, {
      		duration: 2000,
      		step: function (now) {
      			$("#" + id + " div").text(Math.ceil(now) + "%");
      			$("#" + id + " span").css("width", +  Math.ceil(now)  + "%");
      		}
      	});
      };

      $(".refresh-progress").click(function(){
      	widgetUsed("scale1", 36);
      	widgetUsed("scale2", 24);
      	widgetUsed("scale3", 20);
      	widgetUsed("scale4", 20);
      });


    //overlay
    overlay.onclick = function(){
    	ui.overlay.passive();
    	ui.menu.passive();
    };

    $(".message-content .clear-all").click(function(){
    	$(".message-content .unit").addClass("animated fadeOutRight");
    	setTimeout(function(){
    		$(".check-ok").fadeIn(200);
    	}, 1000)
    });
    //btn follow

    $(".id-btn-follow").click(function() {
    	if ($(this).hasClass('checked')) {
    		$(this).removeClass('checked').addClass('unchecked').text('Unfollow');
    	} else if ($(this).hasClass('unchecked')) {
    		$(this).removeClass('unchecked').text('Follow');
    	} else {
    		$(this).addClass('checked').text('Followed');
    	}
    });

    //btn toggle
    $(".toggle").click(function(){
    	$(this).toggleClass("toggle-left, toggle-right");
    });

    //btn setting / btn popup
    $(".setting-btn").click(function(){
    	$(this).next(".setting-popup").toggleClass("active");
    });

    // col height

    if ($(document).width() >= 992) {
    	$('.row[data-height]').each(function (i, e) {
    		var h = 0;
    		var col = $(e).find('[data-height-col]');

    		setTimeout(function () {
    			$(col).each(function (ii, ee) {
    				if (h < $(ee).innerHeight()) {
    					h = $(ee).innerHeight();
    				}
    			});
    			$(col).each(function (i3, e3) {
    				$(e3).innerHeight(h);
    			});
    		}, 10);
    	});
    }
});

// input core
(function() {
    // trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
    if (!String.prototype.trim) {
    	(function() {
            // Make sure we trim BOM and NBSP
            var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
            String.prototype.trim = function() {
            	return this.replace(rtrim, '');
            };
        })();
    }

    [].slice.call( document.querySelectorAll( 'input.input__field' ) ).forEach( function( inputEl ) {
        // in case the input is already filled..
        if( inputEl.value.trim() !== '' ) {
        	classie.add( inputEl.parentNode, 'input--filled' );
        }

        // events:
        inputEl.addEventListener( 'focus', onInputFocus );
        inputEl.addEventListener( 'blur', onInputBlur );
    } );

    function onInputFocus( ev ) {
    	classie.add( ev.target.parentNode, 'input--filled' );
    }

    function onInputBlur( ev ) {
    	if( ev.target.value.trim() === '' ) {
    		classie.remove( ev.target.parentNode, 'input--filled' );
    	}
    }
})();










//side panel
$("#side-btn").click(function(){
	$("#sidepanel").addClass("active");
});


$('body').on('click', '#side-btn', function(e){
	e.preventDefault();

	$elem = '#sidepanel';
	$elem2 = '#side-btn';


      //When clicking outside
      if ($('#sidepanel').hasClass('active')) {
      	$(document).on('click', function (e) {
      		if (($(e.target).closest($elem).length === 0) && ($(e.target).closest($elem2).length === 0)) {
      			setTimeout(function(){
      				$('#sidepanel').removeClass('active');
      			});
      		}
      	});
      }
  });

  //Submenu
  $('body').on('click', '.sub-menu > a', function(e){
  	e.preventDefault();
  	$(this).next().slideToggle(200);
  	$(this).parent().toggleClass('toggled');
  });

  $(".power").click(function(e){
  	e.preventDefault();
  	$("#sidepanel").removeClass("active");
  });


//Input fields
if($('.fg-input')[0]) {
	$('body').on('focus', '.form-control', function(){
		$(this).closest('.fg-input').addClass('fg-active');
	})

	$('body').on('blur', '.form-control', function(){
		var p = $(this).closest('.form-group') && $(this).closest('.input-group');
		var i = p.find('.form-control').val();

		if (p.hasClass('fg-float')) {
			if (i.length == 0) {
				$(this).closest('.fg-input').removeClass('fg-active');
			}
		}
		else {
			$(this).closest('.fg-line').removeClass('fg-active');
		}
	});
}

if($('.fg-float')[0]) {
	$('.fg-float .form-control').each(function(){
		var i = $(this).val();

		if (!i.length == 0) {
			$(this).closest('.fg-input').addClass('fg-active');
		}

	});
}

// slider core
(function($){
	jQuery.fn.slider = function (config){
		config = $.extend({
            //active:1,
            //swipeSupport : false,
            // navigation: true,
            // array: false
        },config);

		var doSlider = function(){
			var $this = $(this);

		};
		return this.each(doSlider);
	}

})(jQuery);

if($(window).width() < 481){
	$("body").addClass("mobile-view");
}
else{
	$("body").removeClass("mobile-view");
}
$(window).resize(function(){
	if($(window).width() < 481){
		$("body").addClass("mobile-view");
	}
	else{
		$("body").removeClass("mobile-view");
	}
});


$(".morphsearch-content").css("height", $(document).height() + "px");

$(".toggle-fixed").click(function(){
	if($(this).hasClass("active")){
		$(this).removeClass("active");
		$("body").removeClass("fixed");
	}else{
		$(this).addClass("active");
		$("body").addClass("fixed");
	}
});

$(".wrap-menu").niceScroll({
	touchbehavior: true,
	preventmultitouchscrolling: false,
	cursoropacitymax: 0,
	zindex: -3
});


if($(window).width() >= 1900){
	$("body").addClass("sidepanel-vissible");
}
else{
	$("body").removeClass("sidepanel-vissible");
};



$(window).on("resize", function(){
	if($(window).width() >= 1900){
		$("body").addClass("sidepanel-vissible");
		if (localStorageSupport) {
			localStorage.setItem("fixNav",'on');
		}
	}
	else{
		$("body").removeClass("sidepanel-vissible");
		if (localStorageSupport) {
			localStorage.setItem("fixNav",'off');
		}
	};
});


$('[data-toggle="tooltip"]').tooltip();


if (localStorageSupport) {

	var fixNav = localStorage.getItem("fixNav");

	if (fixNav == 'on' && $(window).width() > 480) {
		$('body').addClass("fixed");
		$('.toggle-fixed').addClass("active");
	}

	if (fixNav == 'off') {
		$('body').removeClass("fixed");
		$('.toggle-fixed').removeClass("active");
	}
}

    // check if browser support HTML5 local storage
    function localStorageSupport() {
    	return (('localStorage' in window) && window['localStorage'] !== null)
    }


    if($("body").hasClass("fixed")){
    	$(".backet-title").empty();
    };

    if($(".news-item img")[0]){
    	objectFit.polyfill({
      selector: '.news-item img', // this can be any CSS selector
      fittype: 'cover', // either contain, cover, fill or none
      disableCrossDomain: 'true' // either 'true' or 'false' to not parse external CSS files.
  });
    }


    $(".chat-messages-widget").niceScroll({
    	cursoropacitymax: 0
    });



    $(".ticket-item").click(function(e){
    	e.preventDefault();
    	$(".ticket-list").addClass("hidden");
    	$(".ticket-container").removeClass("hid");
    	$("#tickets .chat-messages").getNiceScroll().resize();
    });

    $("[data-back]").click(function(e){
    	e.preventDefault();
    	$(".ticket-container").addClass("hid");
    	$(".ticket-list").removeClass("hidden");
    });

    $(".chat-item").click(function(e){
    	e.preventDefault();
    	$(".chat-contacts").addClass("hidden");
    	$(".chat-message-container").removeClass("hid");
    	$("#chat .chat-messages").getNiceScroll().resize();
    });

    $("[data-back-to-contacts]").click(function(e){
    	e.preventDefault();
    	$(".chat-message-container").addClass("hid");
    	$(".chat-contacts").removeClass("hidden");
    });

    $(".chat-item").on("mouseover", function(){
    	$(this).find(".contact-details").show();
    	$(".contact-details").not($(this).find(".contact-details")).hide();
    });

    $(".chat-item").on("mouseleave", function(){
    	$(this).find(".contact-details").hide();
    });

    if($(".selectpicker")[0]){
    	$('.selectpicker').selectpicker({
    		style: 'form-control material'
    	});
    }
