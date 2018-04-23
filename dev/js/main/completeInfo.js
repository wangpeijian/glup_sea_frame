/**
 * Created by peijian.wang on 2016/7/26.
 */
define(function(require, exports, module){

    module.exports = function (helper, config) {

        var GLOBAL = {
            countDownTime : 60,
            needPhone : false,
        }

        var METHOD = {
            initPage : function(){

                METHOD._getUserInfo(helper.getQuery("uid"),function(info){
                    console.log(info)
                    $("#userHead").attr("src", info.imgurl);
                    $("#userName").html(info.name);

                    if(!info.phone){
                        $(".phone-form").show();
                        GLOBAL.needPhone = true
                    }

                    if(info.gender == 0){
                        $(".woman-btn").click();
                    }else if(info.gender == 1){
                        $(".man-btn").click();
                    }

                    if(!!info.birthday){
                        var day = info.birthday+"";
                        $("#birthday").val(day.substr(0,4) + "-" + day.substr(4,2) + "-" + day.substr(6,2));
                    }

                    if(!!info.entry){
                        var day = info.entry+"";
                        $("#entryTime").val(day.substr(0,4) + "-" + day.substr(4,2) + "-" + day.substr(6,2));
                    }

                });

                //METHOD._bindTrigger();

                return METHOD;
            },

            bindMethod : function(){

                //手机号输入正确，才可以点击获取验证码按钮
                $("#phone").on("input", function (){

                    var phone = $(this).val();
                    var codeBtn = $("#codeBtn");
                    var reg = /^1[0-9]{10}$/;

                    if(reg.test(phone)){
                        codeBtn.addClass("active");
                    }else {
                        codeBtn.removeClass("active");
                    }

                });

                //发送短信验证码
                $("#codeBtn").click(function () {
                    var phone = $("#phone").val();
                    var codeBtn = $("#codeBtn");

                    //手机号正确，并且还没有点击
                    if(codeBtn.hasClass("active") && !codeBtn.hasClass("unable")){
                        var req = {
                            serial : phone,
                        }

                        $.ajax({
                            url: config.getUrl("sendsms"),
                            method: 'post',
                            type: 'json',
                            data: JSON.stringify(req),
                            success: function (res) {
                                res = JSON.parse(res);

                                if(res.errcode == 0){
                                    codeBtn.addClass("unable");
                                    METHOD._countDown();
                                }

                            }
                        });
                    }

                 });
                
                //提示框确定按钮
                $("#okBtn").click(function () {

                    $("#coverBg").hide();

                });

                //提交按钮
                $("#submitBtn").click(function(){

                    //判断是否所有信息都输入了
                    var sex = $("#sexMan").prop("checked") ? 1 : 0;

                    var birthday = $("#birthday").val().replace(/-/g,"/").replace("年","/").replace("月","/").replace("日","");
                    var entryTime = $("#entryTime").val().replace(/-/g,"/").replace("年","/").replace("月","/").replace("日","");
                    birthday = new Date(birthday).Format('yyyyMMdd');
                    entryTime = new Date(entryTime).Format('yyyyMMdd');

                    var phone = $("#phone").val();
                    var code = $("#code").val();

                    //同步验证手机验证码是否正确
                    if(GLOBAL.needPhone){

                        if(!birthday || !entryTime || !code || !phone){
                            METHOD._showTip("请填写完整信息");
                            return;
                        }

                        METHOD._verifyPhone({
                            serial : phone,
                            vcode : code,
                        }, function(){
                            METHOD._submitForm({
                                "uid": helper.getQuery("uid"),
                                "gender": sex, // 性别，0女1男
                                "phone": phone, // 手机号码
                                "birthday":birthday, // 生日，格式为yyyymmdd
                                "entry": entryTime, // 入职时间，格式为yyyymmdd
                            })
                        })
                    }else{

                        if(!birthday || !entryTime){
                            METHOD._showTip("请填写完整信息");
                            return;
                        }

                        METHOD._submitForm({
                            "uid": helper.getQuery("uid"),
                            "gender": sex, // 性别，0女1男
                            "birthday":birthday, // 生日，格式为yyyymmdd
                            "entry": entryTime, // 入职时间，格式为yyyymmdd
                        })
                    }


                });
                return METHOD;
            },

            //获取短信验证码的倒计时
            _countDown : function(){
                var codeBtn = $("#codeBtn");
                var time = GLOBAL.countDownTime;

                //每秒变化一次数字
                var timer = setInterval(function(){
                    if(time != 0){
                        codeBtn.html(time-- + "秒后重发");
                    }else{
                        //倒计时结束恢复按钮状态
                        codeBtn.removeClass("unable");
                        codeBtn.html("发送验证码");
                        window.clearInterval(timer);
                    }

                }, 1000);
                codeBtn.html(time-- + "秒后重发");

            },

            //展示提示框
            _showTip : function(msg){
                $("#errTip").html(msg);
                $("#coverBg").show();
            },

            //获取用户信息
            _getUserInfo : function(uid, cb){

                console.log(uid)

                /*根据uid查询用户信息*/
                var req = {
                    uid : uid,
                }

                $.ajax({
                    url: config.getUrl("qryusrinfo"),
                    method: 'post',
                    type: 'json',
                    async: 'false',
                    data: JSON.stringify(req),
                    success: function (res) {
                        res = JSON.parse(res);
                        if(res.errcode == 0){
                            cb(res.data);
                        }
                    }
                });
            },

            //验证手机号
            _verifyPhone : function(req ,cb){
                $.ajax({
                    url: config.getUrl("validsms"),
                    method: 'post',
                    type: 'json',
                    data: JSON.stringify(req),
                    success: function (res) {
                        res = JSON.parse(res);
                        if(res.errcode == 0){
                            cb();
                        }else{
                            msg = "手机验证码错";
                            METHOD._showTip(msg);
                        }
                    }
                });
            },

            //提交表单
            _submitForm : function(req){

                $.ajax({
                    url: config.getUrl("setprofile"),
                    method: 'post',
                    type: 'json',
                    async: 'false',
                    data: JSON.stringify(req),
                    success: function (res) {
                        res = JSON.parse(res);
                        console.log(res)

                        if(res.errcode == 0){
                            //成功后页面变成成功样式
                            $(".bg").hide();
                            $(".hide-input").hide();
                            $(".success-page").show();
                        }else{
                            METHOD._showTip("信息补全失败");
                        }
                    }
                });
            },

            //绑定需要触发的特殊效果
            _bindTrigger : function(){
                $("#birthday").click(function(){
                    $("#forBirthday").trigger("click");
                });

                $("#forBirthday").change(function(){
                    $("#birthday").val($(this).val());
                });

                $("#entryTime").click(function(){
                    $("#forEntryTime").trigger("click");
                });

                $("#forEntryTime").change(function(){
                    $("#entryTime").val($(this).val());
                });
            },
        }


        METHOD.bindMethod().initPage();
    }

});