console.log('load_common');
define(['../js/ezapp'], function() {
    console.log('run_common');
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
    
    更多例子:
        文件为window:
            单个单词: login.html
            多个单词: my-info.html, my-info-edit.html

        文件为frame:
            和window绑定: login_cont.html, my-info-edit_cont.html
            
            没绑定: _tips.html,  _index-qr.html

    === 文件命名规则 -end- ===
    */

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

        // 需要检查权限
        switch (check_type) {
            case 'login':
                is_login();
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

            console.log(JSON.stringify(params_str));

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
                if (name[i] === '0') {
                    name += ' ';
                    return name.slice(i + 2, -1);
                }
                // -end- 需要根据项目接口类型改变
            }
            return false;
        }

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
            }, 1200);
        });
    }

    F._callAPI = function(params, callback) {
        if (F._use_static_data) {
            get_static_data(params, function(ret) {
                callback(ret);
            });
            return false;
        }

        var i;
        var url = '';
        var data = params._data || {};
        data.partner = '67ba8f2a8b0213def32e45e3064ffd14';
        // data.key = Q.cache.get('user') ? Q.cache.get('user')['token'] : '';
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
            if (err) {
                api.toast({
                    msg: '网络连接不可用, 请稍后重试',
                    duration: 2000,
                    location: 'bottom'
                });
            } else {
                if (!(params._options && params._options.is_error_tips === false)) {
                    if (ret.error !== 0) {
                        console.log(window.decodeURI(ret.errmsg));
                        api.toast({
                            msg: window.decodeURI(ret.errmsg),
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                }
            }
            // if (err) {
            //     api.toast({
            //         msg: err.msg,
            //         duration: 2000,
            //         location: 'bottom'
            //     });
            // }
            callback(ret, err);
        });
    };

    F._postAPI = function(params, callback) {
        if (params.data) {
            if (params.data.values) {
                params.data.values.key = Q.cache.get('user') ? Q.cache.get('user')['token'] : '';
            } else {
                params.data.values = {
                    key: Q.cache.get('user')['token']
                }
            }
        } else {
            params.data = {
                values: {
                    key: Q.cache.get('user')['token']
                }
            }
        }

        Q.AJAX.post(params, function(ret, err) {
            console.log('====== DEBUG -start- ======');
            console.log(params.url);
            console.log(JSON.stringify(params.data));
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            console.log('====== DEBUG -end- ======');
            if (err) {
                api.toast({
                    msg: err.msg,
                    duration: 2000,
                    location: 'bottom'
                });
            }
            callback(ret, err);
        });
    };

    F._callUpload = function(params, callback) {
        var data = params._data || {};
        var files = params._files || {};
        params.data.value = data;
        params.data.files = files;
        Q.AJAX.post(params, function(ret, err) {
            console.log('====== DEBUG -start- ======');
            console.log(params.url);
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(params.data));
            console.log('====== DEBUG -end- ======');
            console.log(JSON.stringify(err));
            if (ret.code === 400) {
                if (ret.login) {
                    Q.openWin('login');
                } else {
                    F._tips(ret.datas.error);
                }
            }
            if (err) {
                api.toast({
                    msg: err.msg,
                    duration: 2000,
                    location: 'bottom'
                });
            }
            callback(ret, err);
        });
    };

    // 默认头像
    F._getAvatar = function(avatar) {
        var random = "?" + (+new Date());
        if (avatar.indexOf('http://') == -1) {
            return (avatar ? F._IMG_URL + avatar : '../img/' + F._AVATAR_IMG_DEF);
        } else {
            return avatar + random;
        }
    };

    // 解码
    F._deURI = function(val) {
        return window.decodeURIComponent(val);
    };

    // 登录
    F._login = function(data) {
        Q.cache.set('user', data);
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
                Q.cache.set("user", 'undefined');
                callback();
                window.setTimeout(function() {
                    api.closeWin();
                }, 600);
            }
        });
    };

    // 判断是否登录
    F._isLogin = function() {
        var user = Q.cache.get('user');
        console.log(JSON.stringify(user));
        if ((typeof user !== 'undefined') && (user.valid === true)) {
            // 登录
            return true;
        } else {
            // 未登录
            return false;
        }
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

            default:
                reStr = year + '-' + monthFormat + '-' + dateFormat + " " + hourFormat + ":" + minuteFormat;
                break;
        }

        return reStr;
    };

    Q.ready(function() {
        // 点击运行函数
        // $('.js_func').live('click', function() {
        //     var self = $(this);
        //     var name = self.data('func-name');

        //     if (name !== '' && name !== undefined) { //判断变量是否添加
        //         name = name + '';
        //         eval(name);
        //     } else {
        //         console.log('未定义方法');
        //     }
        // });
    });

    //=== 当前项目 -start- ===
    F._IP = 'http://m.oakev.cn:7290/';
    F._acc_userinfo = F._IP + 'account/m_userinfo'; // 用户信息   =(文档未提供)=
    F._acc_create = F._IP + 'account/m_create'; // 注册   =(因为验证码接口未实现)=
    F._acc_login = F._IP + 'account/m_login'; // 登陆   =(OK)=
    F._acc_logout = F._IP + 'account/m_logout'; // 注销   =(UN, 貌似用不到)=
    F._acc_add_card = F._IP + 'account/m_add_card'; // 添加充电卡   =(OK, 缺少"姓名"参数)=
    F._acc_del_card = F._IP + 'account/m_del_card'; // 删除充电卡   =(UN, 没有充电卡列表, 所以没法写)=
    F._acc_modify = F._IP + 'account/m_modify'; // 修改信息   =(OK, 缺少"用户名"参数)=
    F._acc_reset_password = F._IP + 'account/m_reset_password'; // 修改密码   =(OK)=
    F._acc_paylist = F._IP + 'account/m_paylist'; // 获取支付列表(充值)   =(OK)=
    F._acc_deals = F._IP + 'account/m_deals'; // 订单记录   =(NO, 接口未实现)=
    F._acc_query_deal = F._IP + 'account/m_query_deal'; // 查询订单   =(NO, 接口未实现)=
    F._acc_cancel_deal = F._IP + 'account/m_cancel_deal'; // 取消订单   =(NO, 接口未实现)=
    F._acc_charge_record = F._IP + 'account/m_charge_record'; // 充电记录   =(OK, 无法添加充电任务, 所以而且没数据)=
    F._acc_bill_record = F._IP + 'account/m_bill_record'; // 充值记录   =(OK, 因为无法充值, 而且没数据)=
    F._acc_session = F._IP + 'account/m_session'; // 充电任务   =(OK, 因为无法添加充电任务, 所以没法测)=
    F._acc_recommend = F._IP + 'account/m_recommend'; // 意见反馈   =(OK)=
    F._sta_location = F._IP + 'station/m_location'; // 充电站查找   =(NO, 总是返回'无效类别')=
    F._sta_submit_comment = F._IP + 'station/m_submit_comment'; // 发表评论   =(NO, 橡树没有提供充电桩ID, 所以无法测试, 总是返回'无效类别')=
    F._cha_state = F._IP + 'charger/m_state'; // 电桩/枪充电状态   =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_stop = F._IP + 'charger/m_stop'; // 停止充电    =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_start = F._IP + 'charger/m_start'; // 开始充电    =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_order = F._IP + 'charger/m_order'; // 电桩预约    =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_rate = F._IP + 'charger/m_rate'; // 获取某个充电桩的充电价格    =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_info = F._IP + 'charger/m_info'; // 获取电桩信息     =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_location = F._IP + 'charger/m_location'; // 电桩查找     =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._cha_charger = F._IP + 'charger/m_charger'; // 充电站桩列表     =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._sta_photo = F._IP + 'station/m_photo'; // 充电站图片     =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._sta_comment = F._IP + 'station/m_comment'; // 充电站评论     =(NO, 橡树没有提供充电桩ID, 所以无法测试)=
    F._sms_send_code = F._IP + 'sms/m_send_code'; // 获取验证码 (暂时不可用)
    F._sms_verify_code = F._IP + 'sms/m_verify_code'; // 检查验证码 (暂时不可用)
    F._app_update = F._IP + 'app/m_update'; // 检查新版本 (用不到)
    F._alipay_pay = F._IP + 'alipay/pay.php'; // 支付宝下单
    F._wxpay_pay = F._IP + 'wxpay/pay.php'; // 微信下单


    F._edit_ellipsis = function(str, number) {
        var before_str;
        var after_str;
        str = str || '';
        number = number || 11;

        if (str.length > number) {
            str += 'X';
            before_str = str.slice(0, 5);
            after_str = str.slice(-6, -1);
            str = before_str + '...' + after_str;
        }

        return str;
    };

    F._dot_ing = function(elem, max_length) {
        max_length = max_length || 6;
        var dot_content = elem.data('content');
        if (dot_content === undefined) elem.data('content', '');
        dot_content = '';
        var dot_length = dot_content.length;
        if (!elem.hasClass('js_dot')) elem.addClass('js_dot');
        var setTimeoutID;

        function run() {
            var i;
            var html = '';

            dot_content = elem.data('content');
            dot_length = dot_content.length;

            for (i = 0; i <= dot_length; i += 1) {
                html += '.';
            }

            elem.data('content', html);

            if (dot_length === max_length) {
                elem.data('content', '.');
            }
        }

        function start() {
            setTimeoutID = window.setInterval(function() {
                run();
            }, 300);
        }

        function end() {
            window.clearInterval(setTimeoutID);
        }

        return {
            start: start,
            end: end,
        }
    };

    // 数组合并, 这种方式合并会触发vue的监听
    F._push_array = function (a, b) {
        b = b || [];
        var i;
        var c = a;
        for (i = 0; i < b.length; i += 1) {
            c.push(b[i]);
        }
        a = c;
    }

    // 判断是否已安装某个app
    function appInstalled(params, callback) {
        api.appInstalled({
            appBundle: api.systemType === 'ios' ? params.ios : params.android,
        }, function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            callback(ret, err);
        });
    }

    // 打开APP导航
    F._open_nav = function() {

        function open() {
            // 113.56164458447934
            // 34.79788697849975
            var destinationLat = 35.79788697849975;
            var destinationLon = 114.56164458447934;
            var uri = "";
            uri += 'androidamap://route?';
            uri += 'sourceApplication=' + api.appName;
            uri += '&poiname=';
            uri += '&dlat=' + destinationLat + '&dlon=' + destinationLon;
            uri += '&dev=0';
            uri += '&t=2';
            console.log(uri);

            api.openApp({
                androidPkg: 'android.intent.action.VIEW',
                appParam: {
                    dlat: destinationLat,
                    dlon: destinationLon,
                    dev: '0',
                    t: '0',
                    sourceApplication: api.appName,
                },
                uri: uri,
                iosUrl: 'iosamap://path',
                // iosUrl: 'iosamap://navi',
            }, function(ret, err) {
                if (ret) {
                    // alert(JSON.stringify(ret));
                } else {
                    // alert(JSON.stringify(err));
                }
            });
        }

        appInstalled({
            // 高德地图
            ios: 'iosamap://',
            android: 'com.autonavi.minimap'

            // 百度地图
            // ios: 'baidumap://',
            // android: 'com.baidu.BaiduMap',
        }, function(ret) {
            if (ret.installed) {
                //应用已安装
                open();
            } else {
                //应用未安装
                api.alert({
                    title: '没有安装高德地图',
                    msg: '导航需要使用高德地图'
                });
            }
        });
    };

    // 点赞
    F._support = function(self) {
        self = $(self);
        var review__row1_support_number_handle = self.find('.js_review__row1-support-number');
        var number = +review__row1_support_number_handle.data('number');

        if (self.hasClass('review__row1-support_support')) {
            self.removeClass('review__row1-support_support');
            review__row1_support_number_handle.data('number', number - 1).html(number - 1);
            Q.tips('取消点赞');
        } else {
            self.addClass('review__row1-support_support');
            review__row1_support_number_handle.data('number', number + 1).html(number + 1);
            Q.tips('点赞成功');
        }
    };

    // 添加评论
    F._add_review = function(name) {
        Q.openFrame({
            name: name,
            bgColor: 'rgba(0, 0, 0, .4)',
            animation: {
                // type: 'movein',
                subType: 'from_bottom'
            }
        });
    };

    // 打电话
    F._call = function(tel) {
        api.call({
            number: tel || '0511-88668630'
        });
    };

    //=== 当前项目 -end- ===
});
