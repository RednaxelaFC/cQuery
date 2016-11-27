$.extend({

    //  兼容获取XMLHttpReuest对象
    getXhr: function() {
        if ( window.XMLHttpRequest ) {
            return new XMLHttpRequest();
        }else {
            return new ActiveXObject('Microsoft.XMLHTTP');
        }
    },

    // ajax默认的配置项
    ajaxSettings: {
        url: location.href,
        type: "GET",
        async: true,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        timeout: 0,
        dataType: 'json',
        success: function(){},
        error: function(){},
        complete: function(){}
    },

    // 把数据转换为URL形式的参数
    urlStringify: function( data ) {
        var result = '', key;

        // 空类型，统一返回空字符串
        if ( !data ) {
            return '';
        }

        for ( key in data ) {
            // 为了防止乱码，key和val统一使用encodeURIComponent方法转码一下
            result += encodeURIComponent( key ) + '=' + encodeURIComponent( data[ key ] ) + '&';
        }

        return result.slice( 0, -1 );
    },

    // 合并默认和用户传入的配置项，得到新的配置项
    processConfig: function( options ) {

        // 合并配置项
        var config = {};
        cQuery.extend( config, cQuery.ajaxSettings, options );

        // 把请求类型统一改为大写形式，方便日后的使用
        config.type = config.type.toUpperCase();

        // 如果为GET请求，把参数转换为URL的形式，添加到URL中，
        // 最后再把data 改为 null。
        if ( config.type == 'GET' ) {
            config.url += '?' + cQuery.urlStringify( config.data );
            config.data = null;
        }
        // 如果是POST请求，把参数转换为URL的形式就好
        else if( config.type == 'POST' ) {
            config.data = cQuery.urlStringify( config.data );
        }

        // 把一个处理过的配置返回出去
        return config;
    },

    // 发送ajax请求
    ajax: function( options ) {
        var config = {}, xhr, timer;

        // 根据用户的参数进行加工处理
        config = cQuery.processConfig( options );

        // 创建xhr对象
        xhr = cQuery.getXhr();

        // open
        xhr.open( config.type, config.url, config.async );

        // 如果是POST请求，设置一个头信息
        if ( config.type == 'POST' ) {
            xhr.setRequestHeader( 'Content-Type', config.contentType );
        }

        // 事件监听，最好在send之前
        xhr.onreadystatechange = function() {
            var successDate = null;
            if ( xhr.readyState == 4 ) {

                // 如果在指定时间内，请求完成了，那么清除定时器。
                clearTimeout( timer );

                // 请求完毕后，执行complete
                config.complete && config.complete();

                if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 ) {
                    /*
                     * 如果dataType为json，那么帮用户解析成js对象返回；
                     * 如果dataType为script，那么帮用户把请求到的js执行掉，返回再返回这些js脚本;
                     * 如果dataType为style，那么动态创建一个style标签，然后把加载的样式添加进去，最后放到head里让样式生效
                     * 如果请求的是其他数据，则不做额外处理，原物返回
                     * */
                    switch ( config.dataType ) {
                        // 帮用户解析成js对象返回，如果解析失败，原物返回
                        case 'json':
                            try {
                                successDate = JSON.parse( xhr.responseText );
                            }catch(e) {
                                successDate = xhr.responseText;
                            }
                            break;
                        // 帮用户执行js脚本，无论执行成功与否，都要原物返回
                        case 'script':
                            try {
                                eval( xhr.responseText );
                            }catch(e){}
                            successDate = xhr.responseText;
                            break;
                        // 帮用户把样式添加到head中生效，无论是否生效，都要原物返回
                        case 'style':
                            $('head').append($('<style></style>').html( xhr.responseText ));
                            successDate = xhr.responseText;
                            break;
                        // 其他数据，不做处理，原物返回
                        default:
                            successDate = xhr.responseText;
                    }
                    // 执行成功回调
                    config.success && config.success( successDate, xhr.statusText, xhr );
                }else {
                    config.error && config.error( xhr.statusText, xhr );
                }
            }
        };

        // 按照timeout开启一个定时器，当这个定时器的回调执行时，
        // 说明请求延时了，那么清空onreadystatechange事件句柄，并执行error方法。
        timer = setTimeout( function() {
            xhr.onreadystatechange = null;
            config.error && config.error( '请求超时啦!', xhr );
        }, config.timeout );

        // 发送请求
        xhr.send( config.data );
    },

    // 使用get请求数据
    get: function( url, data, callback ) {
        // 如果传入2个参数，那么第二个则为回调
        callback = callback || data || function(){};
        $.ajax({
            url: url,
            type: 'GET',
            data: data,
            success: callback
        });
    },

    // 使用post请求数据
    post: function( url, data, callback ) {
        // 如果传入2个参数，那么第二个则为回调
        callback = callback || data || function(){};
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: callback
        });
    },

    // 用来获取json数据
    getJSON: function( url, data, callback ) {
        // 如果传入2个参数，那么第二个则为回调
        callback = callback || data || function(){};
        $.ajax({
            url: url,
            data: data,
            dataType: 'json',
            success: callback
        });
    },

    // 用来加载js脚本
    getScript: function( url, callback ) {
        $.ajax({
            url: url,
            dataType: 'script',
            success: callback
        });
    }
});
