/**
 * Created by peijian.wang on 2016/7/27.
 */
define(function(require, exports, module){

    module.exports = function (helper, config) {

        var GLOBAL = {
            countDownTime : 60,
        }

        var METHOD = {
            initPage : function(){

                METHOD._getUserInfo(helper.getQuery("uid"),function(info){
                    console.log(info)
                    $("#userHead").attr("src", info.imgurl);
                    $("#userName").html(info.name);

                    var day = info.birthday + "";
                    $("#birthday").html(day.substr(0,4) + "年" + day.substr(4,2) + "月" + day.substr(6,2) + "日");
                });

                //METHOD._bindTrigger();

                return METHOD;
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

        }


        METHOD.initPage();
    }

});