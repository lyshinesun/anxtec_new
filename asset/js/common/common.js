//获取本月天数
function getDays() {
//构造当前日期对象
    var date = new Date();

//获取年份
    var year = date.getFullYear();

//获取当前月份
    var mouth = date.getMonth() + 1;

//定义当月的天数；
    var days;

//当月份为二月时，根据闰年还是非闰年判断天数
    if (mouth == 2) {
        days = year % 4 == 0 ? 29 : 28;

    }
    else if (mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12) {
        //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
        days = 31;
    }
    else {
        //其他月份，天数为：30.
        days = 30;

    }
    return days;
}

//合计数组的值
function sumArrayData(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        if($.isNumeric(array[i])){
            sum += parseFloat(array[i]);
        }
    }
    return sum;
}

Array.prototype.max = function() {
    var max = $.isNumeric(this[0])?this[0]:0;
    var len = this.length;
    for (var i = 1; i < len; i++){
        var v = $.isNumeric(this[i])?this[i]:0;
        if (parseInt(v) > parseInt(max)) {
            max = this[i];
        }
    }
    return max;
}

function parseJson(data){
    var object = null;
    try{
        object = JSON.parse(data);
        if(!isNotNull(object)||object.result_code==-1){
            showErrorMsg("请求接口数据失败，请刷新重试");
        }
    } catch(e){
        //showErrorMsg();
        log("解析数据出错 data:"+data);
    }

    return object;
}

//检查数据是否返回值
function isNotNull(data){
    if(data == 0 || data == "0"){
        return false;
    }
    if(data==null||data==""||data=="null"||data==undefined||data=="undefined"){
        return false;
    }
    return true;
}

function checkGetValue(data){
    return isNotNull(data)?data:"";
}

function showErrorMsg(message){
    if(!isNotNull(message)){
        message = "数据请求失败，请重试!";
    }
    $("#failInfo").html(message);
    $("#failInfo").slideDown();
    setTimeout(function(){
        $("#failInfo").slideUp();
    },3000);
}

function showLoading(){
    if($("#loadding").length>0){
        $("#loadding").show();
    }
}

function hideLoading(){
    if($("#loadding").length>0){
        $("#loadding").hide();
    }
}

function toFix(num,n){
    if(num==0||num=="0"){
        return 0;
    }
    if(!isNotNull(num)){
        return "--";
    }
    if(!isNotNull(n)){
        n=2;
    }
    var strNum = num +"";
    var lang = getCookie("lang");
    if(lang=="de"){
        strNum = strNum.replace(".",",");
    }
    if($.isNumeric(num)){
        return parseFloat(parseFloat(num).toFixed(n));
    } else {
        return "--";
    }
}

function dealEchartLineArr(arr){
    if(arr && arr.length){
        for(var i = 0; i < arr.length; i ++){
            if("--" == arr[i] || "" == arr[i]){
                arr[i] = "";
            }
        }
    }
    return arr;
}

function dealEchartBarArr(arr){
    if(arr && arr.length){
        if(!$.isNumeric(arr[0])){
            arr[0] = "";//第一个值不能为"--",echart不能正常显示
        }
        for(var i = 1; i < arr.length; i ++){
            if(!$.isNumeric(arr[i])){
                arr[i] = "";
            }
        }
    }
    return arr;
}

function dealEchartToolTip(val){
    if("" == val || "-" == val){
        return "--"
    }
    return val;
}

//echart axis.axisTick
var axisTickObj = {
    show: true,
    lineStyle:{
        color: '#333'
    }
}

//计算完成率
function CalculatedCompletionRate(actVal, planVal){
    if($.isNumeric(actVal) && $.isNumeric(planVal) && planVal != 0){
        return parseFloat((actVal/planVal * 100).toFixed(2));
    }
    return "";
}

function sumOfArr(arr){
    var sum = 0;
    for(var i = 0; i < arr.length; i ++){
        if($.isNumeric(arr[i])){
            sum += parseFloat(arr[i]);
        }
    }
    return sum;
}

