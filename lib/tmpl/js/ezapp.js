console.log('load_ezapp');
define([
    // '../js/zepto1.2.0',
    '../js/zepto-tcy',
], function() {
    console.log('run_ezapp');
    (function(window) {
        var Q;
        var readyCall;

        // 判断变量类型
        function type(obj) {
            /*
                数值：返回 number
                字符串：返回 string
                布尔值：返回 boolean
                undefined：返回 undefined
                null：返回 null
                数组：返回 array
                arguments对象：返回 arguments
                函数：返回 function
                Error对象：返回 error
                Date对象：返回 date
                RegExp对象：返回 regexp
                其他对象：返回 object
            */
            var i;
            var str = {}.toString.call(obj);
            var str_length = {}.toString.call(obj).length;
            for (i = 0; i < str_length; i += 1) {
                if (str[i] === ' ') {
                    return str.slice(i + 1, -1).toLowerCase();
                }
            }
            return str;
        }

        // 对象合并, 支持多维对象, 不支持二维数组
        function extend(def_params, params) {
            var i;

            for (i in params) {
                if (params.hasOwnProperty(i)) {
                    if (def_params[i] !== undefined && type(params[i]) === 'object') {
                        extend(def_params[i], params[i]);
                    } else {
                        def_params[i] = params[i];
                    }
                }
            }
        }

        var cache = {
            set: function(k, v) {
                if (typeof(v) == 'object') {
                    v = 'obj-' + JSON.stringify(v);
                } else {
                    v = 'str-' + v;
                }
                localStorage.setItem(k, v);
            },
            get: function(k) {
                var v = localStorage.getItem(k);
                if (v == null) {
                    return;
                }
                if (v.indexOf('obj-') === 0) {
                    v = v.slice(4);
                    return JSON.parse(v);
                } else if (v.indexOf('str-') === 0) {
                    return v.slice(4);
                }
            },
            del: function(k) {
                return localStorage.removeItem(k);
            },
            cle: function() {
                return localStorage.clear();
            }
        };

        function isIOS() {
            if (isPC()) return false;
            // return /iP(ad|hone|od)/.test(window.navigator.userAgent);
            return api.systemType === 'ios';
        }

        function isFunction(obj) {
            return type(obj) === "function";
        }

        function isArray(v) {
            //是否数组
            return Array.isArray(v);
        }

        // api对象是否已经加载
        function isApiready() {
            return typeof api !== 'undefined';
        }

        // 是否为电脑
        function isPC() {
            return window.navigator.platform === "Win32" || window.navigator.platform === "MacIntel";
        }

        // 打开window
        function openWin(params) {
            var i, cacheName, default_json;
            if (typeof params === 'string') { //如果是字符串, 就认为是window的name
                params = {
                    name: params,
                    url: params + '.html'
                };
            } else if (type(params) !== 'object') { //非法参数
                console.error('参数非法');
                return false;
            }

            default_json = {
                name: params.name,
                url: params.name + '.html',
                bounces: false,
                slidBackEnabled: true,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                useWKWebView: false,
                softInputMode: 'pan',
                bgColor: '#f7f8f9',
                duration: 300,
                delay: 0,
            }

            if (isIOS()) {
                default_json.delay = 0;
            } else {
                default_json.animation = {
                    type: 'movein', //动画类型（详见动画类型常量）
                    subType: 'from_right', //动画子类型（详见动画子类型常量）
                    duration: 300 //动画过渡时间
                }
            }

            // 覆盖默认参数
            extend(default_json, params);

            /**
             * 为当前window设置个名为windowName+Params的数组储存在localstorage里
             * 每个数组默认有from这个属性,当一个window有多个入口时,"from"这个属性非常有用
             */
            cacheName = params.name + 'Params';
            if (type(params.pageParam) === 'object') {

                if (params.pageParam.from === undefined) {
                    params.pageParam.from = api.frameName || api.winName;
                }
            } else { //没传pageParam参数
                params.pageParam = {};
                params.pageParam.from = api.frameName || api.winName;
            }

            Q.cache.set(cacheName, params.pageParam);

            console.log(JSON.stringify(default_json));
            api.openWin(default_json);
        }

        // 打开单个Frame
        function openFrame(params) {
            var i;
            var cacheName;
            var default_json;
            if (typeof params === 'string') { //如果是字符串, 就认为是window的name
                params = {
                    name: params,
                    url: params + '.html'
                };
            } else if (type(params) !== 'object') { //非法参数
                console.error('参数非法');
                return false;
            }

            default_json = {
                name: params.name,
                url: params.name + '.html',
                bounces: false,
                slidBackEnabled: false,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                useWKWebView: false,
                softInputMode: 'auto',
                bgColor: 'rgba(0, 0, 0, 0.0)',
                delay: 0,
            }

            // 覆盖默认参数
            extend(default_json, params);

            /**
             * 为当前window设置个名为windowName+Params的数组储存在localstorage里
             * 每个数组默认有from这个属性,当一个window有多个入口时,"from"这个属性非常有用
             */
            cacheName = params.name + 'Params';
            if (type(params.pageParam) === 'object') {

                if (params.pageParam.from === undefined) {
                    params.pageParam.from = api.frameName || api.winName;
                }
            } else { //没传pageParam参数
                params.pageParam = {};
                params.pageParam.from = api.frameName || api.winName;
            }

            Q.cache.set(cacheName, params.pageParam);

            console.log(JSON.stringify(default_json));
            api.openFrame(default_json);
        }

        // ajax核心代码
        function ajax_core(params, callback) {
            var i, ii, iii;
            var default_params = {
                url: '',
                tag: null,
                method: 'get',
                cache: false,
                timeout: 14, //默认为30秒
                dataType: 'json',
                charset: 'utf-8',
                report: false,
                returnAll: false,
            };
            var default_options = {
                isLoading: true, //默认加载时,显示loadding
            };

            // 编辑default_options的默认值
            function edit_default_options(options) {
                if (Q.type(options) === 'object' && Object.keys(options).length) {
                    for (ii in options) { //二级
                        if (options.hasOwnProperty(ii)) {
                            if (i !== 'loading') {
                                default_options[ii] = options[ii];
                            } else {
                                extend(default_options, options[ii]);
                            }
                        }
                    }
                }
            }

            // 参数是否为对象,并且不能为空
            if (Q.type(params) === 'object' && Object.keys(params).length) {
                for (i in params) { //一级
                    if (params.hasOwnProperty(i)) {

                        if (i !== '_options') {

                            default_params[i] = params[i];

                        } else {

                            // 编辑default_options的默认值
                            edit_default_options(params._options);

                        }
                    }
                }
            }

            // 判断是否显示loading
            if (default_options.isLoading) {
                Q.showProgress(default_options)
            }

            console.log(JSON.stringify(default_params));
            api.ajax(default_params, function(ret, err) {
                if (default_options.isLoading) {
                    Q.hideProgress();
                }
                callback(ret, err);
            });
        }

        // 执行readyCall对象里的函数
        function runReadyCall() {
            var i;
            if (isArray(readyCall)) {
                for (i = 0; i < readyCall.length; i += 1) {
                    readyCall[i]();
                }
                // 清空
                readyCall.splice(0, readyCall.length);
            }
        }

        //页面加载完毕时
        function uexOnload() {

            // 如果是window窗口则适配沉浸式
            // !api.frameName && Q.fixIos7Bar();

            // 打开子frame
            Q.fixIframe();

            // 执行readyCall对象里的函数
            runReadyCall();
        }

        // 返回该设备状态栏沉浸的高度
        function statusBarHeight() {
            var barHeight;

            // 为了方便在电脑浏览器中调试
            if (isPC()) return 25;

            if (!isApiready) return false;

            if (isIOS()) {
                if (api.statusBarAppearance) {
                    barHeight = 20;
                } else {
                    barHeight = 0;
                }
            } else {
                if (api.statusBarAppearance) {
                    barHeight = 25;
                } else {
                    barHeight = 0;
                }
            }

            return barHeight;
        }

        Q = {
            isPC: isPC,
            isIOS: isIOS,
            isArray: isArray,
            isFunction: isFunction,
            isApiready: isApiready,
            type: type,
            cache: cache,
            extend: extend,
            openWin: openWin,
            openFrame: openFrame,
            statusBarHeight: statusBarHeight,
            AJAX: {
                get: function(params, callback) {
                    var i;
                    var default_params = {
                        method: 'get',
                    };

                    if (Q.type(params) === 'object' && Object.keys(params).length) {
                        extend(default_params, params);
                    }

                    ajax_core(default_params, callback);
                },
                post: function(params, callback) {
                    var i;
                    var default_params = {
                        method: 'post'
                    };

                    if (Q.type(params) === 'object' && Object.keys(params).length) {
                        extend(default_params, params);
                    }

                    ajax_core(default_params, callback);
                }
            },
            fixIos7Bar: function() {
                var height = statusBarHeight();
                $('#ezHeader').css('padding-top', height + 'px');
            },
            fixIframe: function() {
                var iframe_handle = $('#iframe');
                var ezHeader_height;
                if (iframe_handle.length !== 0) { //需要打开子frame
                    ezHeader_height = $('#ezHeader').height();

                    if (isIOS()) {
                        openFrame({
                            name: iframe_handle.data('name') + '',
                            rect: {
                                x: 0,
                                y: ezHeader_height,
                                w: document.documentElement.clientWidth,
                                h: document.documentElement.clientHeight - ezHeader_height
                            },
                            animation: {
                                // type: 'fade',
                                // duration: 140,
                                type: 'none',
                                duration: 0,
                            }
                        });
                    } else {
                        window.setTimeout(function() {
                            openFrame({
                                name: iframe_handle.data('name') + '',
                                rect: {
                                    x: 0,
                                    y: ezHeader_height,
                                    w: document.documentElement.clientWidth,
                                    h: document.documentElement.clientHeight - ezHeader_height
                                },
                                animation: {
                                    type: 'none',
                                    duration: 0,
                                    // type: 'fade',
                                    // duration: 140,
                                }
                            });
                        }, 360);
                    }
                }
            },
            loadFile: function(params, callback) {
                // 异步加载本地文件
                var ret = {
                    status: true,
                    data: {}
                };
                var err = {
                    msg: ''
                };
                var suffix; //文件后缀
                var xmlHttp;

                // 获取文件名后缀
                function get_suffix(name) {
                    var i;
                    var nameLength = name.length - 1;
                    for (i = nameLength; i > 0; i -= 1) {
                        if (i > 100) {
                            return name;
                        }
                        if (name[i] === '.') {
                            name += '!';
                            return name.slice(i + 1, -1);
                        }
                    }
                    return false;
                }

                if (!params || !params.url) {
                    ret.status = false;
                    err.msg = 'url参数错误';
                    return callback(ret, err);
                }

                xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", params.url, false);
                xmlHttp.send(null);

                if (xmlHttp.responseText.slice(0, 5) === '<?xml') {
                    ret.status = false;
                    err.msg = '获取文件失败, 请检查url是否有效';
                    return callback(ret, err);
                }

                suffix = get_suffix(params.url);
                switch (suffix) {
                    case 'json':
                        ret.data = eval('(' + xmlHttp.responseText + ')');
                        return callback(ret, err);
                        break;
                    case false:
                        ret.status = false;
                        err.msg = '不是有效的url';
                        return callback(ret, err);

                    default:
                        ret.data = xmlHttp.responseText;
                        return callback(ret, err);
                }
            },
            ready: function(callback) {
                readyCall = readyCall || [];
                readyCall.push(callback);
                if (isApiready()) {
                    runReadyCall();
                }

                // 为了方便在电脑浏览器中调试
                if (isPC()) {
                    runReadyCall();
                }
            },
            showProgress: function(params) {
                if (isPC()) return;
                console.log(JSON.stringify(params));
                var default_params = {
                    loading: { //原生loading默认参数
                        style: 'default',
                        animationType: 'fade',
                        title: '',
                        text: '',
                        modal: true
                    },
                    UILoading: {
                        size: 30,
                        mask: 'rgba(0, 0, 0, 0.0)',
                        fixed: true,
                    },
                    isDefault: false,
                };
                extend(default_params, params);
                console.log(JSON.stringify(default_params));

                if (default_params.isDefault) {
                    F.__isDefault = true;
                    api.showProgress(default_params.loading)
                } else {
                    F.__isDefault = false;

                    F.__UILoading = F.__UILoading || api.require('UILoading');
                    F.__UILoading.flower(default_params.UILoading, function(ret) {
                        function add_id() {
                            F.__UILoading_ids.push(ret.id);
                            console.log('__UILoading_ids__UILoading_ids__UILoading_ids__UILoading_ids__UILoading_ids__UILoading_ids');
                            console.log(JSON.stringify(F.__UILoading_ids));
                        }
                        if (Q.type(F.__UILoading_ids) !== 'array') {
                            F.__UILoading_ids = [];
                            add_id();
                        } else {
                            add_id();
                        }
                    });
                }
            },
            hideProgress: function() {
                if (isPC()) return;
                if (F.__isDefault) {
                    api.hideProgress();
                } else {
                    if (!F.__UILoading) return false;

                    if (!F.__UILoading_ids) return false;

                    function clear_all() {
                        var i;
                        for(i = 0; i < F.__UILoading_ids.length; i += 1) {
                            console.log('__clear_all__clear_all__clear_all__clear_all__clear_all__clear_all');
                            console.log(F.__UILoading_ids[i]);
                            F.__UILoading.closeFlower({
                                id: F.__UILoading_ids[i]
                            });
                        }
                        F.__UILoading_ids = [];
                    }
                    clear_all();
                }
            },
            pageParam: function() {
                if (isPC()) return;

                return cache.get(api.winName + 'Params');
            },
            tips: function(params) {
                if (isPC()) return;

                var i;
                var default_json = {
                    msg: '',
                    duration: 2000,
                    location: 'middle',
                };

                if ({}.toString.call(params) !== '[object Object]') {
                    default_json.msg = params;
                } else {
                    extend(default_json, params);
                }

                api.toast(default_json);
            }
        }

        window.Q = Q;

        if (isApiready()) { //api对象已经加载
            if (!window._apiOnload_) {
                window._apiOnload_ = true;
                uexOnload();
            }
        } else {
            apiready = function() {
                if (!window._apiOnload_) {
                    window._apiOnload_ = true;
                    uexOnload();
                }
            };

        }
    }(window));
});
