new Vue({
    el: '#dia_bot',
    data: {
        stationId:'',
        fdDevCode:'',
        resList:[],
        msg: 'msg',
        robotDtu: 0,
        port:0,
        addr:0,
        fdDevName: '', //环监名字
        fdCityName: '', //城市名字

        //环监详情
        dust:0, //灰尘量
        temperature:0,//环境温度
        rainfall:0,//降雨量
        illumination:0,//光照度
        rbtStatus: '',
        fdDevAddr: 0, //获取机器人信息使用
        humidity: 0, // 湿度


        //机器人详情
        runningState:'暂无数据',//运行状态
        batteryCapacity: '无',//电池余量
        cleanCount: '无',//清扫次数
        equipmentAlarm: '无',//告警状态
        sweepTime: '无',//清扫时长
        exChargingTimes: '无',//充放电次数
        //定时器句柄
        timerH: null,
        timerS: null

    },
    methods: {
        //定时刷新机器人详情
        refreshRbtInfo: function (timer) {
            var _this = this
            _this.timerH = setInterval (function () {
                _this.getRotInfo()
            }, timer)
        },
        //定时刷新机器人状态
        refreshRbtState: function (timer) {
            var _this = this
            _this.timerS = setInterval (function () {
                _this.getRbtState()
            }, timer)
        },
        //获取机器人运行状态
        getRbtState: function () {
            var _this = this
             $.ajax({
                url: vlm.serverAddr+"stationInfo/getRobotStatu", //请求地址
                dataType: "json",
                type : "GET",
                data:{
                    "dtuID": _this.addr.toString(),
                    "psid": _this.stationId,
                    "robotID": _this.fdDevAddr.toString()
                },
                success:function(res){
                    var data = res
                    if (data.code == 0) {
                        switch (data.statu) {
                            case '0':
                            _this.runningState = '暂停中'
                            break;
                            case '1':
                            _this.runningState = '正向运行中'
                            break;
                            case '2':
                            _this.runningState = '反向运行中'
                            break;
                        }
                    }
                }
            });
        },
        /*获取url中的查询字符串的值*/
        getSearchString: function (key) {
          var str = location.search
          str = str.substring(1,str.length)
          var arr = str.split("&")
          var obj = new Object()
          for(var i = 0; i < arr.length; i++) {
            var tmp_arr = arr[i].split("=")
            obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1])
          }
            return obj[key]
        },
        getParames: function () {
            this.port = Number(this.getSearchString('port')) //端口号
            this.addr = Number(this.getSearchString('rbtDtu')) //环监id、DTU
            this.stationId = this.getSearchString('stationId') //电站id
            this.fdDevCode = this.getSearchString('fdDevCode') //电站厂房系统
            this.fdDevName = this.getSearchString('fdDevName')
            this.fdCityName = this.getSearchString('fdCityName')
        },
        /*获取当前城市的温度*/
        getCurrTemp: function (cityName) {
            console.log(this.fdCityName)
            console.log(cityName)
            var _this = this,
            url = 'http://api.map.baidu.com/telematics/v3/weather?location=' + cityName + '&output=json&ak=0h08YBBvVkr746zjlN9k0ftG94oMjEgM';
            $.ajax({
                url: url,
                type: 'GET',
                asyn: false,
                data: '',
                dataType: 'jsonp',
                success: function (res) {
                    if (res.status == 'success') {
                        var weatherArr = res.results[0].weather_data,
                        todayWthObj = weatherArr[0];//今天
                        _this.wertherName = todayWthObj.weather;
                        var tempArr = todayWthObj.temperature.split('~');
                        tempArr[0] = vlm.Utils.trim(tempArr[0]);
                        tempArr[1] = vlm.Utils.trim(tempArr[1]);
                        _this.temperature = weatherArr[0].date.match(/(\-?)\d*℃/ig)[0]
                    }
                },
                error: function (res) {
                    alert(res.message);
                }
            });
        },
        //获取厂房信息
        getDevrelation:function () {
            var _this = this;
            $.ajax({
                url:vlm.serverAddr+'devrelation/query',
                type:'get',
                dataType:'json',
                traditional: true,
                data:{
                    id: _this.fdDevCode, //厂房列表传电站id 查机器人列表传fdDevCode
                    type:"1"   //1 查两层 不是1只查一层
                },
                success:function(res){
                    if(res.code ==0){
                        _this.resList=res.page
                        if ( _this.resList[0]) {
                            _this.fdDevAddr = _this.resList[0].fdDevAddr
                            $('#preloader').hide();
                            setTimeout(function(){
                                $('.bot_imte_head').off().click(function () {
                                    // $(this).find('.right_arr').toggleClass('down')
                                    // $(this).parents('.bot_item').find('.bot_imte_cont').stop().slideToggle()
                                    /*if ($(this).find('.right_arr').hasClass('down')) {
                                         $(this).find('.right_arr').removeClass('down')
                                         $(this).parents('.bot_item').find('.bot_imte_cont').stop().slideToggle();
                                    } else {
                                        $(this).find('.right_arr').addClass('down')
                                        _this.getRotInfo()
                                        $(this).parents('.bot_item').find('.bot_imte_cont').stop().slideToggle();
                                    }*/
                                });
                            },1000);
                        } else {
                            $('#preloader').hide();
                            _this.batteryCapacity = '无'
                            _this.cleanCount = '无'
                            _this.equipmentAlarm = '无'
                            _this.sweepTime = '无'
                            _this.exChargingTimes = '无'
                            $('.bot_item').css('display', 'none')
                        }
                        /*_this.fdDevAddr = _this.resList[0].fdDevAddr
                        $('#preloader').hide();
                        setTimeout(function(){
                            $('.bot_imte_head').off().click(function () {
                                // $(this).find('.right_arr').toggleClass('down')
                                // $(this).parents('.bot_item').find('.bot_imte_cont').stop().slideToggle()
                                if ($(this).find('.right_arr').hasClass('down')) {
                                     $(this).find('.right_arr').removeClass('down')
                                     $(this).parents('.bot_item').find('.bot_imte_cont').stop().slideToggle();
                                } else {
                                    $(this).find('.right_arr').addClass('down')
                                    _this.getRotInfo()
                                    $(this).parents('.bot_item').find('.bot_imte_cont').stop().slideToggle();
                                }
                            });
                        },1000);*/
                    }
                },
                error:function(){},
            });
        },

        drawHumidity: function (pr) {
            option = {
                color: ['#5ce9fc', '#010810'],
                series: [
                    {
                        hoverAnimation: false,
                        type: 'pie',
                        radius: ['73%', '90%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            }
                        },
                        data: [
                            {
                                value: pr,
                                itemStyle: {
                                    normal: {
                                        color: "#5ce9fc"
                                    }
                                }
                            },
                            {
                                value: 100 - pr,
                                itemStyle: {
                                    normal: {
                                        color: "#010810"
                                    }
                                }
                            }
                        ],
                        clockWise: false  //是否顺时针
                    }
                ]
            };

            var prChart = echarts.init(document.getElementById('humidity'));
            prChart.setOption(option);

            $(window).resize(function () {
                prChart.resize();
            });
        },
        // 关闭机器人
        turnOff (e) {
            $(e.target).addClass('turn_off_down')
        },
        turnOffEnd(e) {
            $('#preloader').show();
            setTimeout(function () {
                $('#preloader').hide();
            }, 2000)
            $(e.target).removeClass('turn_off_down')
            var _this =this
            $.ajax({
                url:vlm.serverAddr+'stationInfo/robot',
                type:'post',
                dataType:'json',
                traditional: true,
                data:{
                    psid: _this.stationId, //电站id
                    devid: Number(_this.fdDevAddr), //机器人地址
                    type: 0, //1 操作码，0 停，1 启动 2 反转
                    port: _this.port,
                    addr: _this.addr
                },
                timeout: 5000,
                success:function(res){
                    // $('#preloader').hide();
                    if (res.code === 0 ) {
                        console.log('停')
                    }
                },
                error:function(){
                    console.log('setTimeout')
                },
            })
        },
        // 启动机器人
        turnOn (e) {
            $(e.target).addClass('turn_on_down')
        },
        turnOnEnd (e) {
            $('#preloader').show();
            setTimeout(function () {
                $('#preloader').hide();
            }, 2000)
            $(e.target).removeClass('turn_on_down')
            var _this =this
            $.ajax({
                url:vlm.serverAddr+'stationInfo/robot',
                type:'post',
                dataType:'json',
                traditional: true,
                data:{
                    psid: _this.stationId,
                    devid: Number(_this.fdDevAddr), //机器人地址
                    type: 1,  //1 操作码，0 停，1 启动 2 反转
                    port: _this.port,
                    addr: _this.addr
                },
                timeout: 5000,
                success:function(res){
                    // $('#preloader').hide();
                    if (res.code === 0 ) {

                    }else if (res.code === 500){
                        console.log(res.msg)
                    }
                },
                error:function(){
                    console.log('反转')
                },
            })
        },
        // 反转机器人
        turnOver: function (e) {
            $(e.target).addClass('turn_over_down')
        },
        turnOverEnd (e) {
            $('#preloader').show();
            setTimeout(function () {
                $('#preloader').hide();
            }, 2000)
            $(e.target).removeClass('turn_over_down')
            var _this =this
            $.ajax({
                url:vlm.serverAddr+'stationInfo/robot',
                type:'post',
                dataType:'json',
                traditional: true,
                data:{
                    psid: _this.stationId,
                    devid: Number(_this.fdDevAddr), //机器人地址
                    type: 2,  //1 操作码，0 停，1 启动 2 反转
                    port: _this.port,
                    addr: _this.addr
                },
                timeout: 5000,
                success:function(res){
                    // $('#preloader').hide();
                    if (res.code === 0 ) {
                        console.log('反转')
                    }
                },
                error:function(){
                    console.log('setTimeout')
                },
            })
        },
        /*查询环监*/
        /*getEvrmtInfo: function () {
            var _this = this
            var Parameters = {
                "parameters": {
                    "rbtDtu": _this.addr.toString(),
                    "port": _this.port.toString()
                },
                "foreEndType": 2,
                "code": "40000001"
            };
            console.log(Parameters)
            vlm.loadJson("", JSON.stringify(Parameters), function (res) {
                layer.closeAll();  //关闭请求动画
                if (res.success) {
                    var reportArr = res.data.fd_datas;
                    if (reportArr.length) {
                        var reportStr = $('#powerReport_tpl').html();
                        trHtml = ejs.render(reportStr, {reportArr: reportArr});
                        $("#tbody_report").html(trHtml);
                    } else {
                        $("#tbody_report").html('<h3 class="none_Date">查询无数据</h3>');
                    }
                } else {
                    $("#tbody_report").html('<h3 class="none_Date">查询无数据</h3>');
                }
                if (res.success) {
                    console.log('success')
                    var _DUST_ = res.data.HuiChenLiangData*1000
                    _this.drawHumidity(_DUST_);
                    _this.dust = res.data.HuiChenLiangData*1000+'%'
                    _this.temperature = res.data.HuanJingWenDu+'°'
                    _this.rainfall = res.data.JiangYuLiang*10+'ml'
                    _this.illumination = res.data.GuangZhaoDu+'LUX'
                    $('#preloader').hide();
                } else {
                    var _DUST_ = 0.008*1000
                    _this.drawHumidity(_DUST_);
                    _this.dust = 0.008*1000+'%'
                    _this.temperature = 21.2+'°'
                    _this.rainfall = 2.2*10+'ml'
                    _this.illumination = 35000.0+'LUX'
                    $('#preloader').hide();
                }
            });
        },*/
        /*getRotInfo: function (e,item) {
            var _this = this
            $('#preloader').show();
            var Parameters = {
                "parameters": {
                    "rbtDtu": _this.addr.toString(),
                    "port": _this.port.toString(),
                    "fddevAddr": _this.fdDevAddr.toString()
                },
                "foreEndType": 2,
                "code": "40000002"
            };
            console.log("111111")
            console.log(Parameters)
            vlm.loadJson("", JSON.stringify(Parameters), function (res) {
                if (res.success) {
                    console.log('success')
                    $('#preloader').hide();
                } else {
                   
                    $('#preloader').hide();
                }
            });
        }*/
        /*getFdDevAddr: function (e,item) {
            var _this = this
            _this.fdDevAddr = item.fdDevAddr
        }*/
        /*获取环监的新接口*/
        getEvrmtInfo: function () {
            var _this = this
            $.ajax({
                url: vlm.serverAddr+"stationInfo/queryDtuAllInfo", //请求地址
                dataType: "json",
                type : "GET",
                data:{
                    "dtuID": _this.addr.toString(),
                    "psid": _this.stationId
                },
                success:function(res){
                    if (res.code == 0) {
                        _this.filteEvrmtData(res.obj)
                    }
                }
            });
        },
        //处理环监返回数据
        filteEvrmtData: function (data) {
            var _this = this
            _this.dust = data.dustAmount
            _this.illumination = data.currLllum
            _this.rainfall = data.rainfall
            // _this.temperature = data.currTemp
            _this.humidity = data.currHumidity
        },
        /*获取机器人信息的新接口*/
        getRotInfo: function () {
            var _this = this
            // $('#preloader').show();
             $.ajax({
                url: vlm.serverAddr+"stationInfo/queryDtuAllInfo", //请求地址
                dataType: "json",
                type : "GET",
                data:{
                    "dtuID": _this.addr.toString(),
                    "psid": _this.stationId,
                    "robotID": _this.fdDevAddr.toString()
                },
                success:function(res){
                    // console.log(res)
                    // $('#preloader').hide();
                    if (res.code == 0) {
                        _this.filteRbtData(res.obj)
                    } else {
                        // _this.runningState ='暂无数据',
                        _this.batteryCapacity = '无',
                        _this.cleanCount = '无',
                        _this.equipmentAlarm = '无',
                        _this.sweepTime = '无',
                        _this.exChargingTimes = '无'
                    }
                }
            });
        },
        filteRbtData: function (data) {
            var _this = this
            // switch (data.runStatu) {
            //     case '0':
            //         _this.runningState = '停止中'
            //         break
            //     case '1':
            //         _this.runningState = '正向运行中'
            //         break
            //     case '2':
            //         _this.runningState = '反向运行中'
            //         break
            // }
            switch (data.warnStatu) {
                case '0':
                    _this.equipmentAlarm = '正常' //告警状态
                    break
                case '1':
                    _this.equipmentAlarm = '过流'
                    break
                case '2':
                    _this.equipmentAlarm = '欠压'
                    break
                case '3':
                    _this.equipmentAlarm = '限位'
                    break
                case '4':
                    _this.equipmentAlarm = '过热'
                    break
                case '5':
                    _this.equipmentAlarm = '卡位'
                    break
            }
            _this.batteryCapacity = data.havePower//电池余量
            _this.cleanCount = data.cleanCount//清扫次数
            _this.sweepTime = data.brushCleanTime//清扫时长
            _this.exChargingTimes = data.disCount//充放电次数
        }
    },
    mounted: function () {
        this.getParames()
        this.getDevrelation(); //获取机器人信息
        // this.drawHumidity(this.dust);
        this.getEvrmtInfo()
        this.getRotInfo()//页面挂载完成，请求机器人详情
        this.getRbtState()//页面挂载完成，请求机器人状态
        this.getCurrTemp(this.fdCityName)
    },
    watch: {
        fdDevAddr (newV, oldV) {
            // console.log(newV, oldV)
            this.getRotInfo()
            /*this.getRbtState()*/ //切换机器人立刻请求状态
            clearInterval(this.timerH)
            clearInterval(this.timerS)
            this.refreshRbtInfo(60*1000)//当机器人id发生变化，定时刷新机器人详情
            this.refreshRbtState(2000)//当机器人id发生变化，定时刷新机器人状态
        },
        runningState (newV, oldV) {
            // console.log(newV, oldV)
        }
    }

});
