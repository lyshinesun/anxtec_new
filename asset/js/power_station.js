new Vue({
  el: '#station_wrap',
  data: {
    bFlag: true,
    ps_id: "", //被点击电站的ps_id，

    fd_all_power: '', //累计总发电
    fd_all_power_day: '', //今日发电
    fd_total_scheduledata: '--', //累计计划完成率

    fd_all_power_unit: '',
    fd_all_power_day_unit: '',
    listArr:[],
    stationArr: [],
    searchName:''
  },
  methods: {
    closeSetting: function() {
      $('#index_setting').hide();
    },

    //加载发电量排名
    loadFDLAll: function() {
      var _this = this
      $.ajax({
        url: vlm.serverAddr + 'stationbaseinfo/lists',
        type: 'get',
        dataType: 'json',
        traditional: true,
        success: function(res) {
          if (res.code == 0) {
            _this.listArr = res.list;
            _this.doSearch()
            
          }
        },
        error: function() {

        },
      });
    },

    //检测登录状态
    isLogin: function() {
      var _this = this;
      //检测info
      $.ajax({
        type: "get",
        url: vlm.serverAddr + "sys/user/info",
        data: "",
        dataType: "json",
        success: function(res) {
          if (res.code == 0) { //用户没过期，更新用户信息
            window.sessionStorage.userid = res.user.userId;
            window.sessionStorage.username = res.user.username;
            window.sessionStorage.login = 1;
            _this.loadFDLAll();
          } else {
            //返回的是登录页面
            location.href = "./login.html";
          }
        },
        error: function(res) {
          //返回的是登录页面
          location.href = "./login.html";
        }
      });

    },
    //搜索电站
    doSearch: function () {
      var strReg = this.searchName
      if (strReg) {
        this.stationArr = this.listArr.filter(function (item) {
          return new RegExp(strReg).test(item.fdStationName)
        })
      } else {
        this.stationArr =  this.listArr
      }
      $('#preloader').hide();
    }

  },
  created: function () {
    $('#preloader').show();
  },
  mounted: function() {
    this.isLogin(); //检测登录
  }
});
