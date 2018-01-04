new Vue({
    el: '#station_map',
    data: {
        bFlag: true,
        stationId: '',
        fdStationName: '',  //项目名称
        pwCuur: '--',   //当前功率
        powerDay: '--', //今日发电
        powerAll: '--', //累计发电
    },
    methods: {
        //跳转到详情页
        linkDet:function(e){
          window.location.href='dialog/dialog_powerDetail.html?stationId='+$(e.target).attr('data-psId');
        },

        //获取电站整体信息
        getPsDetailInfo: function () {
            var _this = this;

            $.ajax({
                url:vlm.serverAddr+'stationInfo/queryPsDataById',
                type:'get',
                dataType:'json',
                traditional: true,
                data:{
                    "psid":this.stationId
                },
                success:function(res){
                    console.log(res);
                    if(res.code ==0){
                        var result=res.list[0];
                        _this.fdStationName = result.fdStationName;
                        _this.powerDay = result.powerDay.toFixed(2); //今日发电

                        _this.powerAll = result.powerAll.toFixed(2); //累计发电
                        _this.pwCuur = result.pwCuur.toFixed(2); //当前功率

                        $('.station_powermsg').css('top','.88rem');
                        $('.det_link').attr('data-psId',_this.stationId);

                    }
                },
                error:function(){},
            });

        },
        //获取地图坐标
        getMapByUser: function () {
            var _this = this;
            $.ajax({
                url: vlm.serverAddr + 'stationbaseinfo/lists',
                type: 'get',
                dataType: 'json',
                traditional: true,
                success: function (res) {
                    if (res.code == 0) {
                        $('#preloader').hide();
                        _this.drawMap(res);
                    }
                },
                error: function () {

                },
            });
        },

        drawMap: function (res) {
            var _this = this;
            $('#power_map').css('height', $('#content_tot').height())
            // 百度地图API功能
            var map = new BMap.Map("power_map", {enableMapClick:false,mapType: BMAP_HYBRID_MAP});//构造底图时，关闭底图可点功能
            var point = new BMap.Point(116.400244, 39.92556);
            map.centerAndZoom(point, 5);
            map.addControl(new BMap.NavigationControl());
            map.addControl(new BMap.ScaleControl());
            map.setDefaultCursor("crosshair");
            map.enableScrollWheelZoom(true);
            map.disableDoubleClickZoom();

            var mapArr=res.list;
            // 向地图添加标注
            var icons = '';
            for (var i = 0; i < mapArr.length; i++) {

                icons = 'images/location_01.png';

                var myIcon = new BMap.Icon(icons, new BMap.Size(20, 30), {
                    offset: new BMap.Size(10, 25), // 指定定位位置
                    imageOffset: new BMap.Size(0, 0), // 设置图片偏移
                });

                var marker = new BMap.Marker(new BMap.Point(mapArr[i].fdLongitude, mapArr[i].fdDimens - 0.03), {
                    icon: myIcon,
                    title: mapArr[i].fdStationName
                });
                var label = new BMap.Label(String(mapArr[i].fdStationCode), {offset: new BMap.Size(5, 3)});
                marker.setLabel(label);
                label.setStyle({display: "none"});
                map.addOverlay(marker);
                marker.addEventListener("click", function getAttr(e) {
                    _this.stationId = e.target.getLabel().content;
                    _this.getPsDetailInfo();
                });
            };
            map.addEventListener('click',function(){  //图标点击
                if($('.station_powermsg').css('top') != '-100%'){
                    $('.station_powermsg').css('top','-100%');
                }else{
                    $('.station_powermsg').css('top','0.88rem');
                }
            });
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
                        _this.getMapByUser();
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

$('.setting_ul >li').click(function () {
    if ($(this).attr('data-setType') == 0) {
        $('#index_setting,#index_setting .header').animate({
            'left': 0
        }).show();
    }
});

$('.setting_list .setting_switch').click(function () {
    if ($(this).hasClass('close')) {
        $(this).removeClass('close');
    } else {
        $(this).addClass('close');
    }
});

$('#setting_btn').click(function () {
    $('#index_setting,#index_setting .header').animate({
        'left': '100%'
    }).hide();
});

