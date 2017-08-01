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
                return name.slice(22, -5);
                // -end- 需要根据项目接口类型改变
            }
            return false;
        }

        request_name = get_suffix(url);

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

                if (!ret.error) {
                    return false;
                }

                switch (ret.error) {
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
                            msg: window.decodeURI(ret.error),
                            duration: 2000,
                            location: 'bottom'
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
            if (ret && ret.error !== '404') {
                callback(ret, err);
            } else {
                Q.hideProgress();
            }
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
        // if(!params.data.files) params.data.values.dosubmit = '1';

        Q.AJAX.post(params, function(ret, err) {
            console.log('====== DEBUG -start- ======');
            console.log(params.url);
            console.log(JSON.stringify(params.data));
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            console.log('====== DEBUG -end- ======');
            error_process(ret, err, params)
            if (ret && ret.error !== '404') {
                callback(ret, err);
            } else {
                Q.hideProgress();
            }
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
        data = data || {};
        Q.cache.set('isLogin', data);
        // Q.cache.set('user', data);
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
                // Q.cache.del("user");
                callback();
            }
        });
    };

    // 判断是否登录
    F._isLogin = function() {
        var user = Q.cache.get('isLogin');
        // var user = Q.cache.get('user');
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

    // 2222222222222222222222222
    //=== 当前项目 -start- ===
    F._IP = 'http://api.591jdb.com/';

    F._json_getbrand = F._IP + 'json-getbrand.html'; // 分类id获取品牌

    F._passportshop = F._IP + 'passportshop.html'; // 登录
    F._passportshop_signup = F._IP + 'passportshop-signup.html'; // 注册
    F._passportshop_sendsms = F._IP + 'passportshop-sendsms.html'; // 获取验证码
    F._passportshop_checkcode = F._IP + 'passportshop-checkcode.html'; // 注册验证码验证
    F._passportshop_lost = F._IP + 'passportshop-lost.html'; // 找回密码验证码验证
    F._passportshop_lost2 = F._IP + 'passportshop-lost2.html'; // 修改密码
    F._passportshop_protocol = F._IP + 'passportshop-protocol.html'; // 商家入驻协议

    F._shopadmin = F._IP + 'shopadmin.html'; // 商家中心 | 提交认证信息
    F._shopadmin_order = F._IP + 'shopadmin-order.html'; // 订单列表
    F._shopadmin_setting = F._IP + 'shopadmin-setting.html'; // 店铺配置。get->获取详情; post->提交数据
    F._shopadmin_orderdetail = F._IP + 'shopadmin-orderdetail.html'; // 订单详情
    F._shopadmin_templates = F._IP + 'shopadmin-templates.html'; // 快递模板列表
    F._shopadmin_templates_edit = F._IP + 'shopadmin-templates_edit.html'; // 编辑快递模板
    F._shopadmin_templates_remove = F._IP + 'shopadmin-templates_remove.html'; // 删除快递模板
    F._shopadmin_goods = F._IP + 'shopadmin-goods.html'; // 商品列表
    F._shopadmin_goods_handle = F._IP + 'shopadmin-goods_handle.html'; // 商品上架下架
    F._shopadmin_goods_delete = F._IP + 'shopadmin-goods_delete.html'; // 删除商品
    F._shopadmin_goods_edit = F._IP + 'shopadmin-goods_edit.html'; // 编辑商品
    F._shopadmin_goods_cate = F._IP + 'shopadmin-goods_cate.html'; // 商品分类列表
    F._shopadmin_goods_catelist = F._IP + 'shopadmin-goods_catelist.html'; // 店铺分类
    F._shopadmin_goods_params = F._IP + 'shopadmin-goods_params.html'; // 商品有哪些规格参数
    F._shopadmin_goods_getbrand = F._IP + 'shopadmin-goods_getbrand.html'; // 品牌列表
    F._shopadmin_goods_natureprops = F._IP + 'shopadmin-goods_natureprops.html'; // 商品自然属性列表
    F._shopadmin_goods_spec_props = F._IP + 'shopadmin-goods_spec_props.html'; // 商品规格
    F._shopadmin_goods_spec_selectprops = F._IP + 'shopadmin-goods_spec_selectprops.html'; // 获取-商品多规格
    F._shopadmin_goods_delcate = F._IP + 'shopadmin-goods_delcate.html'; // 删除分类
    F._shopadmin_order_godelivery = F._IP + 'shopadmin-order_godelivery.html'; // 发货
    F._shopadmin_goods_notice = F._IP + 'shopadmin-goods_notice.html'; // 库存报警设置
    F._shopadmin_comment = F._IP + 'shopadmin-comment.html'; // 评论列表
    F._shopadmin_commentreplay = F._IP + 'shopadmin-commentreplay.html'; // 评论详情/回复评论
    F._shopadmin_verify = F._IP + 'shopadmin-verify.html'; // 订单查询（询价单）
    F._shopadmin_verifydetail = F._IP + 'shopadmin-verifydetail.html'; // 询价单。get->获取详情; post->提交数据
    F._shopadmin_changeprice = F._IP + 'shopadmin-changeprice.html'; // 动态价格. post编辑；get详情
    F._shopadmin_aftersales = F._IP + 'shopadmin-aftersales.html'; // 售后列表(退换货)
    F._shopadmin_coupon = F._IP + 'shopadmin-coupon.html'; // 优惠券列表
    F._shopadmin_coupon_edit = F._IP + 'shopadmin-coupon_edit.html'; // 优惠券详情、编辑、添加
    F._shopadmin_coupon_remove = F._IP + 'shopadmin-coupon_remove.html'; // 删除优惠券
    F._shopadmin_aftersales_detail = F._IP + 'shopadmin-aftersales_detail.html'; // 售后详情
    F._shopadmin_images = F._IP + 'shopadmin-images.html'; // 图片管理
    F._shopadmin_stattrade = F._IP + 'shopadmin-stattrade.html'; // 交易分析数据
    F._shopadmin_sysbusiness = F._IP + 'shopadmin-sysbusiness.html'; // 业务数据分析
    F._shopadmin_itemtrade = F._IP + 'shopadmin-itemtrade.html'; // 商品销售数据分析
    F._shopadmin_sysstat = F._IP + 'shopadmin-sysstat.html'; // 商家运营概况
    F._shopadmin_sysstat = F._IP + 'shopadmin-sysstat.html'; // 商家运营概况
    F._shopadmin_certification = F._IP + 'shopadmin-certification.html'; // 资质证书列表
    F._shopadmin_editcertification = F._IP + 'shopadmin-editcertification.html'; // 资质证书，详情，添加
    F._shopadmin_settlement = F._IP + 'shopadmin-settlement.html'; // 商家结算汇总
    F._shopadmin_settlement_detail = F._IP + 'shopadmin-settlement_detail.html'; // 商家结算明细
    F._shopadmin_shopnotice = F._IP + 'shopadmin-shopnotice.html'; // 商家通知列表
    F._shopadmin_readshopnotice = F._IP + 'shopadmin-readshopnotice.html'; // 通知详情
    F._shopadmin_appeal = F._IP + 'shopadmin-appeal.html'; // 申诉列表
    F._shopadmin_appealdetail = F._IP + 'shopadmin-appealdetail.html'; // 申诉详情
    F._shopadmin_commentappeal = F._IP + 'shopadmin-commentappeal.html'; // 评论申诉详情/提交申诉
    F._shopadmin_scorecount = F._IP + 'shopadmin-scorecount.html'; // 评价概况
    F._shopadmin_delcert = F._IP + 'shopadmin-delcert.html'; // 资质证书-删除
    F._shopadmin_images_remove = F._IP + 'shopadmin-images_remove.html'; // 图片管理-删除
    F._shopadmin_batchupdateprice = F._IP + 'shopadmin-batchupdateprice.html'; // 批量修改价格-详情/编辑

    F._shopupload_init = F._IP + 'index.php/site/attachment/shopupload/init/'; // 数组级-上传图片地址
    F._shopupload_ajaxupload = F._IP + 'index.php/site/attachment/shopupload/ajaxupload/'; // 对象级-上传图片地址
    F._shopupload_videoupload = F._IP + 'index.php/site/attachment/shopupload/appvideoupload/'; // 上传视频地址

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
                        sourceType: 'library', // library图片库,camera相机,album相册
                        encodingType: 'jpg', // png.jpg
                        mediaValue: 'pic', //pic,video
                        destinationType: 'url',
                        allowEdit: true,
                        quality: 100,
                        saveToPhotoAlbum: false
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

    F._upload_img = function (params, callback) {
        F._postAPI({
            url: F._shopupload_ajaxupload,
            data: {
                files: {
                    upload_files: params.files,
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

    // 评论类型
    F._review_for_text = {
        'good': '好评',
        'neutral': '中评',
        'bad': '差评',
    };

    F._order_status = {
        "WAIT_BUYER_PAY": "待付款",
        "WAIT_SELLER_SEND_GOODS": "待发货",
        "WAIT_BUYER_CONFIRM_GOODS": "待收货",
        "TRADE_FINISHED": "已完成",
        "TRADE_CLOSED": "已关闭",
        "TRADE_CLOSED_BY_SYSTEM": "已关闭",
    };

    // 售后类型
    F._aftersales_type = {
        'ONLY_REFUND': '退款',
        'REFUND_GOODS': '退货',
        'EXCHANGING_GOODS': '换货',
    };

    // 申诉状态
    F._appeal_status = {
        'WAIT': '待平台处理',
        'SUCCESS': '申诉成功',
        'REJECT': '平台驳回',
        'CLOSE': '申诉关闭',
    };

    // 售后状态
    F._aftersales_status = {
        '1': '处理中',
        '2': '已处理',
        '3': '已驳回',
    };

    F._aftersales_progress = {
        '0': '等待商家处理',
        '1': '消费者回寄，等待商家收货确认',
        '2': '卖家已发货',
        '3': '商家已驳回',
        '4': '商家已处理',
        '5': '商家确认收货',
        '6': '平台驳回退款申请',
        '7': '平台已处理退款申请',
        '8': '等待平台处理',
    };

    //=== 当前项目 -end- ===
});
