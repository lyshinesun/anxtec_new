new Vue({
  el: '#dia_powerDetail',
  data: {
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
    envrmtBoxInfoList: []
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
    getFdCity: function () {
      this.fdCity = this.getSearchString('fdCity')
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
            console.log(Boolean(res.list[0]))
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
            console.log(_this.resList)
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
      console.log(envrmtBoxList)
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
      console.log(envrmtBoxList)
    }
  },
  watch: {
    fdDevAddr (newFdDevAddr, oldFdDevAddr) {
      this.formatEnvrmtBoxList(newFdDevAddr, (list) => {
        this.envrmtBoxList = list
        this.getEvrmtBoxInfo(this.envrmtBoxList)
      })
    }
  },
  mounted: function () {
    this.isLogin(); //检测登录
    this.getFdCity()
  }
});