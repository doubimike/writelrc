;
var uitl = (function (uitl) {
    var util = uitl || {};
    uitl.errorHandler = function (res) {
        alert('失败，请重试。具体信息：' + JSON.stringify(res));
    };



    return uitl;

})(uitl || {});

console.log(uitl);
