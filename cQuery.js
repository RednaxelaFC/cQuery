/*
 *  cQuery 框架
 *  RednaxelaFC
 *  陈邦
 *  chenbangjob@foxmail.com
 */ 


// [?: jk] 是未解决问题

( function (window, undefined) {


var arr = [],
    push = arr.push,
    slice = arr.slice,
    concat = arr.concat;
    
    cQuery = function cQuery ( html ) {
        return new cQuery.fn.init( html );
    };

cQuery.fn = cQuery.prototype = {
    constructor: cQuery,
    
    length: 0,
    
    init: function ( html ) {
        var oldFn;
        
        if ( !html ) return this;
        
        // 字符串
        if ( cQuery.isString( html ) ) {
            // html 标签
            if ( html.charAt( 0 ) === '<' ) {
                
                push.apply( this, cQuery.parseHTML( html ) );
                
            } else {
                
                push.apply( this, cQuery.select( html ) );
            }
            
        // 函数
        } else if ( cQuery.isFunction( html ) ) {
            oldFn = window.onload;
            if ( cQuery.isFunction( oldFn ) ) {
                window.onload = function () {
                    oldFn();
                    html();
                };
            } else {
                window.onload = html;
            }

        // DOM    
        } else if ( cQuery.isDOM( html ) ) {
            this[ 0 ] = html;
            this.length = 1;
        // cQuery 元素    
        } else if ( cQuery.iscQuery( html ) ) {
            // 将 html 中所有的成员添加到 this 中
            push.apply( this, html );
        }
        
    },
    // 基本的遍历与映射
    each: function ( callback ) {
        cQuery.each( this, callback );
    },
    map: function ( callback ) {
        return cQuery.map( this, callback );
    }
};
cQuery.fn.init.prototype = cQuery.prototype;


cQuery.extend = cQuery.fn.extend = function ( obj ) {
    var k;
    for ( k in obj ) {
        this[ k ] = obj[ k ];
    }
};


//
// 选择器引擎 select
// 简单实现
// by jk
//
var select = 
// cQuery.js

( function ( window, undesined ) {


var arr = [],
    push = arr.push,
    slice = arr.slice,
    
    rquickExpr = /^(?:#(\w+)|\.([\w-]+)|(\w+)|(\*))$/,
    rtokenQuickExpr = /^(?:#([\w-]+)|\.([\w-]+)|([\w-]+)|(\*))/,
    rtokenSubExpr = /^\s*(?:(\s+)|(>))\s*/,
    rtokenSiblingExpr = /^\s*(?:(\+)|(~))\s*/,
    rtokenAttrExpr = /^\[\s*(\w+)\s*(?:([!*~\|]|)=\s*([^\]]+)|)\s*\]/,
    // rtokenFormExpr = /^:(button|input|text|select...)/,
    
    
    // 基础方法
    getId = function ( idName ) {
        var node = document.getElementById( idName );
        return node ? [ node ] : null;
    },
    getTag = function ( tagName ) {
        return document.getElementsByTagName( tagName );
    },
    getClass = function ( className ) {
        return document.getElementsByClassName( className );
    },
    
    
    
    // 提供工具方法
    trim = function ( str ) {
        return str.replace( /^\s+|\s+$/, "" ); 
    },
    indexOf = function ( list, elem, start ) {
        start = start || 0;
        var i;
        for ( i = start; i < list.length; i++ ) {
            if ( list[ i ] == elem ) {
                return i;
            }
        }
        return -1;
    },
    removeRecur = function ( list ) {
        var newArr = [], k;
        for ( k in list ) {
            if ( indexOf( newArr, list[ k ] ) == -1 ) {
                newArr.push( list[ k ] );
            }
        }
        return newArr;
    },
    tokenize = function ( selector ) {
        var tokens = [],
            newSelector = selector,
            m
            i = 0;
        
        while ( newSelector ) {
            
            // 基本选择器分析
            m = rtokenQuickExpr.exec( newSelector );
            if ( m ) {
                if ( m[ 1 ] ) {             // id
                    tokens.push( { value: m[ 1 ], type: "ID" } );
                } else if ( m[ 2 ] ) {      // class
                    tokens.push( { value: m[ 2 ], type: "CLASS" } );
                } else if ( m[ 3 ] ) {      // tag
                    tokens.push( { value: m[ 3 ], type: "TAG" } );
                } else if ( m[ 4 ] ) {      // *
                    tokens.push( { value: m[ 4 ], type: "*" } );
                }
                newSelector = newSelector.slice( m[0].length );
                i++;
            }
            
            // 子元素选择器分析
            m = rtokenSubExpr.exec( newSelector );
            if ( m ) {
                if ( m[ 1 ] ) {             // 后代
                    tokens.push( { value: m[ 1 ], type: " " } );
                } else if ( m[ 2] ) {       // 子代
                    tokens.push( { value: m[ 2 ], type: ">" } );
                }
                newSelector = newSelector.slice( m[0].length );
                i++;
            }
            
            
            // 兄弟选择器分析
            m = rtokenSiblingExpr.exec( newSelector );
            if ( m ) {
                if ( m[ 1 ] ) {             // +
                    tokens.push( { value: m[ 1 ], type: "+" } );
                } else if ( m[ 2 ] ) {      // ~
                    tokens.push( { value: m[ 2 ], type: "~" } );
                }
                newSelector = newSelector.slice( m[ 0 ].length );
                i++;
            }
            
            // 属性选择器解析
			m = rtokenAttrExpr.exec( newSelector );
			if ( m ) {
				// 属性名, 运算符, 值
				// [ (name) ()= (value) ]
				attr = { type: "ATTR" };
				if ( m[ 1 ] ) {
					attr.value = m[ 1 ];
				}
				if ( m[ 2 ] ) {
					attr.oper = m[ 2 ];
				}
				if ( m[ 3 ] ) {
					attr.value2 = m[ 3 ];
				}
				tokens.push( attr );
				
				newSelector = newSelector.slice( m[ 0 ].length );
                i++;
			}
			
			if ( i === 0 ) throw new Error( '尚未支持该选择器: ' + selector + "\n请联系: jk@jklib.org" );
            
            i = 0;
        }
        
        return tokens;
    },
    select2 = function ( selector, results ) {
        results = results || [];
            
        // 假定 selector 为: ".c div > div >   p" 
        var tokens = tokenize( selector ),
            tempSelector,
            relative = "doc",
            nodes = [],                 // 存储临时数据 
            tempNodes = [],             // 临时数据
            tempNodes2 = [],
			attrValue,
            node,
            i, j;
            

        // tokens 中的元素为 { value, type }
        // 第一次找到的元素放在 nodes 中, 
        // 第二次在 nodes 中找寻元素, 放在 tempNodes 中
        // 最后 nodes = tempNodes 
        while ( tokens.length ) {
            tempSelector = tokens.shift();
            
            // 判断是什么类型
            // 获取元素
            if ( tempSelector.type === "ID" ) {
                tempNodes.push( document.getElementById( tempSelector.value ) );
            }
            
            if ( tempSelector.type === "CLASS" ) {
                // 是在 document 下找, 还是在 元素下找
                switch ( relative ) {
                    case "doc": 
                        tempNodes = document.getElementsByClassName( tempSelector.value );
                        break;
                    case " ": 
                        // 在后代元素中找
                        for ( i = 0; i < nodes.length; i++ ) {
                            push.apply( tempNodes, nodes[ i ].getElementsByClassName( tempSelector.value ) );    
                        }
                        break;
                    case ">": 
                        // 在子带元素中找
                        for ( i = 0; i < nodes.length; i++) {
                            if ( !nodes[ i ].childNodes ) continue;
                            for ( j = 0; j < nodes[ i ].childNodes.length; j++ ) {
                                node = nodes[ i ].childNodes[ j ];
                                if ( ( " " + node.className + " " ).indexOf( tempSelector.value ) != -1 ) {
                                    tempNodes.push( node );
                                } 
                            }
                        }
                        break;
                    case "+":
                        // 在 nodes 中找到下一个元素, 存到 tempNodes 中
                        for ( i= 0; i < nodes.length; i++ ) {
                            node = nodes[i];
                            while ( node = node.nextSibling ) {
                                if ( node.nodeType === 1 ) {
                                    // 判断是否符合选择器
                                    if ( ( " " + node.className + " ").indexOf( tempSelector.value ) != -1 ) {
                                        tempNodes.push( node );
                                    }
                                    break; // 无论是否符合都结束
                                }
                            }
                        }
                        break;
                        
                    case "~":
                        // 在 nodes 中找出后面的所有符合选择器的元素
                        for ( i = 0; i < nodes.length; i++ ) {
                            node = nodes[i];
                            while ( node = node.nextSibling ) {
                                
                                if ( node.nodeType === 1 && 
                                        ( " " + node.className + " ").indexOf( tempSelector.value ) != -1 ) {
                                    tempNodes.push( node );
                                }
                                
                            }
                            
                        }
                        break;
                }
            } 
            
            if ( tempSelector.type === "TAG" ) {
                switch ( relative ) {
                    case "doc": 
                        tempNodes = document.getElementsByTagName( tempSelector.value );
                        break;
                    case " ": 
                        // 在后代元素中找
                        for ( i = 0; i < nodes.length; i++ ) {
                            push.apply( tempNodes, nodes[ i ].getElementsByTagName( tempSelector.value ) );
                        }
                        break;
                    case ">": 
                        // 在子带元素中找
                        for ( i = 0; i < nodes.length; i++) {
                            if ( !nodes[ i ].childNodes ) continue;
                            for ( j = 0; j < nodes[ i ].childNodes.length; j++ ) {
                                node = nodes[ i ].childNodes[ j ];
                                if ( node.nodeType === 1 && node.nodeName.toLowerCase() === tempSelector.value ) {
                                    tempNodes.push( node );
                                } 
                            }
                        }
                        break;

                    case "+":
                        // 在 nodes 中找到下一个元素, 存到 tempNodes 中
                        for ( i= 0; i < nodes.length; i++ ) {
                            node = nodes[i];
                            while ( node = node.nextSibling ) {
                                if ( node.nodeType === 1 ) {
                                    // 判断是否符合选择器
                                    if ( node.nodeName.toLowerCase() === tempSelector.value ) {
                                        tempNodes.push( node );
                                    }
                                    break; // 无论是否符合都结束
                                }
                            }
                        }
                        break;
                        
                    case "~":
                        // 在 nodes 中找出后面的所有符合选择器的元素
                        for ( i = 0; i < nodes.length; i++ ) {
                            node = nodes[i];
                            while ( node = node.nextSibling ) {
                                
                                if ( node.nodeType === 1 && 
                                        node.nodeName.toLowerCase() === tempSelector.value  ) {
                                    tempNodes.push( node );
                                }
                                
                            }
                            
                        }
                        break;                
                }
            }
            
            if ( tempSelector.type === "*" ) {
                switch ( relative ) {
                    case "doc": 
                        tempNodes = document.getElementsByTagName( tempSelector.value );
                        break;
                    case " ": 
                        // 在后代元素中找
                        for ( i = 0; i < nodes.length; i++ ) {
                            push.apply( tempNodes, nodes[ i ].getElementsByTagName( tempSelector.value ) );
                        }
                        break;
                    case ">": 
                        // 在子带元素中找
                        for ( i = 0; i < nodes.length; i++) {
                            if ( !nodes[ i ].childNodes ) continue;
                            for ( j = 0; j < nodes[ i ].childNodes.length; j++ ) {
                                node = nodes[ i ].childNodes[ j ];
                                if ( node.nodeType === 1 ) {
                                    tempNodes.push( node );
                                } 
                            }
                        }
                        break;

                    case "+":
                        // 在 nodes 中找到下一个元素, 存到 tempNodes 中
                        for ( i= 0; i < nodes.length; i++ ) {
                            node = nodes[i];
                            while ( node = node.nextSibling ) {
                                if ( node.nodeType === 1 ) {
                                    tempNodes.push( node );
                                    break; // 无论是否符合都结束
                                }
                            }
                        }
                        break;
                        
                    case "~":
                        // 在 nodes 中找出后面的所有符合选择器的元素
                        for ( i = 0; i < nodes.length; i++ ) {
                            node = nodes[i];
                            while ( node = node.nextSibling ) {
                                
                                if ( node.nodeType === 1 ) {
                                    tempNodes.push( node );
                                }
                                
                            }
                            
                        }
                        break;
                }
            }
            
            
            
            if ( tempSelector.type === "ATTR") {
				// doc 	证明是在 document 中所有的元素上过滤
				// !dic 证明是在当前元素上过滤
				// > 	证明是在子元素中过滤
				// " "	证明是在后代元素中过滤
				// 当前元素是 nodes, 找到后放到 tempNodes 中
				// 属性有 ~, |, =, !=
				switch ( relative ) {
					case "doc": 
						// console.log( 1 );
						tempNodes2 = document.getElementsByTagName( "*" );
						for ( i = tempNodes2.length - 1; i >= 0 ; i-- ) {
							// 有该属性 再做其他判断
							// 如果有 oper 就一定有 value2
                            // 报错, script 等标签, 没有 getAttribute 属性
							if ( attrValue = tempNodes2[ i ][ tempSelector.value == 'class' ? 'className' : tempSelector.value ] ) {
                                // 有这个属性了
								// if ( tempSelector.oper === "" ) {			// =
                                if ( !tempSelector.oper && tempSelector.value2 ) {			// =
								    if ( attrValue == tempSelector.value2 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( tempSelector.oper === "!" ) {	// !=
								    if ( attrValue != tempSelector.value2 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( tempSelector.oper === "*" ) {	// *=
								    if ( attrValue.indexOf( tempSelector.value2 ) != -1 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( tempSelector.oper === "|" ) {	// |= 
								    if ( attrValue.indexOf( tempSelector.value2 + "-" ) != -1 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( !tempSelector.oper && !tempSelector.value2 ) {
                                    tempNodes.push( tempNodes2[ i ] ); 
                                }
							}
						}
						break;
					case "!doc": 
						// console.log( 2 );
                        tempNodes2 = nodes;
						for ( i = tempNodes2.length - 1; i >= 0 ; i-- ) {
							// 有该属性 再做其他判断
							// 如果有 oper 就一定有 value2
                            // 报错, script 等标签, 没有 getAttribute 属性
							if ( attrValue = tempNodes2[ i ][ tempSelector.value == 'class' ? 'className' : tempSelector.value ] ) {
								// if ( tempSelector.oper === "" ) {			// =
                                if ( !tempSelector.oper && tempSelector.value2 ) {			// =
								    if ( attrValue == tempSelector.value2 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( tempSelector.oper === "!" ) {	// !=
								    if ( attrValue != tempSelector.value2 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( tempSelector.oper === "*" ) {	// *=
								    if ( attrValue.indexOf( tempSelector.value2 ) != -1 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( tempSelector.oper === "|" ) {	// |= 
								    if ( attrValue.indexOf( tempSelector.value2 + "-" ) != -1 ) {
                                        tempNodes.push( tempNodes2[ i ] );
                                    }
								} else if ( !tempSelector.oper && !tempSelector.value2 ) {
                                    tempNodes.push( tempNodes2[ i ] ); 
                                }
							}
						}
						break;
					case ">": 
						// console.log( 3 );
                        for ( j = 0; j < nodes.length; j++ ) {
                            tempNodes2 = nodes[ j ].childNodes;
                            for ( i = tempNodes2.length - 1; i >= 0 ; i-- ) {
                                // 有该属性 再做其他判断
                                // 如果有 oper 就一定有 value2
                                // 报错, script 等标签, 没有 getAttribute 属性
                                if ( attrValue = tempNodes2[ i ][ tempSelector.value == 'class' ? 'className' : tempSelector.value ] ) {
                                    // if ( tempSelector.oper === "" ) {			// =
                                    if ( !tempSelector.oper && tempSelector.value2 ) {			// =
                                        if ( attrValue == tempSelector.value2 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( tempSelector.oper === "!" ) {	// !=
                                        if ( attrValue != tempSelector.value2 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( tempSelector.oper === "*" ) {	// *=
                                        if ( attrValue.indexOf( tempSelector.value2 ) != -1 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( tempSelector.oper === "|" ) {	// |= 
                                        if ( attrValue.indexOf( tempSelector.value2 + "-" ) != -1 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( !tempSelector.oper && !tempSelector.value2 ) {
                                        tempNodes.push( tempNodes2[ i ] ); 
                                    }
                                }
                            }   
                        }
						break;
					case " ": 
						// console.log( 4 );
                        for ( j = 0; j < nodes.length; j++ ) {
                            tempNodes2 = nodes[ j ].getElementsByTagName( '*' );
                            for ( i = tempNodes2.length - 1; i >= 0 ; i-- ) {
                                // 有该属性 再做其他判断
                                // 如果有 oper 就一定有 value2
                                // 报错, script 等标签, 没有 getAttribute 属性
                                if ( attrValue = tempNodes2[ i ][ tempSelector.value == 'class' ? 'className' : tempSelector.value ] ) {
                                    // if ( tempSelector.oper === "" ) {			// =
                                    if ( !tempSelector.oper && tempSelector.value2 ) {			// =
                                        if ( attrValue == tempSelector.value2 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( tempSelector.oper === "!" ) {	// !=
                                        if ( attrValue != tempSelector.value2 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( tempSelector.oper === "*" ) {	// *=
                                        if ( attrValue.indexOf( tempSelector.value2 ) != -1 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( tempSelector.oper === "|" ) {	// |= 
                                        if ( attrValue.indexOf( tempSelector.value2 + "-" ) != -1 ) {
                                            tempNodes.push( tempNodes2[ i ] );
                                        }
                                    } else if ( !tempSelector.oper && !tempSelector.value2 ) {
                                        tempNodes.push( tempNodes2[ i ] ); 
                                    }
                                }
                            }   
                        }
						break;
				}
			}
            
            
            
            
            // 处理关系
            if ( tempSelector.type === " " ) {
                relative = " ";
                continue;
            }
            
            if ( tempSelector.type === ">" ) {
                relative = ">";
                continue;
            }
            
            
             if ( tempSelector.type === "+" ) {
                relative = "+";
                continue;
            }
            
            if ( tempSelector.type === "~" ) {
                relative = "~";
                continue;
            }
            
            
            
            
            nodes = slice.call( tempNodes );
            tempNodes = [];
            relative = "!doc";
        }

        // 去重复数据
        nodes = removeRecur( nodes );

        push.apply( results, nodes );

        return results;

        
    };


// 选择器方法
var select = function ( selector, results ) {
    results = results || [];
    
    var selectors = selector.split( "," ),
        m, i = 0;
    
    for ( ; i < selectors.length; i++ ) {
        // 快速匹配元素
        m = rquickExpr.exec( trim( selectors[ i ] ) );
        if ( m ) {
            
            if ( m[ 1 ] ) {                     // id
                push.apply( results, getId( m[ 1 ] ) );
            } else if ( m[ 2 ] ) {              // class
                push.apply( results, getClass( m[ 2 ] ) );
            } else if ( m[ 3 ] ) {              // tag
                push.apply( results, getTag( m[ 3 ] ) );
            } else if ( m[ 4 ] ) {              // *
                push.apply( results, getTag( m[ 4 ] ) );
            }
        
        
        } else {
            // 如果快速匹配不能完成再进行子元素过滤
            
            results = select2( trim( selectors[ i ] ), results );
        }
    }
    return results;
};


return select;


} )( window );

cQuery.select = select;



// 添加类型检查
cQuery.extend( {
    iscQuery: function ( obj ) {
        return !!obj && !!obj.constructor && 
                ( ( obj.constructor.name || 
                /function\s*(.+?)\s*\(/.exec( obj.constructor + '' )[ 1 ] ) === 'cQuery' );
    },
    isString: function ( obj ) {
        return typeof obj === 'string';
    },
    isFunction: function ( obj ) {
        return typeof obj === 'function';
    },
    isDOM: function ( obj ) {
        return !!( obj && obj.nodeType );
    },
    isArray: function ( obj ) {
        return obj instanceof Array;
    },
    isLikeArray: function ( obj ) {
        return obj.length !== undefined && obj.length >= 0 && obj.length < ( 1 << 30 );
    }
} );



// 工具方法
cQuery.extend( {
    parseHTML: function ( html ) {
        var doms = [],
            div = document.createElement( "div" ),
            nodes, i;
            
        div.innerHTML = html;
        nodes = div.childNodes;
        for ( i = 0; i < nodes.length; i++ ) {
            doms.push( nodes[ i ] );
        }
        
        return doms;
    },
    deepCloneNode: function ( node, targetNode ) {
        var i, newNode, list;
            
        if ( !targetNode ) {
            newNode = node.cloneNode();
            cQuery.deepCloneNode( node, newNode );
        } else {
            list = node.childNodes;
            for ( i = 0; i < list.length; i++ ) {
                targetNode.appendChild( newNode = list[ i ].cloneNode() );
                // 将 list[ i ] 拷贝, 加到 targetNode 中.
                // 同时 list[ i ] 下面的内容应该添加到 刚刚拷贝的对象上
                cQuery.deepCloneNode( list[ i ], newNode );
            }
        }
        return newNode;
    },
    each: function ( arr, callback ) {
        var i, k, len;
        
        if ( arr ) {
            if ( cQuery.isLikeArray( arr ) ) {
                len = arr.length;
                for ( i = 0; i < len; i++ ) {
                    if ( callback.call( arr[ i ], i, arr[ i ] ) === false ) {
                        break;
                    }
                }
                
            } else {
                
                for ( k in arr ) {
                    
                    if ( callback.call( arr[ k ], k, arr[ k ] ) === false ) {
                        break;
                    }
                }
                
            }
        }
        
        return arr;
    },
    map: function ( arr, callback, target ) {
        var results = [], res, len, i, k;
        if ( cQuery.isLikeArray( arr ) ) {   // 数组
            len = arr.length;
            for ( i = 0; i < len; i++ ) {
                res = callback( arr[ i ], i, target );
                if ( res ) {
                    results.push( res );
                }
            }
        } else {                        // 对象
            for ( k in arr ) {
                res = callback( arr[ k ], k, target );
                if ( res ) {
                    results.push( res );
                }
            }
        }
        return results.concat.apply( [], results );
    },
    unique: function ( obj ) {
        var target = cQuery(),
            i;
        cQuery.each( obj, function ( k, v ) {
            // v 就是元素, 在 target 中如果没有 v 就加入
            if ( !cQuery.contains( target, v ) ) {
                [].push.call( target, v );
            }
        } );
        return target;
    },
    contains: function ( container, contained ) {
        // 在 container 中判断是否存在 contained
        var er = cQuery( container ),
            ed = cQuery( contained ),
            i, j, len;
        for ( i = 0; i < er.length; i++ ) {
            len = 0;
            for ( j = 0; j < ed.length; j++ ) {
                if ( er[ i ] === ed[ j ] ) len++;
            }
            if ( len === ed.length ) return true;
        }
        return false;
    },
    filter: function ( src, sear ) {
        // 在 src 中过滤 sear, 符合的才过滤出来
        var s = cQuery( src ), 
            c = cQuery( sear ),
            o = cQuery(),
            i, j;
        cQuery.each( s, function ( i, v ) {
            cQuery.each( c, function ( i2, v2 ) {
                if ( v === v2 ) {
                    cQuery.push.call( o, v );
                }    
            });
        });
        
        return o;
    },
    indexOf: function ( arr, obj ) {
        var res = -1,
            isString = cQuery.isString( arr ),
            m;
        
        if ( isString ) {
            m = new RegExp( arr ).exec( obj );
            if ( m ) {
                res = m.index;
            }
        } else {
            cQuery.each( arr, function ( i, v ) {
                // 如果是数组, 判断相等, 如果是字符串
                if ( v === obj ) {
                    res = i;
                    return false;
                }
            } );
        }
        return res;
    },
    trim: (function () {
        var r = /^\s+|\s+$/g;
        return function ( str ) {
            return str.replace( r, '' );     
        };
    })(),
    push: push,
    slice: slice,
    concat: concat
} );




// DOM 操作

// DOM 操作的工具方法
var insertAfter = function ( newNode, node ) {
        var parent = node.parentNode;
        if ( parent.lastChild === node ) {
            parent.appendChild( newNode );
        } else {
            parent.insertBefore( newNode, node.nextSibling );
        }
    }, 
    insertBefore = function ( newNode, node ) {
        node.parentNode.insertBefore( newNode, node );
    }, 
    prependChild = function ( newNode, parentNode ) {
        if ( parentNode.firstChild ) {
            parentNode.insertBefore( newNode, parentNode.firstChild );
        } else {
            parentNode.appendChild( newNode );
        }
    }, 
    appendChild = function ( newNode, parentNode ) {
        parentNode.appendChild( newNode );
    };

cQuery.fn.extend( {
    appendTo: function ( html ) {
        // 传入的可以是 字符串( 选择器 ), dom 对象, cQuery 对象
        var target = cQuery( html ),
            i, j;
        
        // 将 this[ i ] 加到 target[ i ] 上
        for ( i = 0; i < target.length; i++ ) {
            
            for ( j = 0; j < this.length; j++ ) {
                target[ i ].appendChild( ( j === this.length - 1 && i === target.length - 1 ) ? 
                                            this[ j ] : 
                                            cQuery.deepCloneNode( this[ j ] ) );    
            }
        }
        //
        
        return this;
    },
    append: function ( elem ) {
        var target = I( elem ), 
            i, j;
        // 将 elem 加到 this 上
        for ( i = 0; i < this.length; i++ ) {
            for ( j = 0; j < target.length; j++ ) {
                // 将 target[ j ] 加到 this[ i ] 上
                this[ i ].appendChild( i === this.length - 1 && j === target.length - 1 ?
                                        target[ j ] :
                                        cQuery.deepCloneNode( target[ j ] ) );
            }
        }
        
        return this;
    }, 
    prependTo: function ( elem ) {
        var target = cQuery( elem ),
            node,
            i, j;
        // 将 this 添加到 elem 中
        for ( i = 0; i < target.length; i++ ) {
            for ( j = 0; j < this.length; j++ ) {
                node = i === target.length - 1 && j === this.length - 1 ? 
                        this[ j ] :
                        cQuery.deepCloneNode( this[ j ] );
                
                prependChild( node, target[ i ] );
            }
        }
        
        return this;
    },
    prepend: function ( elem ) {
        // 将 elem 添加到 this 中的前
        var target = cQuery( elem ),
            node,
            i, j;
        
        for ( i = 0; i < this.length; i++ ) {
            for ( j = 0; j < target.length; j++ ) {
                node = i === this.length - 1 && j === target.length - 1 ? 
                        target[ j ] :
                        cQuery.deepCloneNode( target[ j ] );
                        
                prependChild( node, this[ i ] );
            }
        }
        
        return this;
    },
    after: function ( elem ) {
        // 将 elem 加到 this 的后面
        var target = cQuery( elem ),
            node,
            i, j;
        
        for ( i = 0; i < this.length; i++ ) {
            for ( j = 0; j < target.length; j++ ) {
                // 将 target[ j ] 加到 this[ i ] 后面
                node = i === this.length - 1 && j === target.length - 1 ? 
                        target[ j ] :
                        cQuery.deepCloneNode( target[ j ] );
                insertAfter( node, this[ i ] );
            }
        }
        
        return this;
    }, 
    before: function ( elem ) {
        // 将 elem 加到 this 的前面
        var target = cQuery( elem ),
            node,
            i, j;
        
        for ( i = 0; i < this.length; i++ ) {
            for ( j = 0; j < target.length; j++ ) {
                // 将 target[ j ] 加到 this[ i ] 前面
                node = i === this.length - 1 && j === target.length - 1 ? 
                        target[ j ] :
                        cQuery.deepCloneNode( target[ j ] );

                insertBefore( node, this[ i ] );
            }
        }
        
        return this;
    },
    // [?: jk]
    remove: function ( selector ) {
        // 该框架没有添加 选择器缓存, 故实现该方法过滤较繁琐. 有待更新. jk: 20160330
        // 将 this[ i ] 删除
        var target = cQuery( selector ), 
            i, j;
        
        for ( i = 0; i < this.length; i++ ) {
            
            if ( target.length == 0 ) {
                this[ i ].parentNode.removeChild( this[ i ] );   
                continue;
            }
            
            // 如果 this[ i ] 符合 selector 选择器, 则删除
            for ( j = 0; j < target.length; j++ ) {
                if ( this[ i ] === target[ j ] ) {
                    this[ i ].parentNode.removeChild( this[ i ] );   
                }   
            }
        }
        
    }
} );


// [?: jk]
// DOM 操作
// 获得元素的快速方法 ( 会破坏链 )
cQuery.fn.extend( {
    parent: function ( selector ) {
        // 获得 this 的父节点, 如果有 selector 则在中间筛选
        var target = cQuery( selector ),
            obj = cQuery(), 
            i, j;

        // this[ i ] 的 父节点
        for ( i = 0; i < this.length; i++ ) {
            if ( !target.length ) {
                push.call( obj, this[ i ].parentNode )
                continue;
            }
            
            for ( j = 0; j < target.length; j++ ) {
                if ( this[ i ].parentNode === target[ j ] ) {
                    push.call( obj, this[ i ].parentNode ); 
                }
                
            }
        }
        return cQuery.unique( obj );
    },
    children: function ( selector ) {
        var target = cQuery( selector ),
            obj = cQuery(),
            temp,
            i;
        // 获得 this 中的所有元素
        for ( i = 0; i < this.length; i++ ) {
            // cQuery.push.apply( obj, this[ i ].childNodes );
            cQuery.each( this[ i ].childNodes, function ( index, v ) {
                
                if ( v.nodeType !== undefined && v.nodeType === 3 ) return;
                
                cQuery.push.apply( obj, selector ? cQuery( v ).filter( selector ) : cQuery( v ) );
                // 递归
                // cQuery.push.apply( obj, cQuery( v ).children( selector ) );
            } );
        }
        
        return cQuery.unique( obj );
    },
    find: function ( selector ) {
        var target = cQuery( selector ),
            obj = cQuery();
        // 在 this 后代中找所有的 复合 selector 的数据
        cQuery.each( this, function ( i, v ) {
            // v 就是每一个元素, 看的是 它的子元素
            if ( v.nodeType !== undefined && v.nodeType === 3 ) return;
            // 看当前元素是否符合要求
            cQuery.push.apply( obj, cQuery( v ).filter( selector ) );
            // 在后代元素中看是否复合要求
            cQuery.each( v.childNodes, function ( index, value ) {
                // 递归
                cQuery.push.apply( obj, cQuery( value ).find( selector ) ); 
            });
        });
        
        return cQuery.unique( obj );
    },
    filter: function ( selector ) {
        return cQuery.filter( this, selector );
    },
    next: function ( selector ) {
        // 在 this[ i ] 中找到下一个兄弟节点, 并返回
        var target = cQuery(),
            arr = this.map( function ( v, i ) {
                // 获得 this 的下一个元素
                var temp = cQuery.nextSibling( v );
                if ( !selector ) {
                    return temp;
                } else {   
                    return cQuery.slice.apply( cQuery( temp ).filter( selector ) );
                }
            });
        cQuery.push.apply( target, arr );
        return target;
    },
    nextAll: function ( selector ) {
        // 获得 this[ i ] 后面的所有元素
        var target = cQuery(),
            arr = this.map( function ( v, i ) {
                // 获得 v 后面的所有元素
                return cQuery.nextNodes( v );
            } );
        cQuery.push.apply( target, arr );
        
        return !selector ? target : target.filter( selector );
    },
    prev: function ( selector ) {
        // 如果有参数, 则判断返回的结果, 如果没有参数直接返回
        // 获得 this[ i ] 的 prev 元素
        var obj = cQuery(), // 容器
            array = this.map( function ( v, i ) {
                // 获得 this[ i ] 的前一个元素
                var temp = cQuery.prevSibling( v );
                if ( !selector ) {
                    return temp;
                } else {   
                    return cQuery.slice.apply( cQuery( temp ).filter( selector ) );
                }
            } );
        cQuery.push.apply( obj, array );
        return obj;
    },
    prevAll: function ( selector ) {
        // 获得 this 前的所有元素
        var obj = cQuery(),
            array = this.map( function ( v, i ) {
                // 返回所有元素
                return cQuery.prevNodes( v )
            } );
        cQuery.push.apply( obj, array );
        return !selector ? obj: obj.filter( selector );
    },
    siblings: function ( selector ) {
        // 获得 this[ i ] 前后的所有元素
        var prevs = this.prevAll( selector ),
            nexts = this.nextAll( selector ),
            obj = cQuery();
        cQuery.push.apply( obj, prevs );
        cQuery.push.apply( obj, nexts );
        return cQuery.unique( obj );
    }
} );

// [?: jk]
// DOM 操作帮助方法( 会破坏链 )
cQuery.extend({
    nextSibling: function ( node ) {
        var newNode = node;
        while ( newNode = newNode.nextSibling ) {
            if ( newNode.nodeType === 1 ) {
                return newNode;
            }
        }
    },
    nextNodes: function ( node ) {
        var arr = [], newNode = node;
        while ( newNode = newNode.nextSibling ) {
            if ( newNode.nodeType === 1 ) {
                arr.push( newNode );
            }
        }
        return arr;
    },
    prevSibling: function ( node ) {
        // 获得 node 元素前面的元素
        var newNode = node;
        while ( newNode = newNode.previousSibling ) {
            if ( newNode.nodeType === 1 ) {
                return newNode;
            }
        }
    },
    prevNodes: function ( node ) {
        // 获得 node 元素前面的所有元素
        var nodes = [], newNode = node;
        while ( newNode = newNode.previousSibling ) {
            if ( newNode.nodeType === 1 ) {
                nodes.push( newNode );
            }
        }
        return nodes;
    }
});




// 事件处理

var addEvent = function ( obj, type, fn ) {
    var fEventHandler = function ( e ) {
        e = window.event || e;
        fn.call( this, cQuery.Event( e ) );  // 修改上下文调用
    }
    
    if ( obj.addEventListener ) {
        obj.addEventListener( type, fEventHandler );
    } else {
        obj.attachEvent( 'on' + type, fEventHandler );
    }
};


cQuery.fn.extend({
    on: function ( type, fn ) {
        this.each( function () {
            addEvent( this, type, fn );
        } );
        
        return this;
    }
});


cQuery.each( ( 'click keydown keyup keypress focus submit ' + 
                'mousedown mouseup mouseenter mouseleave mouseover ' +
                'mouseout mousemove' ).split( ' ' ), function ( k, v ) {
    var that = this;
    cQuery.fn[ this ] = function ( fn ) {
        this.on( that, fn );
        
        return this;
    };
});



// 事件对象
cQuery.Event = function ( e ) {
    return new cQuery.Event.fn.init( e );
};
cQuery.Event.fn = cQuery.Event.prototype = {
    constructor: cQuery.Event,
    
    init: function ( e ) {
        this.event = e;
        // 事件类型
        this.type = e.type;
        // 坐标
        this.clientX = e.clientX;
        this.clientY = e.clientY;
        this.screenX = e.screenX;
        this.screenY = e.screenY;
        this.pageX = e.pageX;
        this.pageY = e.pageY;
        
        // 控制属性
        this.altKey = e.altKey;
        this.shiftKey = e.shiftKey;
        this.ctrlKey = e.ctrlKey;
        
        // 事件源对象与事件对象( 未考虑 IE )
        // IE 使用 srcElement
        // 火狐中使用 target
        this.target = this.target || this.srcElement;
        this.currentTarget = this.currentTarget;
        
        // 鼠标键属性
        // IE 左中右: 142
        // 火狐 : 012
        if ( e === window.event ) {
            // 1 4 2
            this.which = [ undefined, 0, 2, undefined, 1 ][ e.button ];
        } else {
            this.which = e.button;
        }
    },
    
    stopPropagation: function () {
        if ( this.event.stopPropagation ) {
            this.event.stopPropagation();
        }
        this.event.cancelBubble = true;
    }
};
cQuery.Event.fn.init.prototype = cQuery.Event.prototype;



// 简化后的 hover 与 toggle 方法
cQuery.fn.extend({
    hover: function ( fn1, fn2 ) {
        // 将 fn1 绑定到 this 的 mouseover 事件上
        this.mouseover( fn1 );
        // 将 fn2 绑定到 this 的 mouseout 事件上
        if ( fn2 ) {
            this.mouseout( fn2 );
        }
        
        
        return this;
    },
    toggle: function ( fn1, fn2 ) {
        var i = 0,
            args = arguments,
            l = arguments.length;
        this.click( function ( e ){ 
            args[ i++ % l ].call( this, e );
        });
        
        
        return this;
    }
});


// 获得元素 get 方法
cQuery.fn.extend({
    get: function ( index ) {
        if ( index === undefined ) {
            return cQuery.concat.apply( [], this );
        } else {
            return this[ index ];
        }
    }
});



// 样式操作
cQuery.fn.extend({
    css: function ( cssName, cssValue ) {
        if ( cQuery.isString( cssName ) && !cssValue ) {
            return this.get( 0 ).style[ cssName ];
        }
        this.each( function () {
            var that = this;
            if ( cssValue ) {
                this.style[ cssName ] = cssValue;
            } else {
                cQuery.each( cssName, function ( k, v ) {
                    that.style[ k ] = v;
                });
            }
        });
        
        return this;
    },
    hasClass: function ( className ) {
        // 判断第一个元素
        return cQuery.indexOf( ' ' + this.get( 0 ).className + ' ', ' ' + className + ' ' ) !== -1; 
    },
    addClass: function ( className ) {
        this.each( function () {  
            this.className += ( this.className ? ' ' : '' ) + className;    
        });
        
        return this;
    },
    removeClass: function ( className ) {
        this.each(function ( i, v ) {
            // 移除 this.className 中的 className
            var cssValue = this.className;
            cssValue = cQuery.trim( ( ' ' + cssValue + ' ' )
                                    .replace( new RegExp( ' ' + className + ' ', 'g' ), '' ) );
            this.className = cssValue;
        });
        
        return this;
    },
    toggleClass: function ( cssName ) {
        if ( this.hasClass( cssName ) ) {
            this.removeClass( cssName );
        } else {
            this.addClass( cssName );
        }
        
        return this;
    }
});


window.cQuery = window.C = cQuery;

} )( window )
