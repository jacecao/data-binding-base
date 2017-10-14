## JavaScript实现数据双向绑定

* #### 文档结构   

1. test.html  基础功能测试文件
2. doc.txt   涉及的基础知识说明
3. module    实现数据绑定的模块
4. index.html 数据绑定模块测试文件

##

主要通过两种常用的模式来实现数据双向绑定。

1. 主要由事件驱动绑定   
  这个主要是每次触发输入事件时，便做数据检查来完成数据更新和注入
2. 对象赋值驱动模式   
  主要通过定义Object的取值方法来触发数据的注入
  输入事件触发数据的更新
  与上面不同的是,数据的注入和更新是剥离开来