//累加：a[i] = a[i-1] + a[i]
function addUpArr(arr){
    var restArr = arr.slice(0);
    for(var i = 1; i < restArr.length; i ++){
        if($.isNumeric(restArr[i - 1]) && $.isNumeric(restArr[i])){
            restArr[i] = (parseFloat(restArr[i - 1]) +　parseFloat(restArr[i])).toFixed(2);
        }else if($.isNumeric(restArr[i - 1])){
            restArr[i] = parseFloat(restArr[i - 1]);
        }
    }
    return restArr;
}

/*
 获取地址栏参数
 */
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]); return null;
}

//东旭集团定制,特殊需求，临时更改，单位中文转英文 弹出iframe 调用
function replaceUnit_scrn4Dialog(unit){
    var orgId = $("#org_id").val()||$("#org_id",parent.document).val();
    if(orgId!="3040"){
        return unit;
    }
    if (unit=="万度"){
        unit = "万kWh";
    } else if (unit=="亿度"){
        unit = "亿kWh"
    } else if(unit=="度") {
        unit = "kWh";
    }
    return unit;
}

//特殊需求，临时更改，单位中文转英文
//function replaceUnit(unit){
//    alert(unit);
//    if(curtOrgId_refresh&&curtOrgId_refresh!="3040"){//东旭集团定制
//        return unit;
//    }
//    if (unit=="万度"){
//        unit = "万kWh";
//    } else if (unit=="亿度"){
//        unit = "亿kWh"
//    } else if(unit=="度") {
//        unit = "kWh";
//    }
//    return unit;
//}

function windDirectionTrans(val){
    if($.isNumeric(val)){
        if(val >= 348.76 || val < 11.26){
            return "北";
        }else if(val >= 11.26 && val < 33.76){
            return "东北偏北";
        }else if(val >= 33.76 && val < 56.26){
            return "东北";
        }else if(val >= 56.26 && val < 78.75){
            return "东北偏东";
        }else if(val >= 78.75 && val < 101.26){
            return "东";
        }else if(val >= 101.26 && val < 123.76){
            return "东南偏东";
        }else if(val >= 123.76 && val < 146.26){
            return "东南";
        }else if(val >= 146.26 && val < 168.76){
            return "东南偏南";
        }else if(val >= 168.76 && val < 191.26){
            return "南";
        }else if(val >= 191.26 && val < 213.76){
            return "西南偏南";
        }else if(val >= 213.76 && val < 236.26){
            return "西南";
        }else if(val >= 236.26 && val < 258.76){
            return "西南偏西";
        }else if(val >= 258.76 && val < 281.26){
            return "西";
        }else if(val >= 281.26 && val < 303.76){
            return "西北偏西";
        }else if(val >= 303.76 && val < 326.26){
            return "西北";
        }else if(val >= 326.26 && val < 348.76){
            return "西北偏北";
        }
    }
    return "";
}

function windLevelTrans(val){
    if($.isNumeric(val)){
        if(val < 0.3){
            return "无风";
        }else if(val >= 0.3 && val < 1.6){
            return "软风";
        }else if(val >= 1.6 && val < 3.4){
            return "轻风";
        }else if(val >= 3.4 && val < 5.5){
            return "微风";
        }else if(val >= 5.5 && val < 8.0){
            return "和风";
        }else if(val >= 8.0 && val < 10.8){
            return "清风";
        }else if(val >= 10.8 && val < 13.9){
            return "强风";
        }else if(val >= 13.9 && val < 17.2){
            return "疾风";
        }else if(val >= 17.2 && val < 20.8){
            return "大风";
        }else if(val >= 20.8 && val < 24.5){
            return "烈风";
        }else if(val >= 24.5 && val < 28.5){
            return "狂风";
        }else if(val >= 28.5 && val <= 32.6){
            return "暴风";
        }else if(val > 32.6){
            return "飓风";
        }
    }
    return "";
}

//根据当前时间修改 地球光照
function updateEarthTime(earth){
    var d1 = (new Date()).Format("yyyy-MM-dd hh:mm");
    if(earth){
        earth.setOption(
            {
                series:[{
                    light: {
                        time: d1,
                    }
                }]
            }
        );
    }
}

//补零
function dealDate(val) {
    var resVal = val >= 10 ? val : ("0" + val);
    return resVal;
}