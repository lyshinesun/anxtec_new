new Vue({
    el: '#dx_wrap',
    data: {
        bFlag: true,
        //section1
        fd_all_power: '',        //累计总发电

        allTimer: null,

        myDate: new Date(),

        psObj: {     // 性能排名
            psIdArr: [],
            psSchemeArr: []
        },

        //右中节能减排
        fd_co2_reduce: '--',    //co2
        fd_coal_reduce: '--',  //煤
        fd_tree_reduce: '--',  //树
        fd_so2_reduce: '--',   //so2

        fd_co2_reduce_unit: '',    //co2单位
        fd_coal_reduce_unit: '',  //煤单位
        fd_tree_reduce_unit: '',  //树单位
        fd_so2_reduce_unit: '',   //so2单位

        //右下电站建设
        fd_intercon_cap_finish: '', //并网
        fd_station_count_finish: '',   //并网座数
        fd_intercon_cap_on: '', //在建
        fd_station_count_on: '',   //在建座数
        fd_intercon_cap_undo: '', //未建
        fd_station_count_undo: '',   //未建座数
        fd_intercon_cap: '',    //总MW数
        fd_unit: '',   //总MW单位

        powertimer: null,

        username:''

    },
    methods: {

        //缩略图标点击
        showSlideItem: function () {
            if (this.bFlag) {
                $('.slide_item').animate({
                    'left': 0
                });
                $('#content_tot,#head_tot').animate({
                    'marginLeft': '5rem'
                });
                this.bFlag = !this.bFlag;
            } else {
                $('.slide_item').animate({
                    'left': '-5rem'
                });
                $('#content_tot,#head_tot').animate({
                    'marginLeft': '0'
                });
                this.bFlag = !this.bFlag;
            }
        },

        closeLeftSlide: function () {
            if (parseInt($('.slide_item').css('left')) == 0) {
                $('.slide_item').animate({
                    'left': '-5rem'
                });
                $('#content_tot,#head_tot').animate({
                    'marginLeft': '0'
                });
                this.bFlag = !this.bFlag;
            }
        },

        //获取总电量、节能减排、电站建设
        getAllPower: function () {
            var _this = this;
            var Parameters = {
                "parameters": {
                    "CultureName": "",
                    "VerifiationCCodeType": "1",
                    "datas": ["ALL_POWER_DAY", "all_power", "ALL_PW", "all_power_year"]
                },
                "foreEndType": 2,
                "code": "20000003"
            };
            //console.log(Parameters);
            vlm.loadJson("", JSON.stringify(Parameters), function (result) {
                //console.log(result);
                if (result.success) {
                    var data = result.data;


                    //安全运营天数
                    _this.fd_safety_daycount = data.fd_safety_daycount + '天';

                    for (var i = 0; i < data.tbpowertypes.length - 1; i++) {
                        if (data.tbpowertypes[i].fd_station_status == 2) { //并网
                            _this.fd_intercon_cap_finish = data.tbpowertypes[i].fd_intercon_cap + data.tbpowertypes[i].fd_unit;
                        }
                    }

                    //节能减排
                    _this.fd_co2_reduce = data.fd_co2_reduce;
                    _this.fd_coal_reduce = data.fd_coal_reduce;
                    _this.fd_tree_reduce = data.fd_tree_reduce;
                    _this.fd_so2_reduce = data.fd_so2_reduce;

                    _this.fd_co2_reduce_unit = data.fd_co2_reduce_unit;
                    _this.fd_coal_reduce_unit = data.fd_coal_reduce_unit;
                    _this.fd_tree_reduce_unit = data.fd_tree_reduce_unit;
                    _this.fd_so2_reduce_unit = data.fd_so2_reduce_unit;

                    //电站建设
                    var dz_data = [];
                    var pieName = LANG["powerStationConstruct"];
                    var lengendData = [];
                    var title = 'abc';
                    var ps_exist_capacity, ps_just_capacity, no_just_capacity;
                    _this.fd_unit = data.tbpowertypes[data.tbpowertypes.length - 1].fd_unit;
                    _this.fd_intercon_cap = data.tbpowertypes[data.tbpowertypes.length - 1].fd_intercon_cap + _this.fd_unit;


                    var colorArray = ["#53e5fd", "#fd5845", "#7b7c74"];

                    for (var i = 0; i < data.tbpowertypes.length - 1; i++) {
                        if (data.tbpowertypes[i].fd_station_status == 2) { //并网
                            _this.fd_intercon_cap_finish = data.tbpowertypes[i].fd_intercon_cap + data.tbpowertypes[i].fd_unit;
                            ps_exist_capacity = data.tbpowertypes[i].fd_intercon_cap;
                            _this.fd_station_count_finish = data.tbpowertypes[i].fd_station_count + LANG["psUnit_zuo"];
                        } else if (data.tbpowertypes[i].fd_station_status == 1) { //在建
                            _this.fd_intercon_cap_on = data.tbpowertypes[i].fd_intercon_cap + data.tbpowertypes[i].fd_unit;
                            ps_just_capacity = data.tbpowertypes[i].fd_intercon_cap;
                            _this.fd_station_count_on = data.tbpowertypes[i].fd_station_count + LANG["psUnit_zuo"];

                        } else if (data.tbpowertypes[i].fd_station_status == 0) { //未建
                            _this.fd_intercon_cap_undo = data.tbpowertypes[i].fd_intercon_cap + data.tbpowertypes[i].fd_unit;
                            no_just_capacity = data.tbpowertypes[i].fd_intercon_cap;
                            _this.fd_station_count_undo = data.tbpowertypes[i].fd_station_count + LANG["psUnit_zuo"];

                        }
                    }
                    var ps_array = [ps_exist_capacity, ps_just_capacity, no_just_capacity];
                    for (var i = 0; i < ps_array.length; i++) {
                        var tempp = {};
                        tempp["value"] = ps_array[i];
                        tempp["color"] = colorArray[i];
                        dz_data.push(tempp);
                    }
                    _this.drawPowerNumChart(echarts, dz_data, pieName, lengendData, title);

                } else {
                    alert(result.message);
                }

            });
        },


        //获取总电量数据
        getAllPower_new: function () {
            var _this = this;
            var d = 800;//跳动到最后的数字
            var time = 1000, //全部时间
                outTime = 0, //实时时间
                interTime = 30; //增长速率
            clearInterval(_this.powertimer);
            _this.powertimer = setInterval(function () {
                outTime += interTime;
                if (outTime < time) {
                    $('.power_number').html(parseFloat(d / time * outTime));
                } else {
                    $('.power_number').html(d);
                }
            }, interTime);
        },

        //获取本月天数
        getDays: function () {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var days;

            //当月份为二月时，根据闰年还是非闰年判断天数
            if (month == 2) {
                days = year % 4 == 0 ? 29 : 28;

            }
            else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
                days = 31;
            }
            else {
                //其他月份，天数为：30.
                days = 30;

            }
            return days;
        },

        //获取发电趋势
        showTrends: function () {
            this.drawTrendChart();
        },

        //绘制当日发电趋势
        drawTrendChart: function () {
            var opls = [
                {
                    "fd_station_name": "水光互补电站",
                    "fd_power_day": '10',
                },
                {
                    "fd_station_name": "农业大棚电站",
                    "fd_power_day": '20',
                },
                {
                    "fd_station_name": "地面集中式",
                    "fd_power_day": '30',
                },
                {
                    "fd_station_name": "山地集中式",
                    "fd_power_day": '60',
                },
                {
                    "fd_station_name": "屋顶分布式",
                    "fd_power_day": '80',
                }]


            //配置圆圈样式
            var outputStation = [];
            var outputDatas = [];
            var opArr = [];
            for (var i = opls.length - 1; i >= 0; i--) {
                //加载Y轴上的各个电站
                var ps_short_name = opls[i].fd_station_name;
                outputStation.push(ps_short_name);
                var opObj = {
                    name: ps_short_name,
                    value: opls[i].fd_power_day
                };
                opArr.push(opObj);
            }
            if (opls == '') {
                outputStation.push('');
                var opObj = new Object({
                    name: '',
                    value: '0'
                });
                opArr.push(opObj);
            }

            //按照数据显示的格式封装数据
            outputDatas.push({
                name: '发电量',
                type: 'bar',
                stack: 'all',
                data: opArr,
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            position: 'right',
                            textStyle: {
                                color: '#615a5a'
                            }
                        },
                        barBorderRadius: 15,
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 2, 2,
                            [
                                {offset: 0, color: '#83bff6'},
                                {offset: 0.5, color: '#020c18'},
                                {offset: 1, color: '#020c18'}
                            ]
                        )
                    }
                },
                barWidth: 15,
            });

            var outputChart = echarts.init(document.getElementById('powerDay'));
            outputChart.showLoading({
                text: 'Loading...',
                textStyle: {
                    fontSize: 12
                },
                effect: 'whirling',
                effectOption: {
                    backgroundColor: 'rgba(0,0,0,0)'
                }
            });

            // 为echarts对象加载数据
            var outputOption = this.getDrawBarChartOption(outputStation, outputDatas, 'kWh');
            outputChart.setOption(outputOption);
            outputChart.hideLoading();
            $(window).resize(function () {
                outputChart.resize();
            });

        },

        getDrawBarChartOption: function (outputStation, outputDatas, unit) {

            var option = {

                // 网格
                grid: {
                    x: 100,
                    y: 10,
                    x2: 0,
                    y2: 40,
                    width: '60%',
                    height:'80%',
                    borderWidth: '0',
                },

                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    trigger: 'item',
                    formatter: function (params, ticket, callback) { //数据格式发生变化，需要用二维数组取值
                        var res = '日' + params.seriesName + "<br/>" + params.name + "：" + params.value + "(" + unit + ")";
                        return res;
                    }
                },

                xAxis: [{
                    name: '',
                    type: 'value',
                    axisLine: {
                        show: false,
                        lineStyle: { // 属性lineStyle控制线条样式
                            color: '#f9f9f7',
                            width: 1
                        }
                    },
                    axisLabel: {
                        formatter: function (value, index) {//坐标保留小数
                            if (value != 0 && value < 10) {
                                return value.toFixed(1) + unit;
                            }
                            return value.toFixed(0) + unit;
                        },
                        show: true,
                        textStyle: {
                            color: '#333'
                        }
                    },
                    splitNumber: 4,
                    splitLine: {
                        show: false
                    },
                    boundaryGap: [0, 0.01]
                }],
                yAxis: [{
                    type: 'category',
                    axisLine: {
                        show: false,
                        lineStyle: { // 属性lineStyle控制线条样式
                            color: '#f9f9f7',
                            width: 1
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#333'
                        }
                    },
                    axisTick: { // 坐标轴小标记
                        show: false,
                        // 属性show控制显示与否，默认不显示
                        inside: false,
                        // 控制小标记是否在grid里
                        length: 5,
                        // 属性length控制线长
                        lineStyle: { // 属性lineStyle控制线条样式
                            color: '#333',
                            width: 1
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    data: outputStation
                }],
                color: ['#24c6c6', '#8ae4d2'],
                series: outputDatas
            };
            return option;
        },


        //绘制电站建设图表
        drawPowerNumChart: function (ec, dz_data, pieName, lengendData, title) {
            var powerNum_option = {
                /*tooltip : {
                 trigger: 'item',
                 formatter: "{a} <br/>{b} : {c} ({d}%)"
                 },*/
                title: {
                    show: false,
                    text: title,
                    x: '35',
                    y: '90',
                    itemGap: 20,
                    textStyle: {
                        color: '#333',
                        fontFamily: 'Microsoft YaHei',
                        fontSize: 18,
                        fontWeight: '100'
                    }
                },
                color: ['#2F7FFA', '#20B126', '#FDD600'],
                series: [
                    {
                        hoverAnimation: true,
                        name: pieName,
                        type: 'pie',
                        center: ['50%', '50%'],
                        radius: ['55%', '85%'],
                        itemStyle: {
                            normal: {
                                color: function (value) {
                                    return value.data.color;
                                },
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            }
                        },
                        data: dz_data
                    }
                ]
            };

            var powerNumChart = ec.init(document.getElementById('powerBuilding'));
            //window.onresize = powerNumChart.resize;
            powerNumChart.setOption(powerNum_option, true);
        },

        //检测登录状态
        isLogin: function () {
            var _this = this;
            //检测info
            $.ajax({
                type: "get",
                url: vlm.serverAddr + "sys/user/info",
                data: "",
                dataType: "json",
                success: function (res) {
                    if (res.code == 0) {//用户没过期，更新用户信息
                        window.sessionStorage.userid = res.user.userId;
                        window.sessionStorage.username = res.user.username;
                        window.sessionStorage.login = 1;

                        $('#ax_user').html(res.user.username);

                        _this.getAllPower();  //获取节能减排、电站建设数据调用
                        _this.getAllPower_new();  //发电量
                        _this.showTrends(); //加载日发电趋势 0-日，月-2

                        clearInterval(_this.allTimer);
                        _this.allTimer = setInterval(function () {
                            _this.getAllPower_new(); //获取总电量(1min)
                            _this.showTrends(); //加载日发电趋势 0-日，月-2
                        }, 300000);

                    } else {
                        //返回的是登录页面
                        location.href = "./login.html";
                    }
                },
                error: function (res) {
                    //返回的是登录页面
                    location.href = "./login.html";
                }
            });

        }


    },
    mounted: function () {

        this.isLogin(); //检测登录
    }
});


//注销
function logOut() {
    $.ajax({
        url: vlm.serverAddr + "sys/logoutYg",
        dataType: "json",
        type: 'get',
        data: {},
        success: function () {
            window.location.href = "login.html";
        },
        error: function () {
            window.location.href = "login.html";
        }
    });
}
