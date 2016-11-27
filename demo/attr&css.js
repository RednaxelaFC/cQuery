$.extend({
    getStyle: function( ele, styleName ) {

        // 如果不传入ele，返回undefined
        if ( !cQuery.isDOM( ele ) ) {
            return;
        }

        // 兼容获取指定的样式
        if ( window.getComputedStyle ) {
            return getComputedStyle( ele )[ styleName ];
        }else {
            return ele.currentStyle[ styleName ];
        }
    }
});

// 扩充属性与样式方法
$.fn.extend({

    // 判断元素中是否含有指定的class
    hasClass: function( className ) {
        /*
         * 实现思路：
         * 遍历所有的元素，只要有一个元素存在指定的className，
         * 那么就返回true，否则返回false
         * */
        for ( var i = 0, len = this.length; i < len; i++ ) {
            if ( (' ' + this[i].className + ' ').indexOf( ' ' + className + '' ) > -1 ) {
                return true;
            }
        }

        return false;
    },

    // 判断元素中是否含有指定的class
    _hasClass: function( className ) {

        // 用一个变量记录是否存在
        var has = false;

        // 遍历所有的元素
        this.each( function() {
            if ( (' ' + this.className + ' ').indexOf( ' ' + className + '' ) > -1 ) {
                has = true; // 如果有一个元素存在，就把这个变量改为true
                return false; // 如果发现有一个元素存在，后面的就不用再遍历了，所以返回false
            }
        } );

        return has;
    },

    // 给所有的元素添加指定的className
    addClass: function( className ) {
        // 遍历所有的元素
        for ( var i = 0, len = this.length; i < len; i++ ) {
            // 如果这个元素不存在className，那么拼接上
            if ( (' ' + this[i].className + ' ').indexOf( ' ' + className + ' ' ) == -1 ) {
                //this[i].className += ' ' + className;
                this[i].className = (this[i].className + ' ' + className).replace(/^\s*|\s*$/g, '');
            }
        }

        // 为了链式编程
        return this;
    },

    // 给所有的元素添加指定的className
    _addClass: function( className ) {
        /*
         * 实现思路：
         * 遍历所有的元素，先看这个元素有没有指定的className，
         * 如果没有就添加，已经有了就无视。
         * */
        this.each( function() {
            // 这里面的this代表的是val值
            // 如果遍历到的每一个元素，不存在className，那么就进行添加操作
            if ( !cQuery( this ).hasClass( className ) ) {
                //this.className += ' ' + className;
                this.className = (this.className + ' ' + className).replace(/^\s*|\s*$/g, '');
            }
        } );

        // 为了链式编程
        return this;
    },

    // 删除所有元素中指定的className
    removeClass: function( className ) {
        /*
         * 实现思路：
         * 1、如果className === undefined，那么删除所有元素的所有className
         * 2、如果传参了，删除所有元素指定的className。
         * */
        var len = arguments.length;

        // null、undefined不做任何处理
        if ( className == null ) {
            return this;
        }

        // 如果没有传参，清除全部className
        if ( len == 0 ) {
            this.each( function() {
                this.className = '';
            } );
        }else {
            // 遍历所有的元素
            this.each( function() {
                // 利用正则替换匹配到的className，最后trim一下。
                this.className = (" " + this.className + " ")
                    .replace(' ' + className + ' ', " ")
                    .replace(/^\s*|\s*$/g, '');
            } );
        }

        // 为了链式编程
        return this;
    },

    // 有就删除，没有就添加
    toggleClass: function( className ) {
        this.each( function() {
            // 包装成cQuery实例,以便复用原型中已实现的方法
            var $this = cQuery( this );

            // 有则删除，没有则添加
            if ( $this.hasClass( className ) ) {
                $this.removeClass( className );
            }else {
                $this.addClass( className );
            }
        } );

        // 为了链式编程
        return this;
    },

    /*
     * function { attr } 获取元素或者给元素设置属性节点
     * param { name: string || object }
     * param { value: string }
     * return { 属性值 || this }
     * */
    attr: function( name, value ) {
        /*
         * 实现思路：
         * 1、使用一个变量存储arguments的length属性，
         * 2、如果length为1，name为字符串，则获取第一个元素(this[0])的对应属性节点值
         * 3、如果length为1，name为对象，则遍历所有元素，分别给他们设置对象中所有配置的属性节点。
         * 4、如果length为2，则遍历所有元素，分别以name为key，value为值，添加属性节点。
         * 5、如果是设置，return this； 如果是获取，return 属性值。
         * 补充：attr是设置或获取属性节点，所以需要通过getAttribute和setAttribute方法来实现。
         * */
        var len = arguments.length;

        // 如果是null、undefined不做任何处理
        if ( name == null ) {
            return this;
        }

        // 如果传入一个参数
        if ( len == 1 ) {

            // 1个参数，并且是字符串，则返回第一个元素的属性值
            if ( cQuery.isString( name ) ) {
                return this[0] && this[0].getAttribute( name );
            }

            // 1个参数，并且是对象
            else if( typeof name == 'object' ) {

                // 遍历所有元素
                this.each( function() {
                    var self = this;

                    // 遍历所有要设置的属性key与value,
                    // 备注：这里不能cQuery( name ).each，因为name不是伪数组。
                    cQuery.each( name, function( key, value ) {

                        // 分别给每一个元素设置所有的属性值
                        self.setAttribute( key, value );
                    } );
                } );
            }
        }
        // 如果传入二个参数
        else if ( len == 2 ) {
            this.each( function() {
                this.setAttribute( name, value );
            } );
        }

        // 为了链式编程
        return this;
    },

    /*
     * function { attr } 获取元素或者给元素设置属性节点
     * param { name: string || object }
     * param { value: string }
     * return { 属性值 || this }
     * */
    _attr: function( name, value ) {
        var len = arguments.length;

        // null、undefined
        if ( name == null ) {
            return this;
        }

        if ( len == 1 ) {

            if ( cQuery.isString( name ) ) {
                return this[0] && this[0].getAttribute( name );
            }

            else if ( typeof name == 'object' ) {
                for ( var i = 0, len = this.length; i < len; i++ ) {
                    for ( var key in name ) {
                        this[i].setAttribute( key, name[key] );
                    }
                }
            }

        }

        else if( len == 2 ) {
            for ( var i = 0, len = this.length; i < len; i++ ) {
                this[i].setAttribute( name, value );
            }
        }

        // 为了链式编程
        return this;
    },

    /*
     * function { prop } 获取元素或者给元素设置属性
     * param { name: string || object }
     * param { value: string }
     * return { 属性值 || this }
     * */
    prop: function( name, value ) {
        /*
         * 实现思路：
         * 1、使用一个变量存储arguments的length属性，
         * 2、如果length为1，name为字符串，则获取第一个元素(this[0])的对应属性值
         * 3、如果length为1，name为对象，则遍历所有元素，分别给他们设置对象中所有配置的属性。
         * 4、如果length为2，则遍历所有元素，分别以name为key，value为值，添加属性。
         * 5、如果是设置，return this； 如果是获取，return 属性值。
         * 补充：prop是设置或获取属性，所以需要元素.属性名来获取，或者元素.属性名 = 属性值的方法来设置。
         * */
        var len = arguments.length;

        // 如果传入1个参数
        if ( len == 1 ) {

            // 如果是字符串
            if ( cQuery.isString( name ) ) {
                return this[ 0 ] && this[ 0 ][ name ];
            }

            // 如果是对象
            else if ( typeof name == 'object' ) {
                this.each( function() {
                    var self = this;
                    cQuery.each( name, function( key, value ) {
                        self[ key ] = value;
                    } );
                } );
            }

        }

        // 如果传入2个参数
        else if( len == 2 ) {
            // name作为key，value作为值，赋给每一个元素。
            this.each( function() {
                this[ name ] = value;
            } );
        }

        // 为了编程
        return this;
    },

    /*
     * function { html } 设置或获取或删除元素的内容
     * param { html: string || 没有 }
     * */
    html: function( html ) {
        /*
         * 实现思路：
         * 1、如果传入undefined，不做处理，
         * 2、如果传入null，遍历所有的元素，设置他们的innerHTML为空字符串，
         * 3、如果没有传参，则获取第一个元素的innerHTML，
         * 4、如果传入了html，那么遍历所有的元素，设置他们的innerHTML为传入的参数，
         * 备注，如果是获取，则返回第一个元素的innerHTML；如果是设置，则返回this。
         * */
        var len = arguments.length;

        // 如果传入undefined
        if ( len == 1 && html === undefined ) {
            return this;
        }

        // 如果传入null,清除所有元素内容
        else if ( html === null ) {
            this.each( function() {
                this.innerHTML = '';
            } );
        }

        // 如果没有传参，获取第一个元素内容
        else if ( len == 0 ) {
            return this[ 0 ] && this[ 0 ].innerHTML;
        }

        // 如果传参了
        else {
            this.each( function() {
                this.innerHTML = html;
            } );
        }

        // 为了链式编程
        return this;
    },

    /*
     * function { html } 设置或获取或删除元素的内容
     * param { html: string || 没有 }
     * */
    _html: function( html ) {
        /*
         * 实现思路：
         * 1、如果传入undefined，不做处理，
         * 2、如果传入null，遍历所有的元素，设置他们的innerHTML为空字符串，
         * 3、如果没有传参，则获取第一个元素的innerHTML，
         * 4、如果传入了html，那么遍历所有的元素，设置他们的innerHTML为传入的参数，
         * 备注，如果是获取，则返回第一个元素的innerHTML；如果是设置，则返回this。
         * */
        var len = arguments.length;

        // 如果传入undefined，嘛都不做，返回this
        if ( len == 1 && html === undefined ) {
            return this;
        }

        // 如果嘛都不传，借用prop方法，获取第一个元素的innerHTML，并返回prop的结果
        else if ( len == 0 ) {
            return this.prop( 'innerHTML' );
        }

        // 如果传入null，意指把innerHTML设置为''
        if ( html === null ) {
            html = '';
        }

        // 借用prop方法把所有元素的innerHTML设置为指定的值，并返回prop的结果(prop返回this)
        return this.prop( 'innerHTML', html );
    },

    /*
     * function { text } 获取所有元素的文本，或者清除所有元素的内容，或者给所有元素设置新的文本
     * param { text: string || 没有 || null }
     * */
    text: function( text ) {
        /*
         * 实现思路：
         * 1、如果传入undefined，不做处理，
         * 2、如果传入null，遍历所有的元素，设置他们的innerText为空字符串，
         * 3、如果没有传参，则获取所有元素的innerText，
         * 4、如果传入了text，那么遍历所有的元素，设置他们的innerText为传入的参数，
         * 备注，如果是获取，则返回所有元素的innerText；如果是设置，则返回this。
         * */
        var len = arguments.length,
            result = '';

        // 传入undefined
        if ( len == 1 && text === undefined ) {
            return this;
        }

        // 没有传
        else if ( len == 0 ) {
            this.each( function() {
                result += this.innerText;
            } );
            return result;
        }

        // 传入null
        else if ( text === null ) {
            this.each( function() {
                this.innerText = '';
            } );
        }

        // 传入其他内容
        else {
            this.each( function() {
                this.innerText = text;
            } );
        }

        // 链式编程
        return this;
    },

    /*
     * function { text } 获取所有元素的文本，或者清除所有元素的内容，或者给所有元素设置新的文本
     * param { text: string || 没有 || null }
     * */
    _text: function( text ) {
        /*
         * 实现思路：
         * 1、如果传入undefined，不做处理，
         * 2、如果没有传参，则获取所有元素的innerText，
         * 3、如果传入null，说明要给所有元素设置innerText为空字符串，即 text = '',然后借用prop处理
         * 4、如果传入了text，那么借用prop给所有元素设置innerText为指定的文本。
         * 备注，如果是获取，则返回所有元素的innerText；如果是设置，则返回prop的返回结果。
         * */
        var len = arguments.length;

        // 传入undefined
        if ( len == 1 && text === undefined ) {
            return this;
        }

        // 没有传，则把所有元素的innerText拼在一起返回
        else if ( len == 0 ) {

            /*
             * map方法用来遍历每一个元素，
             * 然后把遍历到的数据传入回调，
             * 然后把回调的结果一一保存下来，
             * 共同组成一个新数组返回，
             * 数组有一个join方法，
             * 用来把数组的内容拼接成字符串，
             * 最终通过这种方式得到了所有元素innerText拼起来的字符串。
             * */
            return this.map(function (val) {
                return val.innerText;
            }).join('');
        }

        // 传入null，意指设置text为空字符串
        if ( text === null ) {
            text = '';
        }

        // 统一交由prop设置innerText
        return this.prop( 'innerText', text );
    },

    /*
     * function { val } 获取第一个元素的value属性值，或者（清除||设置）所有元素的value属性值
     * param { value: 没有 || null || undefined || string }
     * */
    val: function( value ){
        /*
         * 实现思路：
         * 1、如果没有传参，则返回第一个元素的value属性值( 可以考虑借用prop )
         * 2、如果传入的是null或undefined，则设置所有元素的value属性值为''( 可以考虑借用prop )
         * 3、如果传入其他数据，则设置所有元素的value属性值为指定的值( 可以考虑借用prop )
         * 备注：如果没有传参，返回第一个元素的value属性值，否则返回this。
         * */
        var len = arguments.length;

        // 没有传参
        if ( len == 0 ) {
            return this.prop( 'value' );
        }

        // 如果null或者undefined，则设置的value为空字符串
        if ( value == null ) {
            value = ''
        }

        return this.prop( 'value', value );
    },

    /*
     * function { css } 获取第一个元素的指定的样式值，或者批量设置样式值
     * param { value: 没有 || null || undefined || string }
     * */
    css: function( style, value ) {
        /*
         * 实现思路：
         * 1、如果不传参，则返回this
         * 2、如果传入1个参数为字符串，则返回第一个元素的指定样式
         * 3、如果传入1个参数为对象，则给所有元素批量添加样式
         * 4、如果传入2个参数，则给所有元素添加指定的样式
         * */
        var len = arguments.length;

        // 如果不传参，则返回this
        if ( len == 0 ) {
            return this;
        }

        if ( len == 1 ) {

            // 如果传入1个参数为字符串，则返回第一个元素的指定样式
            if ( cQuery.isString( style ) ) {
                return cQuery.getStyle( this[0], style );
            }

            // 如果传入1个参数为对象，则给所有元素批量添加样式
            else if ( typeof style == 'object' ) {
                this.each( function() {
                    var self = this;
                    cQuery.each( style, function( key, val ) {
                        self.style[ key ] = val;
                    } );
                } );
            }

        }

        // 如果传入2个参数，则给所有元素添加指定的样式
        else if ( len == 2 ) {
            this.each( function() {
                this.style[ style ] = value;
            } );
        }

        // 为了链式编程
        return this;
    }
});
