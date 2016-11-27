// 为了全局变量污染，把代码写到自调函数中
(function ( w ) {

    var version = "1.0.0";

    var document = w.document;

    var arr = [],
        push = arr.push,
        slice = arr.slice;

    var obj = {},
        toString = obj.toString,
        hasOwn = obj.hasOwnProperty;

    // 为了用户使用方便，提供一个工厂函数
    function cQuery( selector ) {
        return new init( selector );
    }

    // 原型简写&原型默认拥有的属性与方法
    cQuery.fn = cQuery.prototype = {
        cQuery: version,
        constructor: cQuery,
        isReady: false,
        length: 0,
        toArray: function () {
            return slice.call( this );
        },
        get: function ( num ) {
            /*
             * 如果为整数，则返回this[num]
             * 如果为负数，则返回this[this.length + num]
             * 如果为null或undefined，则调用toArray返回数组
             * */
            if ( num == null ) {
                return this.toArray();
            }

            return num >= 0? this[num] : this[this.length + num];
        },

        slice: function ( ) {
            /*
             * slice返回的是一个新的实例：可以通过cQuery()得到
             * 截取的功能可以借用数组的slice方法实现。
             * */
            /*var $new = cQuery();
             var arr = slice.apply( this, arguments );
             push.apply( $new, arr );
             return $new;*/

            // 简写
            return cQuery( slice.apply( this, arguments ) );
        },

        eq: function ( num ) {
            var dom;

            // 如果传入null或undefined，则返回一个新的实例
            if ( num == null ) {
                return cQuery();
            }

            // 如果传入数字，得到对应下标的元素，包装成新的实例返回
            // 如果没有得到，则直接返回新的实例。
            /*dom = this.get( num );
             if ( dom ) {
             return cQuery( dom );
             }else {
             return cQuery();
             }*/

            // 简写
            return (dom = this.get( num ))? cQuery( dom ): cQuery();
        },

        first: function() {
            return this.eq( 0 );
        },

        last: function() {
            return this.eq( -1 );
        },

        // 原型上的each方法，是为实例准备的，
        // 所以借用静态的each遍历实例即可。
        each: function( fn ) {
            return cQuery.each( this, fn );
        },

        // 原型上的map方法，是为实例准备的，
        // 所以借用静态的map遍历实例,
        // 然后把静态map方法返回的数组再返回即可。
        map: function( fn ) {
            return cQuery.map( this, fn );
        },

        push: push,
        sort: arr.sort,
        splice: arr.splice
    };

    // 给cQuery自身以及原型添加一个extend方法
    cQuery.extend = cQuery.fn.extend = function ( obj ) {
        for ( var key in obj ) {
            this[key] = obj[key];
        }
    };

    // 添加静态方法
    cQuery.extend({

        // 判断是不是函数
        isFunction: function( func ) {
            return typeof func === 'function';
        },

        // 判断是不是字符串
        isString: function( str ) {
            return typeof str === 'string';
        },

        // 判断是不是DOM
        isDOM: function( dom )  {
            return !!dom && !!dom.nodeType;
        },

        // 判断是不是html字符串
        isHTML: function( html ) {
            return html.charAt(0) === '<' &&
                html.charAt(html.length - 1) === '>' &&
                html.length >= 3;
        },

        // 判断是不是window
        isWindow: function( win ) {
            return !!win && win.window === win;
        },

        // 判断是不是伪数组或数组
        isLikeArray: function( likeArray ) {

            // function & window 返回 false
            if ( cQuery.isFunction( likeArray ) || cQuery.isWindow( likeArray ) ) {
                return false;
            }

            // 如果likeArray是对象，并有length属性，length属性值为0或者拥有length-1的属性
            return !!likeArray && typeof likeArray === 'object' && 'length' in likeArray &&
                ( likeArray.length === 0 || [likeArray.length - 1] in likeArray );
        },

        // 解析html
        parseHTML: function( html ) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.children;
        },

        // 封装一个兼容的DOMContentLoaded方法
        ready: function( fn ) {

            // 如果页面已经触发了DOMContentLoaded事件，那么直接执行fn，
            // 再监听DOMContentLoaded事件已经无用了。
            if ( cQuery.fn.isReady ) {
                return fn();
            }

            // IE9以及现代浏览器使用addEventListener以及DOMContentLoaded事件
            if ( document.addEventListener ) {
                document.addEventListener('DOMContentLoaded', function () {
                    cQuery.fn.isReady = true;
                    fn();
                });
            }

            // IE8使用attachEvent以及onreadystatechange事件
            else {
                document.attachEvent('onreadystatechange', function () {
                    if ( document.readyState === 'complete' ) {
                        cQuery.fn.isReady = true;
                        fn();
                    }
                });
            }
        },

        each: function( obj, fn ) {
            var i = 0, len, key;
            if ( cQuery.isLikeArray( obj ) ) {
                for ( len = obj.length; i < len; i++ ) {
                    if ( fn.call( obj[i], i, obj[i] ) === false ) {
                        break;
                    }
                }
            }else {
                for ( key in obj ) {
                    if ( fn.call( obj[key], key, obj[key] ) === false ) {
                        break;
                    }
                }
            }

            return obj;
        },

        map: function( obj, fn ) {
            var result = [],
                i = 0, len,
                temp, key;

            if ( cQuery.isLikeArray( obj ) ) {
                for ( len = obj.length; i < len; i++ ) {
                    temp = fn( obj[i], i );
                    if ( temp != null ) {
                        result.push( temp );
                    }
                }
            }else {
                for ( key in obj ) {
                    temp = fn( obj[key], key );
                    if ( temp != null ) {
                        result.push( temp );
                    }
                }
            }
            return result;
        }
    });

    // 构造函数
    var init = cQuery.prototype.init = function ( selector ) {

        // 空处理 ==> 直接返回this
        if ( !selector ) {
            return this;
        }

        // 函数 ==> 添加到DOMContentLoaed事件中
        if ( cQuery.isFunction( selector ) ) {
            cQuery.ready( selector );
        }

        // 字符串 ==> 要么解析为DOM，要么作为选择器获取页面中的DOM
        else if ( cQuery.isString( selector ) ) {
            // html片段
            if ( cQuery.isHTML( selector ) ) {
                push.apply(this, cQuery.parseHTML( selector ));
            }
            // 选择器
            else {
                try {
                    push.apply( this, document.querySelectorAll( selector ) );
                }catch(e){}
            }
        }

        // dom ==> 直接添加到this中
        else if ( cQuery.isDOM( selector ) ) {
            push.call( this, selector );
        }

        // 数组或伪数组 ==> 把每一项都添加到this中
        else if ( cQuery.isLikeArray( selector ) ) {
            push.apply( this, slice.call( selector ) );
        }

        // 其他 ==> 直接添加到this中
        else {
            push.call( this, selector );
        }
    };

    // 为了第三方扩展(即jQ插件)
    init.prototype = cQuery.fn;

    // 对外暴漏
    w.cQuery = w.$ = cQuery;

    // 解决DOMContentLoaded不触发的问题
    $(function () {});

}( window ));
