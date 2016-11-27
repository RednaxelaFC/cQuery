// 添加DOM操作
$.fn.extend({

    // 清空每一个元素的内容
    empty: function () {
        /*
         * 实现思路：
         * 遍历实例，把遍历到的每一个元素innnerHTML = ''即可。
         * */
        this.each( function( key, val ) {

            // 这样写也可以
            // val.innerHTML = '';

            // 这里的this代表遍历到的val值
            this.innerHTML = '';
        });

        // 为了链式编程
        return this;
    },

    // 删除所有的元素
    remove: function() {
        /*
         * 实现思路：
         * 遍历所有元素，把遍历到的每一个都删除掉。
         * */
        this.each( function( key, val ) {

            // 也可以这样干
            //val.parentNode.removeChild( val );

            // 这里的this代表遍历到的val值
            this.parentNode.removeChild( this );
        } );
    },

    /*
     * function { appendTo } 把所有的元素添加到指定的selector中
     * param { selector: DOM || 选择器 || cQuery实例 }
     * return 所有被添加元素共同组成的新实例
     * */
    appendTo: function( selector ) {
        /*
         * 大概实现思路：
         * 大概：遍历所有的元素，分别添加到selector中。
         *
         * 具体实现思路：
         * 1、定义一个数组，用来存储所有被添加的元素
         * 2、遍历this中的所有元素，依次添加到 $selector 中的所有元素，
         * 需要考虑遍历到元素，只能添加到$selector中的一个元素中，其余的元素添加的都是clone版本。
         * 另外还需要考虑每次添加时，都需要先把要添加的元素存储到数组中。
         * 3、最后通过cQuery(所有被添加元素组成的数组)包装成新实例返回。
         * */
        var result = [],
            $selector = cQuery( selector ),
            temp;

        /*for ( var i = 0, len = this.length; i < len; i++ ) {
         for ( var j = 0, leng = $selector.length; j < leng; j++ ) {
         // 第一次添加到j里面，是真实的
         if ( j === 0 ) {
         temp = this[i];
         }
         // 以后添加的都是clone的
         else {
         temp = this[i].cloneNode( true );
         }
         $selector[j].appendChild( temp ); // 添加到指定元素中
         result.push( temp ); // 添加到数组中
         }
         }*/

        // 遍历所有被添加的元素
        this.each( function() {
            var self = this;
            $selector.each( function( index ) {
                temp = index === 0? self: self.cloneNode( true );
                this.appendChild( temp );
                result.push( temp );
            } );
        } );

        return cQuery( result );
    },

    /*
     * function { append } 给所有的元素添加指定的内容
     * param { context: DOM || cQuery实例 || 文本 }
     * return 给谁添加返回谁，说白了就是this
     * */
    append: function( context ) {
        /*
         * 实现思路：
         * 1、如果context是字符串，那么把这个字符串累加到每一个元素中
         * 2、如果是其他东西，为了方便处理，统一转换为cQuery实例。
         * 3、遍历$context，把遍历到的每一项，分别添加到this的每一项中。
         * 需要注意的是，只有第一次添加是真实的，以后添加的都是clone版本。
         * 4、返回this
         * */

        // 如果是字符串，遍历每一个元素，把字符串累加进去
        if ( cQuery.isString( context ) ) {
            this.each( function() {
                this.innerHTML += context;
            } );
        }
        // 否则借用appendTo把context添加到this中
        else {
            cQuery( context ).appendTo( this );

            /*var $context = cQuery( context );
             // 把$context中的内容分别添加到this的所有元素中
             for ( var i = 0, len = this.length; i < len; i++ ) {
             for ( var j = 0, leng = $context.length; j < leng; j++ ) {
             this[i].appendChild( i === 0? $context[j] : $context[j].cloneNode( true ) );
             }
             }*/
        }

        return this;
    },

    /*
     * function { prependTo } 把所有的元素添加到指定的selector最前面
     * param { selector: DOM || 选择器 || cQuery实例 }
     * return 所有被添加元素共同组成的新实例
     * */
    prependTo: function( selector ) {
        var $selector = cQuery( selector ),
            result = [], temp;

        // 遍历所有被添加的元素
        this.each( function() {
            var self = this;

            // 遍历所有被添加元素的父节点
            $selector.each( function( index ) {
                // 只有给第一个父节点添加元素时，添加的是真实的，以后都是clone的
                temp = index === 0? self : self.cloneNode( true );
                this.insertBefore( temp, this.firstChild );
                result.push( temp );
            } );
        } );

        // 把所有被添加的元素包装成jQ对象返回
        return cQuery( result );
    },

    /*
     * function { prepent } 给所有的元素最前面添加指定的内容
     * param { context: DOM || cQuery实例 || 文本 }
     * return 给谁添加返回谁，说白了就是this
     * */
    prepend: function( context ) {

        // 如果是字符串，把它添加到所有元素的最前面
        if ( cQuery.isString( context ) ) {
            this.each( function() {
                this.innerHTML = context + this.innerHTML;
            } );
        }
        // 否则借用prependTo把context添加到this中
        else {
            $(context).prependTo( this );
        }

        return this;
    }

});



