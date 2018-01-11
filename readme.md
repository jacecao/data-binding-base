## 原生JavaScript实现数据双向绑定

[1.文档结构](#_1)

[2.项目简介](#_2)

[2.涉及要点](#_3)
  &nbsp; [2.1 DOM操作](#_21)    
    &nbsp; &nbsp; [2.1-1 NodeList](#_211)    
    &nbsp; &nbsp; [2.1-2 HTMLCollection](#_212)    
    &nbsp; &nbsp; [2.1-3 NodeName-NodeValue](#_213)      
    &nbsp; &nbsp; [2.1-4 attributes-NameNodeMap](#_214)     
    &nbsp; &nbsp; [2.1-5 元素遍历](#_215)     
  &nbsp; [2.2 数据绑定](#_22)   

[演示地址](https://jacecao.github.io/data-binding-base/)


<h4 id="_1">文档结构</h4>   

1. test.html  基础功能测试文件
2. docs   在线演示文件夹
3. module    实现数据绑定的模块
4. index.html 数据绑定模块测试文件


<h4 id="_2">项目简介</h4> 

主要通过两种常用的模式来实现数据双向绑定。

1. 主要由事件驱动绑定   
  这个主要是每次触发输入事件时，便做数据检查来完成数据更新和注入
2. 对象赋值驱动模式   
  主要通过定义Object的取值方法来触发数据的注入
  输入事件触发数据的更新
  与上面不同的是,数据的注入和更新是剥离开来

##

<h4 id="_3">涉及要点</h4> 

1. <h4 id="_21">DOM操作-[演示](https://jacecao.github.io/data-binding-base/dom/)</h4>

要实现数据绑定，面临的第一个问题就是对DOM操作，需要识别页面那些元素需要绑定数据，例如`<p v-text="test"></p>`这样的页面结构,我们需要识别带有特定属性（‘v-text’）的HTML元素.

要控制好DOM，我们就必须理解`NodeList` 及其近亲`NamedNodeMap`和`HTMLCollection`，这是本模块的关键所在。

上面都是HTML节点的对象，这些对象都是实时动态的，也就是说每当文档结构发生变化时，它们都会得到更新。因此它们始终都会保存着最新最准确的信息。

<h5 id="_211">1.1 NodeList</h5>

每个节点都有一个childNodes属性，那这个属性的值究竟是什么呢？其实这个属性是一个非常非常重要的属性，包含了当前节点下所有子节点的信息(注意只是子节点，不包含孙节点)的一个对象。这个对象就是NodeList，它是一种类数组对象，用于保存一组有序的节点，可以通过位置来访问这些节点的信息。

NodeList对象的独特之处在于，它实际上是基于DOM结构动态执行查询的结果，因此DOM结构的变化能够自动反映在NodeList对象中. **这里有一个非常有意思的地方**, 如果在代码一开始我们先获取body中的NodeList和后面通过点击事件来获取，结果是不一样的，这是为什么呢？其实这里就体现了NodeList的动态性，这个关系到JS执行代码的顺序（这里当然不是说从上到下的顺序，而是内部代码执行顺序，此处就不加深说明了，想[深入了解](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)）, 简单点说造成不一样的原因是当通过事件执行时，页面渲染完毕，而一开始就获取bodyNodeList对象，`<script>`标签前的元素已经渲染完毕，但`<script>`标签后面的元素却没有，需要等待script里的函数全部写入栈以后才能渲染，如果要解决这个问题，我们可以这样作：
  ```javascript
    setTimeout(function () {
      /* 执行获取代码 */
    },0);
  ```
  为什么这样就可以了呢（而且还是0毫秒就执行），这个就是我们上面提到的执行顺序问题。


<h5 id="_212">1.2 HTMLCollection</h5>

HTMLCollection又是啥呢？这两个对象却非常容易搞混为什么这样说呢？
我们看一个例子： 

``` javascript
    const p = document.querySelectorAll('p');
    const _p = document.getElementByTagName('p');
    // 你会发现 p和_p 返回的内容基本一样，处理p显示的是NodeList, _p显示的是HTMLCollection
```

这里我们就会认为这个NodeList和HTMLCollection没啥区别啊，其实可以将Nodelist理解为HTMLCollection的阉割对象，即NodeList能做的HTMLCollection也能做，HTMLCollection能做的NodeList就不一定能做了，比如HTMLCollection对象有‘name’属性，而NodeList对象却没有，HTMLCollection这个'name'属性有什么用呢？其实针对这个属性该对象还有一个方namedItem(),这个两个方法的作用都是返回属性name为指定值的HTML元素.


``` javascript
    /*
      <p name="test"></p>
      <p name="test2"></p>
     */
    const _p = document.getElementByTagName('p').test2
          _p = document.getElementByTagName('p').namedItem('test2')
    // _p就是<p name="test2"></p>
```

document.getxxxxxxx,这类方法返回的都是HTMLCollection对象

document.queryXXXXX,这类方法返回的都是NodeList

而所有元素的ChildNodes返回的都是NodeList。

<h5 id="_213">1.3 NodeName和NodeValue</h5>

我相信大家都知道nodeName这个属性可以获取当前节点的名称，但大家肯定对NodeValue就比较陌生了，因为正常的节点nodeValue值为null，根本没啥用，但既然没用为什么要设置这个属性呢？

其实所有的节点都有NOdeName与NodeValue这两个属性，且nodeValue为null。而为什么需要nodeValue这个属性呢？这就需要了解DOM中另外一个不常提及的属性节点。没错DOM中还有属性节点。

```javascript
    var align = document.createAttribute("align");
    align.value = "left";
    _p.setAttributeNode(align);
    alert(_p.attributes["align"].value); // 'left'
    alert(_p.getAttributeNode("align").value); //"left"
    alert(_p.getAttribute("align")); //'left'
```

上面就是创建属性节点，并获取节点属性/属性值，既然属性也被称为节点，那么有没有类似NodeList的对象呢，可以获取节点元素的所有属性呢？当然有啦，不过这个对象不叫NodeList而是NameNodeMap。

那这和nodeList/nodeValue有什么关系呢？别急让我们娓娓道来。

<h5 id="_214">1.4 attributes 和 NameNodeMap</h5>

前面我们知道通过节点的childNodes属性获取NodeList，那我们如何获取属性节点的NameNodeMap呢？那就得使用`attributes`。文档元素中的attributes属性中包含一个NameNodeMap对象,与NodeList一样也是一个动态的集合，每个节点的属性都保存在NameNodeMap对象中，该对象拥有以下方法：

```javascript  
  NameNodeMap.getNamedItem(name); //返回nodename属性等于name的节点
  NameNodeMap.removeNamedItem(name); // 移除指定属性节点
  sNameNodeMap.setNamedItem(node); //添加属性节点
  NameNodeMap.item(index); //返回位于数字pos位置处的节点

  document.querySelector('button').attributes[0].nodeName; 
  // 获取第一个属性节点的名称
  document.querySelector('button').attributes[0].nodeValue; 
  // 获取第一个属性节点的值
```


**目前更加常用的是：getAttribute(name)、removeAttribute(name)和 setAttribute(‘name’, 'value')方法，通过这些方法我们可以通过文档元素直接操作其属性节点**

本模块中对属性的遍历是这样操作的：

```javascript
  Array.prototype.forEach.call(child.attributes, function (node_attr) {
    if (node_attr.nodeName.indexOf('特点属性') >= 0) {  // v-bind 这样的属性
      ......  
      }
    }
  });
```

通过上面的代码是不是发现NodeName和NodeValue将在实现数据绑定中发挥很大的作用呢？

<h5 id="_215">1.5 元素遍历</h5>

如DOM演示里显示的那样，我们获取到的元素包括了文本节点（甚至有注释节点），那么这些对我们遍历很不友好，有没有可以跳过这些节点遍历的方法呢？ 当然有啦。

childElementCount: 返回子元素(不包括文本节点和注释)的个数   
firstElementChild: 指向第一个子元素   
lastElementChild: 指向最后一个子元素   
previousElementSibling: 指向前一个同辈元素   
nextElementSibling: 指向后一个同辈元素  

这些方法都直接遍历元素节点（排除文本和注释）。这下对文本操作是不是很方便啦。

在本模块遍历元素的思路是这样的：

```javascript
  var child = ele.firstElementChild;
  while (child != null) {
    // 遍历当前子元素中的属性节点
    Array.prototype.forEach.call(child.attributes, function (node_attr) {
      ......
    });
    child = child.nextElementSibling;
  }
```    

<h4 id="_22">2. 数据绑定</h4>

目前有2种方法实现数据绑定：    
  一种是通过事件绑定来实时绑定数据，即以事件驱动数据更新。    
  一种是通过自定义对象取值和设值的方法来驱动数据更新。   
目前大家都广泛使用第二种。

但是这个两种法法都需要一个初始事件的驱动才行，仅仅对数据更新的触发机制不同而已。

> binding_module_2.js  由自定义对象取值、设值来驱动数据更新。    

```javascript
  Object.defineProperty(obj, key, {
    configurable: true,
    writeable: true,
    get: function () {
      return _value;
    },
    set: function (new_value) {
      _value = new_value;
      /* 执行数据更新代码 */
    }
  });
```

> binding_module_1.js  由事件绑定来驱动数据更新。
   
 ```javascript
   // 以事件驱动来触发数据更新
   Array.prototype.forEach.call(child.attributes, function (node_attr) {
     if (node_attr.nodeName.indexOf(_m_name) >= 0) {
       nodes_arr.push(child);
       switch (node_attr.nodeName.slice(_m_name.length)) {
         case 'model':
           // 绑定事件
           child.addEventListener('keyup', function () {
             /*执行数据更新*/
           }, false);
           break;
         default:
           break;  
       }
     }
   });
 ```
  
当然这两个模块仅仅是一个最基本的模块绑定单位，并不代表一些视图框架底层数据绑定的运作原理。
