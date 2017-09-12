/* Zepto v1.2.0 - simplify MIT
     modifier: taichiyi
 */
(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(global)
        });
    } else {
        factory(global)
    }
}(this, function(window) {
    "use strict";
    var Zepto = (function() {

        var $;

        var emptyArray = [];

        var slice = emptyArray.slice;

        var document = window.document;

        var class2type = {};

        var toString = class2type.toString;

        var zepto = {};

        var capitalRE = /([A-Z])/g;

        var simpleSelectorRE = /^[\w-]*$/;

        var propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        };


        function isFunction(value) {
            return toString.call(value) === "[object Function]";
        }

        // 判断该元素是否有className
        function hasClass(el, className) {
            var i;
            for (i = 0; i < el.classList.length; i += 1) {
                if (el.classList[i] === className) {
                    return true;
                }
            }
            return false;
        }

        function setAttribute(node, name, value) {
            value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
        }

        function funcArg(context, arg, idx, payload) {
            return isFunction(arg) ? arg.call(context, idx, payload) : arg
        }

        // for循环
        function foreach_callback(array, callback) {
            var i;
            for (i = 0; i < array.length; i += 1) {
                callback(array[i]);
            }
        }

        function Z(dom, selector) {
            var i,
                len = dom ? dom.length : 0;

            for (i = 0; i < len; i += 1) {
                this[i] = dom[i];
            }
            this.length = len;
            this.selector = selector || '';
        }

        zepto.Z = function(dom, selector) {
            return new Z(dom, selector);
        }

        zepto.isZ = function(object) {
            return object instanceof zepto.Z;
        }
        zepto.qsa = function(element, selector) {
            var found,
                maybeID = selector[0] === "#",
                maybeClass = !maybeID && selector[0] === ".",
                nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
                isSimple = simpleSelectorRE.test(nameOnly);

            if (element.getElementById && maybeID) {
                // 选择器为ID
                if (found = element.getElementById(nameOnly)) {
                    // 找到
                    return [found];
                } else {
                    // 没找到
                    return [];
                }
            } else {
                if (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) {
                    return [];
                } else {
                    if (isSimple && !maybeID && element.getElementsByClassName) {
                        if (maybeClass) {
                            return slice.call(element.getElementsByClassName(nameOnly));
                        } else {
                            return slice.call(element.getElementsByTagName(nameOnly));
                        }
                    } else {
                        return slice.call(element.querySelectorAll(selector));
                    }
                }
            }
        }

        zepto.init = function(selector) {
            var dom; //存放选择找到的全部元素
            if (!selector) {
                return zepto.Z();
            } else {
                // 选择器参数为字符串
                if (typeof selector === "string") {
                    selector = selector.trim();
                    dom = zepto.qsa(document, selector);
                } else if (Array.isArray(selector)) {
                    dom = selector, selector = null
                } else if (typeof selector === "object") {
                    dom = [selector], selector = null
                } else {
                    return zepto.Z();
                }
            }
            return zepto.Z(dom, selector);
        }

        $ = function(selector) {
            return zepto.init(selector)
        }

        if (window.JSON) {
            $.parseJSON = JSON.parse;
        }

        $.fn = {
            constructor: zepto.Z,
            length: 0,

            forEach: emptyArray.forEach,
            // reduce: emptyArray.reduce,
            // push: emptyArray.push,
            // sort: emptyArray.sort,
            // splice: emptyArray.splice,
            // indexOf: emptyArray.indexOf,
            append: function(html) {
                // taichiyi
                // 在结束标签之前插入字符串
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }

                var regexp = /<script(?: type="text\/javascript")?>([^]+?)<\/script>/i;
                var match = html.match(regexp);
                if (match && match.length >= 2) {
                    window.eval(match[1]);
                }

                this[0].insertAdjacentHTML('beforeend', html);
                return this[0];
            },
            before: function(html) {
                // taichiyi
                // 在开始标签之前插入html字符串
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }

                var regexp = /<script(?: type="text\/javascript")?>([^]+?)<\/script>/i;
                var match = html.match(regexp);
                if (match && match.length >= 2) {
                    window.eval(match[1]);
                }

                this[0].insertAdjacentHTML('beforebegin', html);
                return this[0];
            },
            prepend: function(html) {
                // taichiyi
                // 在开始标签之后插入字符串
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }

                var regexp = /<script(?: type="text\/javascript")?>([^]+?)<\/script>/i;
                var match = html.match(regexp);
                if (match && match.length >= 2) {
                    window.eval(match[1]);
                }

                this[0].insertAdjacentHTML('afterbegin', html);
                return this[0];
            },
            after: function(html) {
                // taichiyi
                // 在结束标签之后插入html字符串
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }

                var regexp = /<script(?: type="text\/javascript")?>([^]+?)<\/script>/i;
                var match = html.match(regexp);
                if (match && match.length >= 2) {
                    window.eval(match[1]);
                }

                this[0].insertAdjacentHTML('afterend', html);
                return this[0];
            },
            slice: function() {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return $(slice.apply(this, arguments))
            },
            // ready: function(callback) {
            //     // 兼容-taichiyi
            //     document.addEventListener('DOMContentLoaded', function() {
            //         callback($);
            //     }, false)

            //     return this;
            // },
            get: function(idx) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
            },
            // toArray: function() {
            //     return this.get()
            // },
            size: function() {
                return this.length
            },
            remove: function() {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return this.each(function() {
                    if (this.parentNode != null)
                        this.parentNode.removeChild(this)
                })
            },
            // isEmptyObject: function(obj) {
            //     var name;
            //     for (name in obj) {
            //         return false;
            //     }
            //     return true;
            // },
            each: function(callback) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                emptyArray.every.call(this, function(el, idx) {
                    return callback.call(el, idx, el) !== false
                });
                return this;
            },
            eq: function(idx) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
            },
            find: function(selector) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                if (typeof selector !== 'string') return $();

                var i;
                var result;
                var dom = [];

                // 递归查找子元素
                function childrens(el, selector) {
                    var i, ii;
                    for (i = 0; i < el.children.length; i += 1) {

                        childrens(el.children[i], selector);
                        if (selector[0] === '.') {
                            for (ii = 0; ii < el.children[i].classList.length; ii += 1) {
                                if (el.children[i].classList[ii] === selector.slice(1)) {
                                    dom.push(el.children[i]);
                                    break;
                                }
                            }

                        } else if (selector[0] === '#') {

                            if (el.children[i].id === selector.slice(1)) {
                                dom.push(el.children[i]);
                            }

                        }

                    }
                }

                this.forEach(function(el, index) {
                    childrens(el, selector);
                });
                result = zepto.Z(dom, selector);

                return result;
            },
            parent: function() {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return zepto.Z([this[0].parentNode], '');
            },
            children: function() {
                return zepto.Z(this[0].children, '');
            },
            prev: function() {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return zepto.Z([this[0].previousElementSibling], '');
            },
            next: function() {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return zepto.Z([this[0].nextElementSibling], '');
            },
            show: function() {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return this.css("display", "block");
            },
            hide: function() {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return this.css("display", "none");
            },
            html: function(html) {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                if (0 in arguments) {
                    // 设值
                    this.forEach(function(element, index) {
                        element.innerHTML = html;
                    });
                    return this;
                } else {
                    // 取值
                    return this[0].innerHTML;
                }
            },
            attr: function(name, value) {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                var result;
                if (typeof name == 'string' && !(1 in arguments)) {
                    // 取值
                    if (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null) {
                        return result
                    } else {
                        return undefined
                    }
                } else {
                    // 设值
                    this.forEach(function(el, index) {
                        el.setAttribute(name, value);
                    });

                    return this;
                }
            },
            removeAttr: function(name) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                return this.each(function() {
                    this.nodeType === 1 && name.split(' ').forEach(function(attribute) {
                        setAttribute(this, attribute)
                    }, this)
                });
            },
            prop: function(name, value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                name = propMap[name] || name
                return (1 in arguments) ?
                    this.each(function(idx) {
                        this[name] = funcArg(this, value, idx, this[name])
                    }) :
                    (this[0] && this[0][name])
            },
            removeProp: function(name) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                name = propMap[name] || name
                return this.each(function() { delete this[name] })
            },
            data: function(name, value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                // taichiyi
                var attrName = 'data-' + name;
                var data;
                if (1 in arguments) {
                    // 设值
                    this.forEach(function(element, index) {
                        element.setAttribute(attrName, value);
                    });
                    return this;
                } else {
                    // 取值
                    if (0 in this && this[0].nodeType === 1 && (data = this[0].getAttribute(attrName)) != null) {
                        return data
                    } else {
                        return undefined
                    }
                }
            },
            val: function(value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                // taichiyi
                if (this.length === 0) return this;
                if (value == null) value = "";

                var element = this[0];
                var tagName = element.tagName;

                if (0 in arguments) {
                    // 设值
                    this.forEach(function(element, index) {
                        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                            element.value = value;
                        } else if (element.tagName === "SELECT") {
                            element.options[element.selectedIndex].value = value;
                        } else {
                            return undefined;
                        }
                    });
                    return this;
                } else {
                    // 取值
                    if (tagName === "INPUT" || tagName === "TEXTAREA") {
                        return element.value;
                    } else if (tagName === "SELECT") {
                        return element.options[element.selectedIndex].value;
                    } else {
                        // 非常用表单元素
                        return undefined;
                    }
                }
            },
            width: function(value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                if (0 in arguments) {
                    // 判断是否带单位,没带的话,添加默认单位px
                    this.forEach(function(element, index) {
                        element.style.width = +value ? value + "px" : value;
                    });
                    return this
                } else {
                    return this[0].clientWidth
                }
            },
            height: function(value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                if (!this[0]) {
                    return false;
                }
                if (0 in arguments) {
                    // 判断是否带单位,没带的话,添加默认单位px
                    this.forEach(function(element, index) {
                        element.style.height = +value ? value + "px" : value;
                    });
                    return this
                } else {
                    return this[0].clientHeight
                }
            },
            css: function(property, value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                // taichiyi
                var element;

                if (typeof property === "string") {

                    if (arguments.length === 1) {
                        // 取值
                        element = this[0];
                        return getComputedStyle(element, null).getPropertyValue(property);
                    } else {
                        // 设置
                        if (this.length === 1) { //捕获到一个元素
                            element = this[0];
                            element.style && (element.style.cssText += ";" + property + ":" + value);
                            return this;
                        } else { //捕获到多个元素
                            this.forEach(function(element, index) {
                                element.style && (element.style.cssText += ";" + property + ":" + value);
                            });
                            return this;
                        }

                    }

                } else {
                    return this;
                }
            },
            hasClass: function(name) {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                var i, result;
                if (!name) return false;

                return hasClass(this[0], name);

            },
            addClass: function(name) {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                if (!name) return this;
                this.forEach(function(element, index) {
                    var class_json = name.split(' ');

                    if (!('classList' in element)) {
                        return this;
                    }

                    foreach_callback(class_json, function(ret) {
                        element.classList.add(ret);
                    });
                });
                return this;
            },
            removeClass: function(name) {
                // taichiyi
                var classListStr;

                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }

                this.forEach(function(element, index) {
                    var class_json;

                    classListStr = element.classList.value;
                    if (classListStr === '') return;

                    if (name) {
                        class_json = name.split(' ');
                    } else {
                        class_json = classListStr.split(' ');
                    }

                    foreach_callback(class_json, function(ret) {
                        element.classList.remove(ret);
                    });
                });
                return this;

            },
            scrollTop: function(value) {
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                if (!this.length) return
                var hasScrollTop = 'scrollTop' in this[0]
                if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
                return this.each(hasScrollTop ?
                    function() { this.scrollTop = value } :
                    function() { this.scrollTo(this.scrollX, value) })
            },
            click: function() {
                // taichiyi
                if (this.length === 0) {
                    console.warn('没有匹配到任何元素');
                    return this;
                }
                var event;
                if (this.length > 0) {
                    try {
                        // 未来
                        event = new MouseEvent("click");
                    } catch (err) {
                        // 过去
                        event = document.createEvent('Event');
                        event.initEvent('tap', true, true);
                    }
                    this[0].dispatchEvent(event);
                }
                return this;
            }
        }

        $.isFunction = isFunction;

        zepto.Z.prototype = Z.prototype = $.fn

        return $;
    })();

    window.Zepto = Zepto

    window.$ === undefined && (window.$ = Zepto);

    (function($) {
        var touchStartX = 0;
        var touchStartY = 0;
        var thisClickTime = 0;
        var lastClickTime = 0; //上一次点击时间
        var scrollTop_start;
        var scrollTop_end;
        var is_effectClick = true; //是否为有效点击事件

        var touchListeners = [];
        var body_handle = $('body');

        // 是否支持touch事件
        function hasTouch() {
            return 'ontouchstart' in window;
        }

        function fastClick() {
            var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
            var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;

            // 模拟点击事件
            function simulateClick(el) {
                el.dispatchEvent(new MouseEvent("click"));
            }

            function needsFocus(target) {

                switch (target.nodeName.toLowerCase()) {
                    case 'textarea':
                        return true;
                    case 'select':
                        return !deviceIsAndroid;
                    case 'input':
                        switch (target.type) {
                            case 'button':
                            case 'checkbox':
                            case 'file':
                            case 'image':
                            case 'radio':
                            case 'submit':
                                return false;
                        }

                        // No point in attempting to focus disabled inputs
                        return !target.disabled && !target.readOnly;
                    default:
                        return (/\bneedsfocus\b/).test(target.className);
                }
            };

            function findControl(labelElement) {

                if (labelElement.control !== undefined) {
                    return labelElement.control;
                }

                if (labelElement.htmlFor) {
                    return document.getElementById(labelElement.htmlFor);
                }

                return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
            };

            function needsClick(target) {
                switch (target.nodeName.toLowerCase()) {

                    case 'button':
                    case 'select':
                    case 'textarea':
                        if (target.disabled) {
                            return true;
                        }

                        break;
                    case 'input':

                        if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                            return true;
                        }

                        break;
                    case 'label':
                    case 'iframe':
                    case 'video':
                        return true;
                }

                return (/\bneedsclick\b/).test(target.className);
            };

            function sendClick(targetElement, e) {
                var clickEvent, touch;
                if (document.activeElement && document.activeElement !== targetElement) {
                    document.activeElement.blur();
                }

                touch = e.changedTouches[0];

                clickEvent = document.createEvent('MouseEvents');
                clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
                clickEvent.forwardedTouchEvent = true;
                targetElement.dispatchEvent(clickEvent);
            };

            // 该元素在touch监听列表里, 则执行该元素的回调函数
            function do_callback(targetElement, e) {
                var i, ii;

                // 递归遍历父代
                function recursionParentElement(targetElement) {
                    if (targetElement && targetElement.id) {
                        if ('#' + targetElement.id === touchListeners[i].selector) {
                            touchListeners[i].callback.call(targetElement, e);
                            if (touchListeners[i].single) {
                                // 是否为一次性点击事件
                                touchListeners.splice(i, 1);
                            }
                            return;
                        }
                    }

                    if (targetElement && targetElement.className) {
                        for (ii = 0; ii < targetElement.classList.length; ii += 1) {
                            if ('.' + targetElement.classList[ii] === touchListeners[i].selector) {
                                touchListeners[i].callback.call(targetElement, e);
                                if (touchListeners[i].single) {
                                    // 是否为一次性点击事件
                                    touchListeners.splice(i, 1);
                                }
                                return;
                            }
                        }
                    }

                    if (touchListeners[i].tagName && targetElement && targetElement.tagName === touchListeners[i].tagName) {
                        touchListeners[i].callback.call(targetElement, e);
                        if (touchListeners[i].single) {
                            // 是否为一次性点击事件
                            touchListeners.splice(i, 1);
                        }
                        return;
                    }

                    // 如果存在父代则遍历
                    targetElement.parentElement && recursionParentElement(targetElement.parentElement);
                }

                for (i = 0; i < touchListeners.length; i += 1) {
                    recursionParentElement(targetElement);
                }
            }

            document.body.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].pageX;
                touchStartY = e.changedTouches[0].pageY;
                scrollTop_start = body_handle[0].scrollTop;
                is_effectClick = true;
            }, false);

            document.body.addEventListener('touchend', function(e) {
                var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = e.target;

                if (is_effectClick === false) {
                    // 不是有效的点击事件
                    return false;
                }

                thisClickTime = e.timeStamp;

                if (lastClickTime !== 0) {
                    //300ms内不能触发2次点击事件
                    if (thisClickTime - lastClickTime < 300) {
                        // e.stopPropagation();
                        // e.preventDefault();
                        return false;
                    }

                    lastClickTime = thisClickTime;
                } else {
                    lastClickTime = thisClickTime;
                }

                // 该元素在touch监听列表里, 则执行该元素的回调函数
                do_callback(targetElement, e);

                // ============ fastClick ===============
                targetTagName = targetElement.tagName.toLowerCase();
                if (targetTagName === 'label') {
                    forElement = findControl(targetElement);
                    if (forElement) {
                        targetElement.focus();
                        if (deviceIsAndroid) {
                            return false;
                        }

                        targetElement = forElement;
                    }
                } else if (needsFocus(targetElement)) {
                    targetElement.focus();
                    if (deviceIsIOS) {
                        e.preventDefault();
                        sendClick(targetElement, e);
                    }
                    return false;
                }

                if (!needsClick(targetElement)) {
                    if (deviceIsIOS) {
                        e.preventDefault();
                        sendClick(targetElement, e);
                    }
                }
            }, false);

            document.body.addEventListener('touchmove', function(e) {
                is_effectClick = false;
            }, false);
        }

        if (hasTouch()) {
            fastClick();
        }

        function add(element, event, fn, selector, autoRemove, capture) {
            capture = capture || false;
            var proxy = function() {
                fn.call(element);
                if (autoRemove) {
                    element.removeEventListener(event, proxy, capture);
                }
            };

            // 兼容ezapp
            event === 'tap' && (event = 'click');
            element.addEventListener(event, proxy, capture);
        }

        $.fn.on = function(event, selector, callback, one) {
            var i;
            var ii;
            var delegator;
            var autoRemove;

            if ($.isFunction(selector)) {
                one = callback;
                callback = selector, selector = undefined;
            }

            autoRemove = one || false; // 执行一次后取消绑定

            if (hasTouch() && (event === 'click' || event === 'tap')) {
                this.live('click', callback);
                return this;
            }

            this.forEach(function(element, index) {
                add(element, event, callback, selector, autoRemove);
            });
            return this;
        }

        $.fn.live = function(event, callback) {
            var tagName = undefined;
            var selector = this.selector;
            if (selector[0] !== '.' && selector[0] !== '#') {
                tagName = selector.toUpperCase();
            }

            // 是否已存在,监听列表里
            function is_exist() {
                var a;

                for (a = 0; a < touchListeners.length; a += 1) {
                    if (tagName) {
                        if (touchListeners[a].tagName === tagName) return true;
                    } else {
                        if (touchListeners[a].selector === selector) return true;
                    }
                }
                return false;
            }

            if (is_exist()) return false;

            touchListeners.push({
                selector: selector,
                tagName: tagName,
                callback: callback
            });
            // console.log('=== touchListeners ===');
            // console.dir(touchListeners);
            // console.log(JSON.stringify(touchListeners));
            return this;
        }

        $.fn.one = function(event, callback) {
            var tagName;
            if (event !== 'click') {
                this.on(event, callback, true);
                return this;
            }

            if (this.selector[0] !== '.' && this.selector[0] !== '#') {
                tagName = this.selector.toUpperCase();
            }
            touchListeners.push({
                selector: this.selector,
                tagName: tagName,
                callback: callback,
                single: true
            });
            return this;
        }

        $.fn.longPress = function(callback) {
            var i;
            var that = this;
            var timeout = undefined;
            for (i = 0; i < that.length; i += 1) {
                that[i].addEventListener('touchstart', function(event) {
                    timeout = window.setTimeout(callback, 800);
                }, false);
                that[i].addEventListener('touchend', function(event) {
                    clearTimeout(timeout);
                }, false);
            }
        }

    })(Zepto);

    return Zepto;
}));
