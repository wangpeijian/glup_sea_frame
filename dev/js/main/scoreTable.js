/**
 * Created by peijian.wang on 2016/7/21.
 */

define(function (require, exports, module) {

    module.exports = function (helper, config) {

        /**
         * 全局变量
         */
        var GLOBAL = {
            creditMap : {
                10001 : "看培训/橱窗",
                10003 : "完成一次考试",
                20004 : "每次考试满分",
                10004 : "完成一次计划",
                10005 : "问答提问一次",
                20007 : "账号登陆时长",
                10006 : "发同事圈消息",
                30003 : "评论同事圈内容",
                30004 : "赞同事圈内容",
                30001 : "向外分享内容",
                30007 : "问答回答",
                30008 : "问答回答被赞",
                20005 : "所发问答被置顶",
                30002 : "在内部分享内容",
                30005 : "同事圈被评论",
                30006 : "同事圈被赞",
                20001 : "同事圈上热门榜第一名",
                20002 : "同事圈上热门榜第二名",
                20003 : "同事圈上热门榜第三名",
                30012 : "同事圈回复被回复",
                30011 : "问答提问被问答",
                30009 : "培训评论",
                30010 : "培训评分",
                10002 : "查看通知",
                10007 : "签到成功",
                10008 : "完成调研",
                20006 : "每日登陆",
                10009 : "网盘上传文件",
                40001 : "填写个性签名",
                40002 : "填写入职时间",
                40003 : "填写手机号",
                40004 : "填写性别",
                40005 : "填写生日",
                20008 : "分享积分兑换记录",
                20009 : "开启第1个任务宝箱",
                20010 : "开启第2个任务宝箱",
                20011 : "开启第3个任务宝箱",
                20012 : "开启第4个任务宝箱",
                20013 : "开启第5个任务宝箱",

            }
        }

        /**
         * 全局方法
         */
        var METHOD = {

            getData: function () {

                var req = {
                    uid: helper.getQuery("uid"),
                };

                $.ajax({
                    url: config.getUrl("getCreditCfg"),
                    method: 'post',
                    type: 'json',
                    data: JSON.stringify(req),
                    success: function (res) {
                        res = JSON.parse(res);

                        if(res.errcode == 0){
                            var source = $("#table-template").html();
                            //预编译模板
                            var template = Handlebars.compile(source);
                            //模拟json数据
                            var array = METHOD._formatData(res.data);
                            //匹配json内容
                            var html = template(array);
                            //输入模板
                            $("#table_body").html(html);
                        }

                    }
                });
            },

            //生成模版数据
            _formatData: function(data){

                var array = [];
                $(data).each(function(index,item){
                    if(item.status){

                        switch (item.key) {
                            case 40001:
                            case 40002:
                            case 40003:
                            case 40004:
                            case 40005:
                                item.time = "一次性";
                                break;
                            default:
                                item.time = item.cnt;
                                break;
                        }

                        item.name = GLOBAL.creditMap[item.key];
                        item.unit = item.score;
                        item.max = item.cnt * item.score;

                        array.push(item);
                    }


                })
                return array;
            },

        }

        METHOD.getData();

    }
});