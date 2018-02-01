new Vue({
  el: '#dia_powerDetail',
  data: {
    stationCityName:'',
    temperature:'',
    stationId:vlm.parseUrlPara(location.href).stationId.toLowerCase(),
    fdStationName: '',  //项目名称
    powerDay: '--', //今日发电
    powerAll: '--', //累计发电
    fdStationDesc: '', //电站介绍
    pCount:0, //机器人
    sysCount:0, //监测系统台数
    fdStationCapacity:0, //容量
    fdPicHttpAddr:'', //屋顶图片
    fdPicPhyAddr:'../images/error.png', //默认图片
    fd_station_sketchpic: '../images/ps_unit.png', //电站示意图
    resList:[],
    /*机器人dtu需要的参数*/
    fdCity:'', //由电站列表中获得，传给电站详情url，用于机器人操作
    /*判断当前电站是不是有数据*/
    hasPsData: false,
    fdDevAddr: 1,

    /*环境箱的list*/
    envrmtList: [],
    envrmtBoxList: [],
    envrmtBoxInfoList: [],
    inverterData: null,
    /*逆变器发电对比数据*/
    tempNlist:[],
    tempYlist:[],
    invterDataLogTime:[],
    inverterSelector: 0, //0:发电量 1:交流功率
    inverterChartYUnit: 'kWh',

    /*已/未安装方阵月发电量对比*/
    addedPw: '', //本月提升电量，单位：万kWh
    avrgImpr: '', //本月平均提升比
    totalPw: '', //本月累计发电量
    currDate1: '',//已/未安装方阵月发电量发电
    currDate2: ''//月发电量
  },
  methods: {
    /*格式化厂房信息*/
    formatEnvrmtList: function (item, index) {
      this.envrmtList.push({
        'fdDevName': item.fdDevName,
        'fdDevAddr': item.fdDevAddr,
        'fdDevCode': item.fdDevCode,
        'list': item.list,
        envrmtInfo:{}
      })
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
    getStationCityName: function () {
      this.stationCityName = this.getSearchString('fdCityName')
      this.getCurrTemp(this.stationCityName)
    },
    getFdCity: function () {
      this.fdCity = this.getSearchString('fdCity')
    },
    /*获取当前城市的温度*/
    getCurrTemp: function (cityName) {
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
    //获取电站整体信息
    getPsDetailInfo1: function () {
      var _this = this;
      $.ajax({
        url:vlm.serverAddr+'stationInfo/queryPsDataById',
        type:'get',
        dataType:'json',
        traditional: true,
        data:{
          "psid":_this.stationId
        },
        success:function(res){
          if(res.code ==0 && res.list[0]){
            _this.hasPsData = true
            // console.log(Boolean(res.list[0]))
            var result=res.list[0];
            _this.fdStationName = result.fdStationName;
            _this.powerDay = result.powerDay.toFixed(2); //今日发电

            _this.powerAll = result.powerAll.toFixed(2); //累计发电
            _this.fdStationDesc = result.fdStationDesc; //电站介绍
            _this.fdStationCapacity = result.fdStationCapacity; //容量

            _this.pCount = result.pCount; //机器人
            _this.sysCount = result.sysCount; //监测系统台数

            _this.fdPicHttpAddr=vlm.imgUrl+result.fdPicHttpAddr;
            if (result.fdPicPhyAddr) {
              _this.fdPicPhyAddr = vlm.imgUrl+result.fdPicPhyAddr;
            }
          } else {
             _this.hasPsData = false
             $.ajax({
              url: vlm.serverAddr+"stationbaseinfo/listAx", //获取电站详细信息
              dataType: "json",
              type : "GET",
              data:{
                "psid": _this.stationId.toUpperCase()
              },
              success:function(res){
                var result = res.list[0]
                _this.fdStationDesc = result.fdStationDesc
                _this.fdStationName = result.fdStationName
                _this.fdPicHttpAddr = vlm.imgUrl + result.fdPicHttpAddr;
                if (result.fdPicPhyAddr) {
                  _this.fdPicPhyAddr = vlm.imgUrl + result.fdPicPhyAddr;
                }
              }
            });
          }
        },
        error:function(){},
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
          id:this.stationId, //厂房列表传电站id 查机器人列表传fdDevCode
          type:"1"   //1 查两层 不是1只查一层
        },
        success:function(res){
          if(res.code ==0){
            _this.resList=res.page;
            // console.log(_this.resList)
            _this.fdDevAddr = _this.resList[0].fdDevAddr
            _this.resList.forEach(function(item, index) {
              _this.formatEnvrmtList(item, index)
            })
            // console.log(_this.envrmtList)
            setTimeout(function(){
              $('.fac_item_head').off().click(function(){
                $(this).find('i').toggleClass('down');
                $(this).parent().find('.fac_item_sub').stop().slideToggle();
              });
            },1000);
          }
        },
        error:function(){},
      });
    },

    //发电趋势show
    showGenTrends: function () {
      var temChart = echarts.init(document.getElementById('dayEchart'));
      temChart.clear();
      this.getResultTrends();
    },

    //发电趋势首次加载或者点击后发送请求
    getResultTrends: function () {
      var _this = this;

      $.ajax({
        url:vlm.serverAddr+'stationInfo/getPsDayList',
        type:'get',
        dataType:'json',
        traditional: true,
        data:{
          "psid":this.stationId
        },
        success:function(res){
          if(res.code ==0){
            _this.dealPowerData_day(res.list);
          }
        },
        error:function(){},
      });

    },

    //处理日发电数据
    dealPowerData_day: function (list) {
      var _this = this;
        var glData = [], actualData = [], dateDate = []; //功率、发电量、日期区间
        for (var i = 0; i < list.length; i++) {
          if (list[i].fdPwCurr < 0) {
            glData.push('0');
          } else {
            glData.push(list[i].fdPwCurr.toFixed(2));
          }
          actualData.push(list[i].fdPowerDay);
          dateDate.push(list[i].fdLogDate);
        }
        var unit = 'kWh', glUnit = 'kW';//发电量单位 功率单位、
        _this.drawDayChart(actualData, glData, dateDate, unit, glUnit);
    },

    //绘制日发电趋势
    drawDayChart: function (actualDataDay, glData, dateDate, punit, glUnit) {
      //glData = dealArray(glData);
      var option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (data) {
            var restStr = "";
            for (var i = 0; i < data.length; i++) {
              var obj = data[i];
              if (i == 0) {
                restStr += obj.name + "<br>";
              }
              restStr += obj.seriesName + ":" + dealEchartToolTip(obj.data) + (LANG["yy1.PowerGeneration"] == obj.seriesName ? punit : glUnit) + "<br>";
            }
            return restStr;
          }
        },
        legend: {
          orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
          // 'horizontal' ¦ 'vertical'
          x: '100px',               // 水平安放位置，默认为全图居中，可选为：
          // 'center' ¦ 'left' ¦ 'right'
          // ¦ {number}（x坐标，单位px）
          y: '10',                  // 垂直安放位置，默认为全图顶端，可选为：
          // 'top' ¦ 'bottom' ¦ 'center'
          // ¦ {number}（y坐标，单位px）
          textStyle: {
            color: '#333',
            fontFamily: 'Microsoft YaHei'
          },
          data: [LANG["yy1.PowerGeneration"], LANG["yy1.powerful"]]
        },
        // 网格
        grid: {
          x: 45,
          y: 45,
          x2: 40,
          y2: 25,
          backgroundColor: '#fff',
          borderWidth: 0,
          borderColor: '#ccc'
        },
        xAxis: [
          {
            type: 'category',
            axisLine: {
              show: true,
              lineStyle: { // 属性lineStyle控制线条样式
                color: '#333'
              }
            },
            axisLabel: {
              show: true,
              rotate: 0,//逆时针显示标签，不让文字叠加
              textStyle: {
                color: '#333'
              }
            },
            splitLine: {
              show: false
            },
            boundaryGap: [0, 0.01],
            data: dateDate
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: punit,
            axisLine: {
              show: true,
              lineStyle: { // 属性lineStyle控制线条样式
                color: '#333'
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#333'
              }
            },
            splitLine: {
              show: true
            },
            nameTextStyle: {
              fontFamily: 'Microsoft YaHei'
            }
          },
          {
            type: 'value',
            name: glUnit,
            min: 0,
            axisLine: {
              show: true,
              lineStyle: { // 属性lineStyle控制线条样式
                color: '#333'
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#333'
              }
            },
            splitLine: {
              show: false
            },
            nameTextStyle: {
              fontFamily: 'Microsoft YaHei'
            }
          }
        ],
        series: [
          {
            name: LANG["yy1.PowerGeneration"],
            type: 'bar',
            smooth: true,
            yAxisIndex: 0,
            barWidth: 3,
            barMaxWidth: 6,
            itemStyle: {
              normal: {
                color: '#395e7b',  //蓝色柱状
                lineStyle: {        // 系列级个性化折线样式
                  width: 1
                }
              }
            },
            symbol: 'none',
            yAxisIndex: 0,
            data: actualDataDay
          },
          {
            name: LANG["yy1.powerful"],
            type: 'line',
            smooth: false,
            itemStyle: {
              normal: {
                color: '#55b327',//'#0096ff',
                lineStyle: {        // 系列级个性化折线样式
                  width: 2
                }
              }
            },
            yAxisIndex: 1,
            data: glData
          }
        ]
      };
      var ptChartDay = echarts.init(document.getElementById('dayEchart'));
      ptChartDay.setOption(option);
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
            _this.getPsDetailInfo1(); //整体信息
            _this.getDevrelation(); //获取厂房信息
            _this.showGenTrends(); //加载日发电趋势

          } else {
            //返回的是登录页面
            location.href = "../login.html";
          }
        },
        error: function (res) {
          //返回的是登录页面
          location.href = "../login.html";
        }
      });
    },
     /*获取环境箱列表*/
    formatEnvrmtBoxList: function (newFdDevAddr, callback) {
      this.resList.forEach(function (item, index) {
        if (item.fdDevAddr == newFdDevAddr) {
          callback && callback(item.list)
        }
      })
    },
    /*获取每个环境箱内的环监*/
    getEvrmtBoxInfo: function (envrmtBoxList){
      var _this = this
      // console.log(envrmtBoxList)
      envrmtBoxList.forEach(function (item, index) {
        $.ajax({
          type: "get",
          url: vlm.serverAddr + "stationInfo/queryDtuAllInfo",
          data: {
            "dtuID": item.fdDevAddr,
            "psid": _this.stationId
          },
          dataType: "json",
          success: function (res) {
            // _this.envrmtBoxInfoList.push(res.list)
            if (res.code == 0) {
              item.list = res.obj
            }
            // console.log(_this.envrmtBoxInfoList)
          },
          error: function (res) {
           
          }
        });
      })
      // console.log(envrmtBoxList)
    },

    /*已/未安装方阵日运行趋势模块*/
    //获取已/未安装方阵日运行趋势数据
    getInverterPw: function () {
      var _this = this
      $.ajax({
        type: "get",
        url: vlm.serverAddr + "stationbaseinfo/getAxNBPowerList",
        data: {
          "psid": _this.stationId
        },
        dataType: "json",
        success: function (res) {
          if (res.code == 200) {
            // console.log(res)
            _this.tempNlist = res.Nlist
            _this.tempYlist = res.Ylist
            if (res.Nlist.length) {
              res.Nlist[0].forEach(function (item,index) {
                _this.invterDataLogTime.push (item.fdLogDate)
              })
            }
            _this.dealInverterData(_this.tempNlist,_this.tempYlist,_this.invterDataLogTime,_this.inverterSelector)
          } else {
            
          }
        },
        error: function (res) {
        }
      });
    },
    //处理已/未安装方阵日运行趋势数据
    dealInverterData: function (Nlist,Ylist,dateTime,inverterSelector) {
      var _this = this;
      // console.log(Ylist)   
      var NData, YData, Yseries, Nseries, seriesData
      Yseries = []
      Nseries = []
      for (var i=0; i<Ylist.length; i++) {
        YData = []
        var inverterName = ''
        inverterName = Ylist[i][0].fdDevId.slice(Ylist[i][0].fdDevId.lastIndexOf('_')+1)
        if (inverterSelector == 0) {
          for (var j=0; j<Ylist[i].length; j++) {
            YData.push(Ylist[i][j].fdPower.toFixed(2)) //发电量
          }
        } else if (inverterSelector == 1) {
          for (var j=0; j<Ylist[i].length; j++) {
            YData.push(Ylist[i][j].fdPwCurr.toFixed(2)) //交流功率
          }
        }
        Yseries.push({
          name:inverterName,
          type:'line',
          // stack: '总量',
          itemStyle:{
            normal:{
              lineStyle:{
                color: '#2F4554'
              }
            }
          },
          data:YData
        }) 
      }
      for (var i=0; i<Nlist.length; i++) {
        NData = []
        var inverterName = ''
        inverterName = Nlist[i][0].fdDevId.slice(Nlist[i][0].fdDevId.lastIndexOf('_')+1)
        if(inverterSelector == 0) {
          for (var j=0; j<Nlist[i].length; j++) {
            NData.push(Nlist[i][j].fdPower.toFixed(2))
          }
        } else if (inverterSelector == 1) {
          for (var j=0; j<Nlist[i].length; j++) {
            NData.push(Nlist[i][j].fdPwCurr.toFixed(2))
          }
        }
        
        Nseries.push({
          name: inverterName,
          type:'line',
          // stack: '总量',
          itemStyle:{
            normal:{
              lineStyle:{
                color: '#C23531'
              }
            }
          },
          data:NData
        }) 
      }
      seriesData = Nseries.concat(Yseries)
      setTimeout(function () {
        _this.drawInverterChart(dateTime,seriesData,_this.inverterChartYUnit)
      },1000)
    },
    //绘制已/未安装方阵日运行趋势数据
    drawInverterChart: function (dateTime,seriesData,inverterChartYUnit) {
      // console.log(dateTime,YData,NData)
      var option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data:['已安装','未安装']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dateTime
          },
          yAxis: {
            type: 'value',
            name: inverterChartYUnit,
            nameGap: 18
          },
          series: seriesData
      };
      var inverterChart = echarts.init(document.getElementById('pwCompare'));
      inverterChart.setOption(option);
    },

    /*已/未安装方阵月发电量对比*/
     //获取已/未安装方阵月发电量发电对比的数据
    getInverterPwCompare: function () {
      var _this = this
      $.ajax({
        type: "get",
        url: vlm.serverAddr + "stationbaseinfo/queryNbKPIDayByDevid",
        data: {
          "psid": _this.stationId,
          "logDate": _this.currDate1
        },
        dataType: "json",
        success: function (res) {
          if (res.code == 200) {
            var bResult=[], YList = [], NList = [], dateData = []; //已安装、未安装、日期区间
            YList = res.Ylist
            NList = res.Nlist
            if (res.Nlist.length) {
              res.Nlist[0].forEach(function (item,index) {
                dateData.push (item.fdLogDate.slice(8,10))
              })
            }
            bResult = res.bResult
            _this.addedPw =  res.addPower.toFixed(2) + '万kWh'//本月提升电量，单位：万kWh
            _this.avrgImpr =  res.avgB.toFixed(2) + '%'//本月平均提升比
            _this.totalPw = res.monPower.toFixed(2) + '万kWh' //本月累计发电量
            _this.dealInvterPwCompData(NList,YList,bResult,dateData)

          } else {
            var bResult=[], YList = [], NList = [], dateData = []; //已安装、未安装、日期区间
            _this.addedPw =  '0万kWh'//本月提升电量，单位：万kWh
            _this.avrgImpr =  '0%'//本月平均提升比
            _this.totalPw =  '0万kWh' //本月累计发电量
            _this.dealInvterPwCompData(NList,YList,bResult,dateData)
          }
        },
        error: function (res) {
        }
      });
    },
    /*操作已/未安装方阵月发电量发电对比的数据*/
    dealInvterPwCompData: function (NList,YList,bResult,dateData) {
      var _this = this;
      var NData, YData, BData, Yseries, Nseries, Bseries, seriesData
      Yseries = []
      Nseries = []
      Bseries = []
      for (var i=0; i<YList.length; i++) {
        YData = []
        var inverterName = ''
        inverterName = YList[i][0].fdDevId.slice(YList[i][0].fdDevId.lastIndexOf('_')+1)
        for (var j=0; j<YList[i].length; j++) {
          YData.push(YList[i][j].fdPower.toFixed(2)) //发电量
        }
        Yseries.push({
          name:inverterName,
          type:'line',
          smooth: true,
          itemStyle:{
            normal:{
              lineStyle:{
                color: '#2F4554'
              }
            }
          },
          data:YData
        }) 
      }
      for (var i=0; i<NList.length; i++) {
        NData = []
        var inverterName = ''
        inverterName = NList[i][0].fdDevId.slice(NList[i][0].fdDevId.lastIndexOf('_')+1)
        for (var j=0; j<NList[i].length; j++) {
          NData.push(NList[i][j].fdPower.toFixed(2))
        }
        Nseries.push({
          name: inverterName,
          type:'line',
          smooth: true,
          itemStyle:{
            normal:{
              lineStyle:{
                color: '#C23531'
              }
            }
          },
          data:NData
        }) 
      }
      Bseries = [{
         name: '提升比',
          type:'line',
          smooth: true,
          yAxisIndex: 1,
          itemStyle:{
            normal:{
              lineStyle:{
                color: '#f1d523'
              }
            }
          },
          data:bResult
      }]
      seriesData = Yseries.concat(Nseries).concat(Bseries)
      setTimeout(function () {
        _this.drawInvterPwCompChart(dateData,seriesData)
      },1000)
    },
    /*绘制已/未安装方阵月发电量发电对比曲线*/
    drawInvterPwCompChart: function (dateData,seriesData) {
      var option = {
          tooltip: {
            trigger: 'axis'
          },
          /*legend: {
            data:[]
          },*/
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dateData
          },
         
          yAxis: [{
            type: 'value',
            interval: 20,
            name: '发电量(kWh)',
          },{
            type: 'value',
            name: '提升比(%)',
          }],
          series: seriesData
      };
      var inverterChart = echarts.init(document.getElementById('pwMCompare'));
      inverterChart.setOption(option);
    },

    /*月发电量*/
    getMonthPw: function () {
      var _this = this
      $.ajax({
        type: "get",
        url: vlm.serverAddr + "stationbaseinfo/getPsPowerDayById",
        data: {
          "psid": _this.stationId,
          "logDate": _this.currDate2
        },
        dataType: "json",
        success: function (res) {
          if (res.code == 200) {
            var list = [], dateData = []
            list  = res.list
            list.forEach(function (item,index) {
               dateData.push (item.fdLogDate.slice(8,10))
            })
            _this.dealMPwData(list,dateData)


          } else {
            
          }
        },
        error: function (res) {
        }
      });
    },
    /*处理月发电量*/
    dealMPwData: function (list,dateData) {
      var _this = this;
        var monthData = []
        for (var i = 0; i < list.length; i++) {
          if (list[i].fdPowerCurr < 0) {
            monthData.push('0');
          } else {
            monthData.push((list[i].fdPowerDay*10000).toFixed(2));
          }
        }
        setTimeout(function () {
          _this.drawMPwChart(monthData, dateData);
        },1000)
       
    },
    drawMPwChart: function (monthData, dateData) {
      // console.log(monthData, dateData)
      var option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dateData
        },
        yAxis: {
          type: 'value',
          name: '发电量(kWh)',
          nameGap: 18
        },
        series: [{
          name: '发电量(kWh)',
          type: 'bar',
          barWidth: 6,
          barMaxWidth: 8,
          itemStyle: {
            normal: {
              color: '#395e7b',  //蓝色柱状
              lineStyle: {        // 系列级个性化折线样式
                width: 1
              }
            }
          },
          symbol: 'none',
          data: monthData
        }]
      }
      var inverterChart = echarts.init(document.getElementById('monthPw'));
      inverterChart.setOption(option);
    },
    /*已/未安装方阵月发电量发电时间选择器*/
    changeDate1: function () {
      var _this = this
      _this.currDate1 = vlm.Utils.currentDate().toMonth
      var calendar = new datePicker();
      var currDate = vlm.Utils.currentDate().toMonth
      calendar.init({
        'trigger': '#mDate', /*按钮选择器，用于触发弹出插件*/
        'type': 'ym',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
        'minDate':'2018-1',/*最小日期*/
        'maxDate':currDate,/*最大日期*/
        'onSubmit':function(){/*确认时触发事件*/
          _this.currDate1 = calendar.value;
        },
        'onClose':function(){/*取消时触发事件*/
        }
      });
    },
     /*月发电量时间选择器*/
    changeDate2: function () {
      var _this = this
      _this.currDate2 = vlm.Utils.currentDate().toMonth
      var calendar = new datePicker();
      var currDate = vlm.Utils.currentDate().toMonth
      calendar.init({
        'trigger': '#pwDate', /*按钮选择器，用于触发弹出插件*/
        'type': 'ym',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
        'minDate':'2015-1',/*最小日期*/
        'maxDate':currDate,/*最大日期*/
        'onSubmit':function(){/*确认时触发事件*/
          _this.currDate2 = calendar.value;
        },
        'onClose':function(){/*取消时触发事件*/
        }
      });
    }

  },
  watch: {
    fdDevAddr: function (newFdDevAddr, oldFdDevAddr) {
      this.formatEnvrmtBoxList(newFdDevAddr, function (list) {
        this.envrmtBoxList = list
        this.getEvrmtBoxInfo(this.envrmtBoxList)
      }.bind(this))
    },
    inverterSelector: function (newInverterSelector,oldInverterSelector) {
      if (newInverterSelector == 0) {
        this.inverterChartYUnit = 'kWh'
      } else if (newInverterSelector == 1) {
        this.inverterChartYUnit = 'kW'
      }
      this.dealInverterData(this.tempNlist,this.tempYlist,this.invterDataLogTime,this.inverterSelector)
    },
    currDate1:function () {
      this.getInverterPwCompare()
    },
    currDate2:function () {
      this.getMonthPw()
    }
  },
  created: function () {
    var _this = this
    // _this.currDate1 = vlm.Utils.currentDate().toMonth
  },
  mounted: function () {
    this.isLogin(); //检测登录
    this.getFdCity()
    this.getStationCityName()
    this.getInverterPw()
    this.getInverterPwCompare()
    this.getMonthPw()
    this.changeDate1()
    this.changeDate2()
  }
});


  


