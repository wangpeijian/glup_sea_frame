/**
 * Created by peijian.wang on 2016/7/20.
 */
define(function(require, exports, module){
    $(function(){

        /**
         * 全局变量
         */
        var GLOBAL = {
            //是否开启页面循环滚动
            slideRepeat : false,
            //y轴开始移动的位置
            position_y_s : 0,
            //y轴移动后的位置
            position_y_e : 0,
            //当前展示出来的页面页码
            page : 1,
            //单页向上方滑动的动画时间
            time : 0.5,
            //总页面数量
            no : 5,
            //标记页面是上划操作还是下滑操作
            slideUP : true,
            //画出时间轴的时间
            lineTime : 1000,
            //触摸滚动开关
            sliderClock : true,
            //上锁时间
            sliderClockTime : 2000,

            /*以上是滚屏效果的变量*/

            //定义屏幕高宽
            window_width : document.body.clientWidth,
            window_height : $("#page-1").height(),
        }

        /**
         * 全局方法
         */
        var METHOD = {

            /*绑定页面切换方法*/
            bindTouch : function(){

                $(".page-item, .page-up-btn").bind('touchstart','.current-item',function(e){
                    var _touch = e.originalEvent.targetTouches[0];
                    GLOBAL.position_y_s= _touch.pageY;
                    GLOBAL.position_y_e = _touch.pageY;
                    e.preventDefault();
                    return false;
                });

                $(".page-item, .page-up-btn").bind('touchmove','.current-item',function(e){
                    var _touch = e.originalEvent.targetTouches[0];
                    GLOBAL.position_y_e = _touch.pageY;
                    e.preventDefault();
                    return false;
                });

                $(".page-item, .page-up-btn").bind('touchend','.current-item',function(e){

                    if(GLOBAL.sliderClock){
                        GLOBAL.sliderClock = false;
                        setTimeout(function(){
                            GLOBAL.sliderClock = true;
                        }, GLOBAL.sliderClockTime);
                    }else{
                        return;
                    }

                    if(GLOBAL.position_y_s - GLOBAL.position_y_e >= 100){

                        //如果是最后一页，向上滚动时要判断是否允许重复滚动
                        if(GLOBAL.page == GLOBAL.no && !GLOBAL.slideRepeat){
                            return false;
                        }

                        //向上滑动
                        //console.log("向上滑动");
                        GLOBAL.slideUP = true;

                        var page = $("#page-" + GLOBAL.page);
                        //滑动一定距离，切换页面
                        page.css("top", "-100%");


                    }else if(GLOBAL.position_y_s - GLOBAL.position_y_e <= -100){

                        //如果是第一页，向下滚动时要判断是否允许重复滚动
                        if(GLOBAL.page == 1 && !GLOBAL.slideRepeat){
                            return false;
                        }

                        //向下滑动
                        //console.log("向下滑动");
                        GLOBAL.slideUP = false;

                        var page = $("#page-" + (GLOBAL.page - 1));
                        //滑动一定距离，切换页面

                        page.css({
                            "transition": "initial",
                            "top": "-100%",
                            "z-index" : Number(page.css("z-index")) + GLOBAL.no,
                        });

                        setTimeout(function(){
                            page.css({
                                "transition": GLOBAL.time +"s",
                                "top": "0%",
                            });
                        },100);

                    }

                }.bind(this));

                return METHOD;
            },

            //为页面添加监听，页面滚动效果结束后执行操作
            bindAnimationEnd : function(){
                $(".page-item").on("webkitTransitionEnd otransitionend transitionend", function(e){

                    //判断是否是翻页触发的动画效果
                    if(!$(e.target).hasClass("page-item")){
                        return;
                    }


                    //执行切换动画的页码
                    var prevNo = GLOBAL.page;
                    //var page = null;
                    //执行完动画的页面移除页面动画效果，并将层级置为最底层
                    if(GLOBAL.slideUP){
                        var page = $("#page-" + GLOBAL.page);
                        page.css({
                            "transition": "initial",
                            "top": "0%",
                            "z-index" : Number(page.css("z-index")) - GLOBAL.no,
                        });

                        //页面重置位置后，为页面添加动画效果
                        setTimeout(function(){
                            page.css({
                                "transition": GLOBAL.time +"s",
                            });
                        }, 100);

                        //执行完动画后给页码加1
                        GLOBAL.page++
                        if(GLOBAL.page > GLOBAL.no){
                            //若开启循环，则页码=1， 关闭循环页码等于最后一页
                            if(GLOBAL.slideRepeat){
                                GLOBAL.page = 1;
                            }else{
                                GLOBAL.page = GLOBAL.no;
                            }
                        }

                    }else{

                        //执行完动画后给页码加1
                        GLOBAL.page--
                        if(GLOBAL.page < 1){
                            //若开启循环，则页码等于最后一页， 关闭循环页码=1
                            if(GLOBAL.slideRepeat){
                                GLOBAL.page = GLOBAL.no;
                            }else{
                                GLOBAL.page = 1;
                            }
                        }

                    }

                    //禁止循环滚动时
                    if(!GLOBAL.slideRepeat){
                        //滚动到最后一个页面要隐藏向上的箭头
                        if( GLOBAL.page == GLOBAL.no ){
                            $(".page-up-btn").hide();
                        }else{
                            $(".page-up-btn").show();
                        }
                    }

                    console.log("滚动完成当前页码:",GLOBAL.page, "上一个页面是：",prevNo);
                    //翻页动画执行后，将prevNo元素复位
                    METHOD._initPage(prevNo);
                    METHOD._animationBegin(GLOBAL.page);
                    METHOD._drawLine(GLOBAL.page);
                });

                return METHOD;
            },

            //画出页面上的时间轴折线
            _drawLine : function(page){

                /*---------------开始画第一页的折线------------------*/
                if(page == 2){
                    var canvas1 = $("#canvas-1");
                    canvas1.attr("height", GLOBAL.window_height);
                    canvas1.attr("width", GLOBAL.window_width);
                    var pen_1 = canvas1[0].getContext("2d");

                    pen_1.clearRect(0,0,GLOBAL.window_width,GLOBAL.window_height);
                    pen_1.beginPath();

                    pen_1.moveTo(GLOBAL.window_width * 0.15 , GLOBAL.window_height * 0.2);
                    setTimeout(function(){
                        pen_1.lineTo(GLOBAL.window_width * 0.6 , GLOBAL.window_height * 0.3);
                        pen_1.stroke();
                    }, GLOBAL.lineTime * 0.3)

                    setTimeout(function(){
                        pen_1.lineTo(GLOBAL.window_width * 0.4 , GLOBAL.window_height * 0.7);
                        pen_1.stroke();
                    }, GLOBAL.lineTime * 0.7)

                    setTimeout(function(){
                        pen_1.lineTo(GLOBAL.window_width * 0.55 , GLOBAL.window_height * 1);
                        pen_1.stroke();
                    }, GLOBAL.lineTime * 1)
                    pen_1.strokeStyle="#cccccc";
                }

                /*---------------开始画第二页的折线------------------*/
                if(page == 3){
                    var canvas2 = $("#canvas-2");
                    canvas2.attr("height", GLOBAL.window_height);
                    canvas2.attr("width", GLOBAL.window_width);
                    var pen_2 = canvas2[0].getContext("2d");

                    pen_2.clearRect(0,0,GLOBAL.window_width,GLOBAL.window_height);
                    pen_2.beginPath();

                    pen_2.moveTo(GLOBAL.window_width * 0.55 , 0);
                    setTimeout(function(){
                        pen_2.lineTo(GLOBAL.window_width * 0.6 , GLOBAL.window_height * 0.1);
                        pen_2.stroke();
                    }, GLOBAL.lineTime * 0.1)

                    setTimeout(function(){
                        pen_2.lineTo(GLOBAL.window_width * 0.4 , GLOBAL.window_height * 0.4);
                        pen_2.stroke();
                    }, GLOBAL.lineTime * 0.4)

                    setTimeout(function(){
                        pen_2.lineTo(GLOBAL.window_width * 0.65 , GLOBAL.window_height * 0.7);
                        pen_2.stroke();
                    }, GLOBAL.lineTime * 0.7)

                    setTimeout(function(){
                        pen_2.lineTo(GLOBAL.window_width * 0.25 , GLOBAL.window_height * 1);
                        pen_2.stroke();
                    }, GLOBAL.lineTime * 1)
                    pen_2.strokeStyle="#cccccc";
                }


                /*---------------开始画第三页的折线------------------*/
                if(page == 4){
                    var canvas3 = $("#canvas-3");
                    canvas3.attr("height", GLOBAL.window_height);
                    canvas3.attr("width", GLOBAL.window_width);
                    var pen_3 = canvas3[0].getContext("2d");

                    pen_3.clearRect(0,0,GLOBAL.window_width,GLOBAL.window_height);
                    pen_3.beginPath();

                    pen_3.moveTo(GLOBAL.window_width * 0.4 , 0);
                    setTimeout(function(){
                        pen_3.lineTo(GLOBAL.window_width * 0.2 , GLOBAL.window_height * 0.2);
                        pen_3.stroke();
                    }, GLOBAL.lineTime * 0.2)

                    setTimeout(function(){
                        pen_3.lineTo(GLOBAL.window_width * 0.5 , GLOBAL.window_height * 0.3);
                        pen_3.stroke();
                    }, GLOBAL.lineTime * 0.3)

                    setTimeout(function(){
                        pen_3.lineTo(GLOBAL.window_width * 0.65 , GLOBAL.window_height * 0.6);
                        pen_3.stroke();
                    }, GLOBAL.lineTime * 0.6)
                    pen_3.strokeStyle="#cccccc";
                }

            },

            //页面初始化，元素归位
            _initPage : function(page){

                $("#page-" + page).removeClass("active");

            },

            //页面展现后动画开始
            _animationBegin : function(page){

                $("#page-" + page).addClass("active");

            },

        }

        METHOD.bindTouch().bindAnimationEnd();

        METHOD._animationBegin(1);

    })
});