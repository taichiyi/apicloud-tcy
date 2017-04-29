console.log('load_ezapp');
define([
    // '../js/zepto1.2.0',
    // '../js/zepto-taichiyi',
    '../js/zepto-taichiyi-live',
], function() {
    console.log('run_ezapp');
    (function(window) {
        var Q;
        var readyCall;

        function extend(def_params, params) {
            // 覆盖默认参数
            var i;
            for (i in params) {
                if (params.hasOwnProperty(i)) {
                    def_params[i] = params[i];
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

        var tmpl = (function(b){var e=/(?:^|%>)([\s|\S]*?)(<%(?!\=)|$)/g,f=/(\"|\\)/g,g=/<%=([\s\S]*?)%>/g;return function(a,c,d){document.getElementById(a)&&(a=document.getElementById(a).innerHTML);a in b||(b[a]=a.replace(e,function(a,b){return';s.push("'+b.replace(f,"\\$1").replace(g,function(a,b){return'",'+b.replace(/\\"/g,'"')+',"'})+'");'}).replace(/\r|\n/g,""));a=Function("data","var s=[];"+b[a]+" return s.join('');");return d?$(d).html(a(c)):c?a(c):a}})({});

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
                slidBackEnabled: false,
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
                // var systemVersion = parseFloat(api.systemVersion);
                // if (systemVersion < 5) {
                if (1) {
                    default_json.animation = {
                        type: 'movein', //动画类型（详见动画类型常量）
                        subType: 'from_right', //动画子类型（详见动画子类型常量）
                        duration: 300 //动画过渡时间，默认300毫秒
                    }
                }
            }

            // 覆盖默认参数
            for (i in params) {
                if (params.hasOwnProperty(i) && i !== 'pageParam') {
                    default_json[i] = params[i];
                }
            }

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
                slidBackEnabled: false,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                useWKWebView: false,
                softInputMode: 'auto',
                bgColor: 'rgba(0,0,0,0.0)',
                delay: 0,
            }

            if (isIOS()) {
                default_json.delay = 0;
            } else {
                // default_json.animation = {
                //     type: 'movein', //动画类型（详见动画类型常量）
                //     subType: 'from_right', //动画子类型（详见动画子类型常量）
                //     duration: 300 //动画过渡时间，默认300毫秒
                // }
            }

            // 覆盖默认参数
            for (i in params) {
                if (params.hasOwnProperty(i) && i !== 'pageParam') {
                    default_json[i] = params[i];
                }
            }

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
                isLoading_native: true, //默认显示原生loading
                loading: { //原生loading默认参数
                    style: 'default',
                    animationType: 'fade',
                    title: '',
                    text: '',
                    modal: true
                }
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
                                // for (iii in options[ii]) { //三级
                                //     if (options[ii].hasOwnProperty(iii)) {
                                //         default_options[ii][iii] = options[ii][iii];
                                //     }
                                // }
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
                if (default_options.isLoading_native) {
                    api.hideProgress(); //避免多个loading卡死
                    api.showProgress({
                        title: default_options.loading.title,
                        text: default_options.loading.text,
                        modal: default_options.loading.modal,
                    });
                } else {
                    Q.showProgress();
                }
            }

            console.log(JSON.stringify(default_params));
            api.ajax(default_params, function(ret, err) {
                if (default_options.isLoading) {
                    if (default_options.isLoading_native) {
                        api.hideProgress();
                    } else {
                        Q.hideProgress();
                    }
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
            tmpl: tmpl,
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
                        // for (i in params) {
                        //     if (params.hasOwnProperty(i)) {
                        //         default_params[i] = params[i];
                        //     }
                        // }
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
                        // for (i in params) {
                        //     if (params.hasOwnProperty(i)) {
                        //         default_params[i] = params[i];
                        //     }
                        // }
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

                // api.hideProgress();
                api.showProgress({
                    title: '',
                    text: ''
                });
                return false;

                // 是否已有gazer-loading打开, 如果有就显示
                if ($('#gazer-loading-wrap').length !== 0) { //已有loading
                    $('#gazer-loading-wrap').show();
                    return false;
                }

                var i;
                var progress_top;
                var progress_left;
                var body_handle = $('body');
                var default_params = {
                    modal: true, //为true时,页面不可交互
                    height: 50,
                    width: 50
                };

                if ({}.toString.call(params) === 'object') {
                    extend(default_params, params);
                    // for (i in params) {
                    //     if (params.hasOwnProperty(i)) {
                    //         default_params[i] = params[i];
                    //     }
                    // }
                }

                if (default_params['modal'] === true) { //不可交互
                    body_handle.append('<div class="gazer-loading-wrap" id="gazer-loading-wrap"><div class="weui-loading" style="height:' + default_params.height + 'px;width:' + default_params.width + 'px;line-height:' + default_params.height + 'px;"></div></div>');

                } else { //可交互

                    progress_top = document.documentElement.clientHeight / 2 - parseInt(default_params.height) / 2;
                    progress_left = document.documentElement.clientWidth / 2 - parseInt(default_params.width) / 2;

                    body_handle.append('<div class="" id="gazer-loading-wrap" style="position: fixed;z-index: 999;top:' + progress_top + 'px;left:' + progress_left + 'px;"><div class="weui-loading" style="height:' + default_params.height + 'px;width:' + default_params.width + 'px;line-height:' + default_params.height + 'px;"></div></div>');

                }
            },
            hideProgress: function() {
                if (isPC()) return;

                api.hideProgress();
                return false;
                $('#gazer-loading-wrap').hide();
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
