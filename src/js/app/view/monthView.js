/*
**	月视图 liumingren 2015.6.1
*/
define(['zepto','util','monthInfo'],function($,_util,_mi) {

	return {
		template:$(".month-temp").html(),
		dom:$(".calendar_panel"),
		listdom:$(".calendar_grid_list"),
		monthdomWidth: $(".calendar_grid_list").width(),
		init:function() {
			var date = new Date();
			//this.renderMonth(date);
			this.initUI();
			this.bindEvent();
			amplify.publish("ev:changeMonth",date);
		},
		initUI: function () {
			var width = this.listdom.width(),
				height = this.listdom.height();

			this.dom.addClass('calePanl-wp')
				.width(width*3);
			this.listdom.addClass('calePanl-page calePanl-dir-h')
				.width(width);

			this.dom.css({'-webkit-transform':'translateX' + '(' + -width + 'px)','transform':'translateX' + '(' + -width + 'px)'});
		},
		renderMonth:function (date) {
			var cldPanel = $(".js-cld-panel");
			var rowsHtml = this.getMonthHtml(date),
				dataMonth = date.getFullYear()+"/"+(date.getMonth()+1);

			cldPanel.attr("data-month",dataMonth);
			cldPanel.find("li").remove();
			cldPanel.append(rowsHtml);
			this.dom.css({'-webkit-transform':'translateX' + '(' + -this.monthdomWidth + 'px)','transform':'translateX' + '(' + -this.monthdomWidth + 'px)'});
			amplify.publish("load:renderMonthOther",date)
		},
		renderMonthOther: function (date) {
			var datePrev = new Date(),
				dateNext = new Date(),
				rowsHtmlPrev,rowsHtmlNext;
			datePrev.setFullYear(date.getFullYear());
			dateNext.setYear(date.getFullYear());
			datePrev.setMonth(date.getMonth()-1);
			dateNext.setMonth(date.getMonth()+1);

			rowsHtmlPrev = this.getMonthHtml(datePrev);
			rowsHtmlNext = this.getMonthHtml(dateNext);

			$(".js-cld-panel_prev,.js-cld-panel_next").find("li").remove();
			$(".js-cld-panel_prev").append(rowsHtmlPrev)
				.siblings(".js-cld-panel_next").append(rowsHtmlNext);
		},
		getMonthHtml: function (date) {
			//创建新的时间
			var cld = new _mi.Calendar(date),
				startDate = cld.getCalendarSundayFirstDate(),//得到当前视图第一天
				dateInfoAry = _mi.getMonthViewDateInfo(startDate,date.getMonth()),
				monthTemp = $("#month-temp").text();// 获得模板

			//根据模板生成日期列表
			return _util.format(monthTemp, dateInfoAry);
		},
		moveTo: function(next, anim) {

			var self = this,
				domList0 = this.listdom.eq(0),
				domList1 = this.listdom.eq(1),
				domList2 = this.listdom.eq(2),
				moveWidth = -next * $(".js-cld-panel").width(),
				month;

			//是否过渡动画
			if (anim) {
				this.dom.addClass('anim');
			} else {
				this.dom.removeClass('anim');
			}
			//解除绑定事件
			this.dom.off('webkitAnimationEnd webkitTransitionEnd');
			//move(dom, -next * that.width );
			this.dom.css({'-webkit-transform':'translateX' + '(' + moveWidth + 'px)','transform':'translateX' + '(' + moveWidth + 'px)'});

			//更新月份列表
			if( next == 0 ) {
				var date = new Date(domList1.find("li").eq(7).attr("data-date"));
				date.setMonth(date.getMonth()-1);

			}else if( next == 2 ) {
				var date = new Date(domList1.find("li").eq(7).attr("data-date"));
				date.setMonth(date.getMonth()+1);
			}else {
				return false;
			}
			this.dom.on('webkitAnimationEnd webkitTransitionEnd',function(e) {
				self.dom.removeClass('anim');
				amplify.publish("ev:changeMonth",date);
			});
		},
		bindEvent: function () {
			var self = this;

			//切换年
			amplify.subscribe("ev:changeYear", function (date) {

				self.renderMonth(date);
			});

			//切换月
			amplify.subscribe("ev:changeMonth", function (date) {

				var y = date.getFullYear();

				//切换到本年
				if( y != $("#s_year").val()) {
					amplify.publish("ev:changeYear", date);
				}

				self.renderMonth(date);
			});
			//切换日
			amplify.subscribe("ev:changeDate", function (d) {
				var y = d.getFullYear(),
					m = d.getMonth()+1;

				//切换到本年
				if( y != $("#s_year").val()) {
					amplify.publish("ev:changeYear", d);
				}

				//切换到本月
				if(m != $("#s_month").val()){
					amplify.publish("ev:changeMonth",d);
				}

				//当前选中项样式
				var dateStr = [y, m, d.getDate()].join('\/').replace(/(\D)(\d)(?=\D|$)/g, '$10$2');
				$(".js-cld-panel li").each(function (i,_) {
					var $_ = $(_);
					$_.removeClass("ondate");
					if($_.attr("data-date") == dateStr) {
						$_.addClass("ondate");
					}
				})

			});

			//加载完其他之后加载上月下月
			amplify.subscribe("load:renderMonthOther", function (date) {
				self.renderMonthOther(date);
			});

			//为每日绑定点击事件
			$(document).on("click", ".calendar_grid_list > li" , function (e) {
				var d =$(this).attr("data-date"),
					date = new Date(d);
				amplify.publish("ev:changeDate",date);
			});

			//绑定滑动事件
			$(document).on('touchstart', ".calendar_panel ul" , function(e) {

				self.startX = e.targetTouches[0].pageX;
				self.startY = e.targetTouches[0].pageY;
			});
			$(document).on('touchend', ".calendar_panel ul" , function(e) {

				var sub = e.changedTouches[0].pageX - self.startX;
				var der = (sub > 30 || sub < -30) ? sub > 0 ? -1 : 1 : 0;
				self.moveTo($(this).index()+der, true);
			});

		}
	};
});
