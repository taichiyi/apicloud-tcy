define(['../js/ezapp'], function() {
    // 每个window, frame 都要引入这个js

    /*global (每个引入common.js的页面都有以下全局变量)
        | from       | global                              |
        | ----       | ------                              |
        | browser    | window                              |
        | apicloud   | api                                 |
        | zepto.js   | $, Zepto                            |
        | ezapp.js   | Q                                   |
        | common.js  | F                                   |
        | require.js | requirejs, require, define, xpcUtil |
    */

    // 为什么定义一个F对象?
    // 1. 防隐藏bug  防止项目过大时, 全局变量污染容易隐藏bug
    // 2. 清晰明了   一眼就知道是全局变量
    // 为什么是F? 1.F输入方便 2.好看

    // 如果是common.js 里定义的变量都加上"_". 例如: F.IP => F._IP; F.isLogin => F._isLogin;
    // 如果变量是接口的url, 建议变量字母大写. 如: F.login => F.LOGIN


    /*
    === 文件命名规则 -start- ===
    语法: windowName_frameName.html
    说明: 
        1.windowName和frameName多个单次连接使用中划线(-), 而不是使用下划线(_)
        2.如果该frame和window绑定打开, frameName为cont.
            例: login_cont.html
        3.如果没有windowName, frameName的前面也要保留下划线(_)
            例: _tips.html, _index-qr.html
        4.名词在前，动词、形容词在后。错误例子：edit-goods.html；正确例子：goods-edit.html

    更多例子:
        文件为window:
            单个单词: login.html
            多个单词: info-my.html, info-my-edit.html

        文件为frame:
            和window绑定: login_cont.html, info-my-edit_cont.html
            
            没绑定: _tips.html,  _index-qr.html

    === 文件命名规则 -end- ===
    */

    // 11111111111111111111
    window.F = {};

    F._winWidth = document.documentElement.clientWidth; //window的宽度
    F._winHeight = document.documentElement.clientHeight; //window的高度

    // 是否使用静态数据
    // F._use_static_data = true;
    F._use_static_data = false;


    // 通过此方法打开window, 会对权限进行处理
    F._openWin = function(params) {
        var def_params = {
            name: '', // window 名字
            _options: {
                is_check: false,
                check_type: 'login',
            }
        }
        Q.extend(def_params, params);
        var is_check = def_params._options.is_check;
        var check_type = def_params._options.check_type;

        console.log('打开window传的params');
        console.log(JSON.stringify(def_params));

        // 通过检查
        function pass_check(def_params) {
            Q.openWin(def_params);
        }

        if (!is_check) return pass_check(def_params);

        // 检查登录
        function is_login() {
            if (!F._isLogin()) {
                // 未登录
                def_params.name = 'login-reg';
                def_params.bgColor = 'widget://img/d89184.png';
                def_params.animation = {
                    type: 'movein',
                    // subType: 'from_bottom',
                    duration: 300,
                }
            }
            pass_check(def_params);
        }

        // 是否已身份认证
        function is_certificate() {
            var certificate = Q.cache.get('certificate');
            if (certificate === 'yes') { //已通过身份认证
                pass_check(def_params);
            } else {  //未通过身份认证
                Q.openWin({
                    name: 'attestation-info',
                });
            }
        }

        // 需要检查权限
        switch (check_type) {
            case 'login':
                is_login();
                break;
        
            case 'certificate':
                // 是否已身份认证
                is_certificate();
                break;
        
            default:
                // 默认为检查是否登录
                is_login();
                break;
        }
    };

    // 关闭当前window
    F._closeWin = function() {
        api.closeWin();
    };

    // 针对，在 Window 中注册才有效，Frame 中注册无效的 事件
    F._addEventListener = function(name, callback) {
        function run_window() {
            function edit_params() {
                if (Q.type(name) === 'object') {
                    callback = name.callback;
                    name = name.name;
                } else {
                    callback = callback + '';
                }

                var regexp = /{([^]+?)}$/i;
                var match = callback.match(regexp);
                callback = match[1];
            }
            edit_params();

            api.addEventListener({
                name: name,
            }, function(ret, err) {
                window.eval(callback);
            });
        }

        function run_frame() {
            var params_str = JSON.stringify({
                "name": name,
                "callback": callback + '',
            });

            // console.log(JSON.stringify(params_str));

            api.execScript({
                name: api.winName,
                script: 'F._addEventListener(' + params_str + ');'
            });
        }

        if (!api.frameName) {
            // window
            run_window();
        } else {
            // frame
            run_frame();
        }
    };

    // 移除keyback监听事件
    F._remove_keyback_EventListener = function() {
        if (!api.frameName) {
            // window
            if (api.winName !== 'root') {
                api.removeEventListener({
                    name: 'keyback'
                });
                return false;
            }
            api.execScript({
                name: 'root',
                script: 'F.addEventListener_exit_app();'
            });
        } else {
            // frame
            api.execScript({
                name: api.winName,
                script: 'F._remove_keyback_EventListener();'
            });
        }
    };

    // 获取静态数据
    function get_static_data(params, callback) {
        var result;
        var request_name = '';
        var url = params.url;

        if (params._options === undefined) {
            params._options = {};
            params._options.isLoading = true;
        }

        if (params._options.isLoading === undefined) {
            params._options.isLoading = true;
        }

        // 分析url提取请求类型
        function get_suffix(name) {
            var i;
            var nameLength = name.length - 1;
            for (i = nameLength; i > 0; i -= 1) {
                if (i > 100) {
                    return name;
                }

                // -start- 需要根据项目接口类型改变
                if (name[i] === '/') {
                    return name.slice(i + 1, -5);
                }
                // -end- 需要根据项目接口类型改变

            }
            return false;
        }

        console.log(url);
        request_name = get_suffix(url);
        console.log(request_name);
        if (params._options.isLoading) {
            Q.showProgress();
        }
        Q.loadFile({
            url: '../res/static_data.json'
        }, function(ret, err) {
            window.setTimeout(function() {
                if (params._options.isLoading) {
                    Q.hideProgress();
                }
                callback(ret.data[request_name]);
            }, 300);
        });
    }

    // 错误处理
    function error_process(ret, err, params) {
        if (err) {
            api.toast({
                msg: '网络连接不可用, 请稍后重试',
                duration: 2000,
                location: 'bottom'
            });
        } else {
            if (!(params._options && params._options.is_error_tips === false)) {

                if (ret.code === 0) {
                    return false;
                }

                switch (ret.message) {
                    case '404':
                        window.setTimeout(function() {
                            api.execScript({
                                name: 'root',
                                frameName: '',
                                script: 'F.open_login();'
                            });
                            api.closeToWin({
                                name: 'root',
                                animation: {
                                    type: 'none',
                                }
                            });
                        }, 300);

                        break;
                
                    default:
                        api.toast({
                            msg: window.decodeURI(ret.message),
                            duration: 2000,
                            location: 'middle'
                        });
                        break;
                }
            }
        }
    }

    F._getAPI = function(params, callback) {
        if (F._use_static_data) {
            get_static_data(params, function(ret) {
                callback(ret);
            });
            return false;
        }

        var i;
        var url = '';
        var data = params._data || {};
        // 判断是否为空对象
        if (Object.keys(data).length) {
            for (i in data) {
                url += ('&' + i + '=' + data[i]);
            }
            params.url += '?' + url.slice(1);
        }

        Q.AJAX.get(params, function(ret, err) {
            console.log('====== DEBUG -start- ======');
            console.log(params.url);
            console.log(JSON.stringify(params._data));
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            console.log('====== DEBUG -end- ======');
            error_process(ret, err, params)
            callback(ret, err);
            // if (ret) {
            // } else {
            //     Q.hideProgress();
            // }
        });
    };

    F._postAPI = function(params, callback) {
        if (F._use_static_data) {
            get_static_data(params, function(ret) {
                callback(ret);
            });
            return false;
        }

        var user = Q.cache.get('user');
        if (user) {
            params.url += '?token=' + user;
            /*if (params.data.values) {
                params.data.values.key = Q.cache.get('user') ? Q.cache.get('user')['token'] : '';
            } else {
                params.data.values = {
                    key: Q.cache.get('user')['token']
                }
            }*/
        }

        // 只要是post都加
        params.data.values = params.data.values || {};
        params.data.values.dosubmit = '1';

        Q.AJAX.post(params, function(ret, err) {
            console.log('====== DEBUG -start- ======');
            console.log(params.url);
            console.log(JSON.stringify(params.data));
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            console.log('====== DEBUG -end- ======');
            error_process(ret, err, params)
            callback(ret, err);
            // if (ret) {
            // } else {
            //     Q.hideProgress();
            // }
        });
    };

    // 解码
    F._deURI = function(val) {
        return window.decodeURIComponent(val);
    };

    // 登录
    F._login = function(data) {
        data = data || {};
        Q.cache.set('isLogin', data);
    };

    // 退出登录
    F._logout = function(callback) {
        callback = callback || function() {};
        api.confirm({
            title: '',
            msg: '确定退出登录?',
            buttons: ['确定', '取消']
        }, function(ret, err) {
            if (ret.buttonIndex == 1) {
                Q.cache.del("isLogin");
                callback();
            }
        });
    };

    // 判断是否登录
    F._isLogin = function() {
        var user = Q.cache.get('isLogin');
        return !!user;
    };


    /* 时间戳格式化(时间戳默认为unix-10位数)
     * 
     * -model:
     *  1:0000-00-00
     *  2:0000-00-00 00:00 (默认)
     *  3:0000-00-00 00:00:00
     *  4:人性化显示-1{
     *     当天: 00:00
     *     昨天: 昨天 00:00
     *     昨天以前: 0月-0日 00:00
     *     一年前: 0000年-0月-0日 00:00
     *   }     
     *  5:人性化显示-2{
     *     当天: 00:00
     *     昨天: 昨天
     *     昨天以前: 0月-0日
     *     一年前: 00/00/00
     *   }     
     *  6:0000.00.00
     */
    F._timeStrForm = function(str, model, unUnix) {
        var reStr = ''; //返回值
        var monthFormat; //月格式化
        var dateFormat; //日格式化
        var hourFormat; //时格式化
        var minuteFormat; //分格式化
        var secondFormat; //秒格式化

        var nDNow; //现在的时间戳
        var yearNow; //现在的年份
        var monthNow; //现在的月份
        var dateNow; //现在的天数
        var hourNow; //现在的小时
        var minuteNow; //现在的分钟
        var secondNow; //现在的秒数

        var dayDiff; // 相差几天
        var monthDiff; // 相差几年
        var yearDiff; // 相差几年

        if (!str) {
            //默认为当前时间戳
            str = parseInt(+new Date() / 1000);
        }

        if (!unUnix) {
            // 时间戳默认为unix
            str = str + '000';
        }

        // 不为数字,转为数字
        if (typeof str !== 'number') {
            str = Number(str);
        }

        var nD = new Date(str);
        var year = nD.getFullYear();
        var month = nD.getMonth() + 1;
        var date = nD.getDate();
        var hour = nD.getHours();
        var minute = nD.getMinutes();
        var second = nD.getSeconds();

        monthFormat = month;
        dateFormat = date;
        hourFormat = hour;
        minuteFormat = minute;
        secondFormat = second;

        (monthFormat < 10) && (monthFormat = '0' + monthFormat);
        (dateFormat < 10) && (dateFormat = '0' + dateFormat);
        (hourFormat < 10) && (hourFormat = '0' + hourFormat);
        (minuteFormat < 10) && (minuteFormat = '0' + minuteFormat);
        (secondFormat < 10) && (secondFormat = '0' + secondFormat);

        switch (model) {
            case 1:
                reStr = year + '-' + monthFormat + '-' + dateFormat;
                break;

            case 2:
                reStr = year + '-' + monthFormat + '-' + dateFormat + " " + hourFormat + ":" + minuteFormat;
                break;

            case 3:
                reStr = year + '-' + monthFormat + '-' + dateFormat + " " + hourFormat + ":" + minuteFormat + ":" + secondFormat;
                break;

            case 4:
                nDNow = new Date();
                yearNow = nDNow.getFullYear();
                monthNow = nDNow.getMonth() + 1;
                dateNow = nDNow.getDate();
                hourNow = nDNow.getHours();
                minuteNow = nDNow.getMinutes();
                secondNow = nDNow.getSeconds();

                dayDiff = dateNow - date; // 相差几天
                monthDiff = monthNow - month; // 相差几年
                yearDiff = yearNow - year; // 相差几年

                if (yearDiff === 0) { // 今年发的
                    if (monthDiff === 0) { //这个月发的
                        if (dayDiff === 0) { // 今天发的
                            reStr = hourFormat + ":" + minuteFormat;
                        } else if (dayDiff === 1) { // 昨天发的
                            reStr = "昨天 " + hourFormat + ":" + minuteFormat;
                        } else if (dayDiff === 2) { //前天发的
                            reStr = "前天 " + hourFormat + ":" + minuteFormat;
                        } else {
                            reStr = month + "月" + date + "日 " + hourFormat + ":" + minuteFormat;
                        }
                    } else { //不是这个月发的
                        reStr = month + "月" + date + "日 " + hourFormat + ":" + minuteFormat;
                    }
                } else { // 非今年发的
                    reStr = year + "年" + month + "月" + date + "日 " + hourFormat + ":" + minuteFormat;
                }
                break;

            case 5:
                nDNow = new Date();
                yearNow = nDNow.getFullYear();
                monthNow = nDNow.getMonth() + 1;
                dateNow = nDNow.getDate();
                hourNow = nDNow.getHours();
                minuteNow = nDNow.getMinutes();
                secondNow = nDNow.getSeconds();

                dayDiff = dateNow - date; // 相差几天
                monthDiff = monthNow - month; // 相差几年
                yearDiff = yearNow - year; // 相差几年

                // 格式化 年份
                year = (year + '*').slice(-3, -1);

                if (yearDiff === 0) { // 今年发的
                    if (monthDiff === 0) { //这个月发的
                        if (dayDiff === 0) { // 今天发的
                            reStr = hourFormat + ":" + minuteFormat;
                        } else if (dayDiff === 1) { // 昨天发的
                            reStr = "昨天";
                        } else if (dayDiff === 2) { //前天发的
                            reStr = "前天";
                        } else {
                            reStr = month + "月" + date + "日";
                        }
                    } else { //不是这个月发的
                        reStr = month + "月" + date + "日";
                    }
                } else { // 非今年发的
                    reStr = year + "/" + month + "/" + date + "/";
                }
                break;

            case 6:
                reStr = year + '.' + monthFormat + '.' + dateFormat;
                break;

            case 7:
                reStr = year + '/' + monthFormat + '/' + dateFormat;
                break;

            default:
                reStr = year + '-' + monthFormat + '-' + dateFormat + " " + hourFormat + ":" + minuteFormat;
                break;
        }

        return reStr;
    };

    Q.ready(function() {

    });


    //=== 测试阶段 -start- ===
    F._reLoadData = function() {
        F.loadData({
            // loadData_isLoading: false,
        }, function() {
            
        });
    };

    // 编辑F.vue数据
    F._edit_F_vue = function(key, val) {
        F.vue[key] = val;
    };

    F._getPicture = function (callback) {
        var buttons = ['从相册选择图片', '拍照'];
        api.actionSheet({
            title: '获取方式',
            buttons: buttons,
            style: {
                itemPressColor: '#E1E1E1',
            },
        },function(ret, err) {
            var index = ret.buttonIndex;
            if (buttons.length === index - 1) {
                return false;
            }
            switch (index) {
                case 1:
                    api.getPicture({
                        encodingType: 'jpg',
                    }, function(ret, err) {
                        if (ret && ret.data) {
                            callback(ret.data);
                        } else {
                            callback('');
                        }
                    });
                    break;

                case 2:
                    api.getPicture({
                        sourceType: 'camera',
                        encodingType: 'jpg',
                    }, function(ret, err) {
                        if (ret && ret.data) {
                            callback(ret.data);
                        } else {
                            callback('');
                        }
                    });
                    break;

                default:
                    callback('');
                    break;
            }
        });
    };

    // 上传图片
    F._upload_img = function (params, callback) {
        F._postAPI({
            url: F._appupload,
            data: {
                files: {
                    files: params.files,
                },
            },
            _options: params.options,
        }, function(ret, err) {
            callback(ret, err);
            if (err) {
                Q.tips('网络错误');
            }
        });
    };

    /**
     * 批量上传图片
     * @Author   taichiyi
     * @DateTime 2017-08-03
     * @param    {Array}   data ['../img/1.jpg', '../img/2.jpg']
     * @param    {Function} callback 上传成功一张回调一次, 最后一次回调data为null
     * @return   {[type]}            [description]
     */
    F._batch_upload_img = function(data, callback) {

        function callback_for() {
            var index = 0;
            var result = [];

            function run() {
                if (index >= data.length) {
                    callback({
                        all_load: true,
                        data: null,
                    });
                    return false;
                }

                F._upload_img({
                    files: data[index],
                }, function(ret) {
                    if (ret.success) {

                        callback({
                            all_load: false,
                            local_url: data[index],
                            data: ret.data,
                        });
                    } else {
                        Q.tips('上传失败');
                    }
                    index += 1;
                    run();
                });
            }
            run();
        }
        callback_for();
    };
    //=== 测试阶段 -end- ===


    // 2222222222222222222222222
    //=== 当前项目 -start- ===
    F._IP = 'http://api.591jdb.cn/';

    // 会员接口
    F._passport = F._IP + 'passport.html'; // 登录
    F._passport_signup = F._IP + 'passport-signup.html'; // 注册
    F._passport_sendsms = F._IP + 'passport-sendsms.html'; // 获取短信
    F._passport_protocol = F._IP + 'passport-protocol.html'; // 获取注册协议
    F._passport_lost = F._IP + 'passport-lost.html'; // 修改密码第一步
    F._passport_lost2 = F._IP + 'passport-lost2.html'; // 修改密码第二步

    F._membercps = F._IP + 'membercps.html'; // 会员中心
    F._membercps_certificate = F._IP + 'membercps-certificate.html'; // 会员认证
    F._membercps_verify = F._IP + 'membercps-verify.html'; // 验证是否认证
    F._membercps_password = F._IP + 'membercps-password.html'; // 密码修改
    F._membercps_nickname = F._IP + 'membercps-nickname.html'; // 昵称修改

    // 订单接口
    F._membercps_order = F._IP + 'membercps-order.html'; // 订单列表
    F._membercps_orderdetails = F._IP + 'membercps-orderdetails.html'; // 订单详情

    // 商品市场
    F._membercps_shops = F._IP + 'membercps-shops.html'; // 店铺获取商品
    F._membercps_supplier = F._IP + 'membercps-supplier.html'; // 供应商列表
    F._membercps_addsupplier = F._IP + 'membercps-addsupplier.html'; // 供应商-添加
    F._membercps_addgoods = F._IP + 'membercps-addgoods.html'; // 添加商品
    F._membercps_editgoods = F._IP + 'membercps-editgoods.html'; // 编辑商品
    F._membercps_handle = F._IP + 'membercps-handle.html'; // 商品操作
    F._membercps_ajaxshops = F._IP + 'membercps-ajaxshops.html'; // 供应商店铺商品列表

    // 商品管理
    F._membercps_goods = F._IP + 'membercps-goods.html'; // 已上架商品
    F._membercps_offgoods = F._IP + 'membercps-offgoods.html'; // 已下架商品
    F._membercps_editgoods = F._IP + 'membercps-editgoods.html'; // 商品编辑

    // 粉丝管理
    F._membercps_fans = F._IP + 'membercps-fans.html'; // 粉丝列表
    F._membercps_send = F._IP + 'membercps-send.html'; // 发送消息
    F._membercps_message = F._IP + 'membercps-message.html'; // 消息列表
    F._membercps_messagedetail = F._IP + 'membercps-messagedetail.html'; // 消息详情

    // 报表统计
    F._membercps_dataorder = F._IP + 'membercps-dataorder.html'; // 订单统计
    F._membercps_datasales = F._IP + 'membercps-datasales.html'; // 营收统计
    F._membercps_salesrecord = F._IP + 'membercps-salesrecord.html'; // 销售记录

    // 资金管理
    F._membercps_money = F._IP + 'membercps-money.html'; // 资金管理
    F._membercps_withdraw = F._IP + 'membercps-withdraw.html'; // 提现资金
    F._membercps_withdrawdetails = F._IP + 'membercps-withdrawdetails.html'; // 提现明细
    F._membercps_record = F._IP + 'membercps-record.html'; // 收支明细
    F._membercps_recordadd = F._IP + 'membercps-recordadd.html'; // 入账明细
    F._membercps_recordcut = F._IP + 'membercps-recordcut.html'; // 支出明细
    F._membercps_finishsales = F._IP + 'membercps-finishsales.html'; // 已结算收入
    F._membercps_statisticssales = F._IP + 'membercps-statisticssales.html'; // 统计中的收入

    // 店铺管理
    F._membercps_shopcreate = F._IP + 'membercps-shopcreate.html'; // 创建店铺
    F._membercps_shoplogo = F._IP + 'membercps-shoplogo.html'; // 修改店铺LOGO
    F._membercps_shopbanner = F._IP + 'membercps-shopbanner.html'; // 修改店铺banner
    F._membercps_shopname = F._IP + 'membercps-shopname.html'; // 修改店铺名称
    F._membercps_shopintroduce = F._IP + 'membercps-shopintroduce.html'; // 修改店铺简介
    F._membercps_shopcate = F._IP + 'membercps-shopcate.html'; // 店铺分类列表
    F._membercps_shopcateedit = F._IP + 'membercps-shopcateedit.html'; // 店铺分类编辑
    F._membercps_shopinfo = F._IP + 'membercps-shopinfo.html'; // 分销店铺信息

    F._appupload = F._IP + 'index.php/site/attachment/shopupload/appupload/'; // 上传图片

    //=== 当前项目 -end- ===
});
