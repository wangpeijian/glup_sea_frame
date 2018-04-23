/**
 * Created by peijian.wang on 2016/7/21.
 */

define(function(require, exports, module){

    module.exports = {
        mx_admin : "http://mworking.cn/badouadmin/",
        mx : "http://mworking.cn/badou/",

        sys : "webapp",
        ver : "2.1.0",

        getUrl : function(action){
            return this.mx + action + "?sys=" + this.sys + "&ver=" + this.ver;
        }
    }

});