/*
	与binding_module_2不相同的时这里数据绑定不再是通过检查
	而是通过对数据对象本身的设定和获取来自动触发数据绑定
	在这页代码里我会注明与上一种方法不同之处
	注明方式：  // >>>>>  update

	运行环境依然需要IE9以上
 */

/*
	config = {
		ele: 需要执行模块操作的元素，
		data: 需要初始绑定的数据对象
	}
 */
(function(){
	var V = function (config) {
		try {
			var ele = document.querySelector(config.ele);
		} catch (error) {
			console.info('please update your browser');
		}
		var data = config.data || {};

		return new V.prototype.init(ele, data);
	}

	V.prototype = {
		constructor: V,
		module_name: ['v-'], // 这里这样做主要是考虑到后期扩展方便
		// 筛选元素
		get_nodes_by_arr: function (ele) {
			var nodes_arr = [], _this = this;
			// 注意childElementCount和
			try {
				var len = ele.childElementCount;
			} catch (error) {
				console.info('please update your browser');
			}
			var _m_name = _this.module_name[0];
			if (len) {
				// 开始变了ele子节点
				var child = ele.firstElementChild;
				while (child != null) {
					Array.prototype.forEach.call(child.attributes, function (child_attr) {
						if (child_attr.nodeName.indexOf(_m_name) >= 0) {
							// >>> update  这里这个方法就是非常简单的完成节点筛选
							nodes_arr.push(child);
						}
					});
					// 注意这里一定需要更新child的值
					// 如果不处理好child,那么这里将陷入死循环
					child = child.nextElementSibling;
				} 
			}
			return nodes_arr;
		},

		// >>> update 自定义对象设值和取值模型
		define_module: function (obj, key) {
			var _this = this, _value = '';
			try {
				Object.defineProperty(obj, key, {
					configurable: true,
					writeable: true,
					get: function () {
						return _value;
					},
					set: function (new_value) {
						_value = new_value;
						// >>> update
						// 在这里执行文本注入
						_this.push_data();
					}
				});
			} catch (error) {
				console.info('update your browser to new version');
			}
		},
		// 注入数据
		push_data: function () {
			// >>> 这里只管将数据输入到指定元素中
			var _this = this;
			try {
				var _m_name = this.module_name[0];
				var nodes_text = this.ele.querySelectorAll('[' + _m_name + 'text]');
				// 遍历 包含属性为v-text的元素
				Array.prototype.forEach.call(nodes_text, function (node) {
					// 获取元素v-text属性的值
					var node_attr_value = node.getAttribute(_m_name + 'text');
					// 将数据中属性为 （v-text属性的值）的值注入
					node.innerHTML = _this.data[node_attr_value] || '';
				});
			} catch (error) {
				console.info('update your browser to new version');
			}
		},
		// >>> update 绑定模型元素
		bind_model: function () {
			var _this = this;
			var _m_name = this.module_name[0];
			var nodes_model = this.ele.querySelectorAll('[' + _m_name + 'model]');
			Array.prototype.forEach.call(nodes_model, function (node) {
				var node_attr_value = node.getAttribute(_m_name + 'model');
				node.value = _this.data[node_attr_value];
				// _this.dara设定为自定义对象设值/取值模型
				_this.define_module(_this.data, node_attr_value);
				node.addEventListener('keyup', function () {
					// 注意因为我们对_this.data设定了自定义的设值/取值模型
					// 所以这里一旦赋值就会触发数据的注入
					_this.data[node_attr_value] = node.value;
				}, false);
			});
		},
		// 初始化’绑定模型‘
		init: function (ele, data) {
			this.ele = ele;
			this.data = data;
			this.nodes = this.get_nodes_by_arr(ele);
			this.push_data();
			this.bind_model();
			return this;
		}
	}
	V.prototype.init.prototype = V.prototype;
	window.V = V;
})();
