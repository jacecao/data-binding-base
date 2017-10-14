/*
	这个主要是通过事件触发数据检查功能
	通过数据检查来实现数据绑定
	因为代码里使用了forEach(),addEventListener()
	所以不支持低版本浏览器，请在IE9以上运行代码
 */

/*
	config = {
		ele: 需要执行模块操作的元素，
		data: 需要初始绑定的数据对象
	}
 */
(function (){

	var June = function (config) {
		// 选取要指定操作的DOM
		// 注意这里应该设置config的默认值和报错信息
		// 作为演示我们暂不加入这些机制
		try {
			var ele = document.querySelector(config.ele);
		} catch (error) {
			console.info('please update your browser');
		}
		var data = config.data || {};

		// 注意这里我们希望使用June这个方法是作为一个基础模块
		// 而不是一个原型对象，所以在使用过程中不需要new实例
		// 最后直接返回一个实例对象出去
		
		// 注意这样的做法是不对的，想想为什么
		// 这里不能使用this,取决于我们怎样定义和使用June这个对象
		// 因为这里我们不需要对June作实例操作
		// 所以这里使用this，不是指向June，而是window
		// return new this.init(ele, data);
		return new June.prototype.init(ele, data);
		// 结尾处还有彩蛋哦
	};

	June.prototype = {
		// 因为我们这里对June对象的原型链直接赋值
		// 那么改变了原始的constructor指针的指向
		// 所以这里需要重新设定原型指针指向
		constructor: June,
		// 模块通配字符串设置
		module_name: ['june-'],
		// 接下来需要实现第一步查找需要绑定指定事件的元素
		// ele: DOM节点
		bind_nodes_by_arr: function (ele) {
			// 初始变量
			var nodes_arr = [], _this = this;
			// 获取ele元素中属于node节点（排除文件等其他节点）的个数
			try {
				var len = ele.childElementCount;
			} catch (error) {
				console.info('please update your browser');
			}
			// 获取模块通配符
			var _m_name = _this.module_name[0];
			// 检测是否有子元素存在
			if (len) {
				var child = ele.firstElementChild;
				while (child != null) {
					// 遍历当前子元素中的属性节点（这里引用数组forEach方法来遍历）
					Array.prototype.forEach.call(child.attributes, function (node_attr) {
						if (node_attr.nodeName.indexOf(_m_name) >= 0) {
							nodes_arr.push(child);
							switch (node_attr.nodeName.slice(_m_name.length)) {
								case 'model':
									child.addEventListener('keyup', function () {
										_this.push_data();
									}, false);
									break;
								default:
									break;	
							}
						}
					});
					child = child.nextElementSibling;
				}
			}
			return nodes_arr;
		},

		// 实现数据实时注入
		push_data: function(_bool) {
			// 设置参数默认值
			var bool = (_bool ? true : false);
			var nodes = this.nodes;
			var data = this.data;
			var _m_name = this.module_name[0];
			// 这里的nodes都是具有指定module_name属性的元素
			nodes.forEach(function (node) {
				Array.prototype.forEach.call(node.attributes, function (node_attr) {
					if (node_attr.nodeName.indexOf(_m_name) >= 0) {
						switch (node_attr.nodeName.slice(_m_name.length)) {
							case 'model':
								if (bool) {
									// 当bool为true时，将当前元素也就是node的value
									// 设置为数据data对象中相应属性名的值
									// 什么意思呢？
									// 举例说明 node: <input class="test" june-model="test">
									// data {test: 'hello'}, 这里的操作就是将hello赋值给input.value
									node.value = data[node_attr.nodeValue] || '';
								} else if (node.value !== data[node_attr.nodeValue]) {
									data[node_attr.nodeValue] = node.value || '';
								}
								break;
							case 'text':
								if (node.innerText !== data[node_attr.nodeValue]) {
									node.innerText = data[node_attr.nodeValue];
								}
								break;
							default:
								console.info('please check the node contain june-model or june-text attribute');
								break;	
						}
					}
				});
			});
		},

		// 注意这里将June的原型链上init属性定义为一个原型函数
		init: function (ele, data) {
			this.ele = ele;
			this.data = data;
			// 将带有指定属性的元素,也就是属性符合module_name的元素返回给this.nodes属性
			this.nodes = this.bind_nodes_by_arr(ele);
			var _this = this;
			// 初始数据绑定
			this.push_data(true);
		}

	}

	// 彩蛋来啦
	// 其实init是我们给June做的一个替身
	// 我们希望通过init来完成本应该作为原型的June的
	// 既然要作为June的替身，有一个非常重要的地方就是继承June的原型链
	// 所以还需要这样做（当前这个小列子里其实不做这一步也没有关系，但是一个完整的模型体系必须这样）
	// 保证原型链的清晰和功能完备
	June.prototype.init.prototype = June.prototype;
    
    // 这里将June作为一个封装函数挂到window上
    // 这样做的目的是显示将June注册为全局变量
    // 同事防止内部变量对全局变量的污染
    window.June = June;
})();


