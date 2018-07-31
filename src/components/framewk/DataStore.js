import Observer from "./Observer";

class DataStore extends Observer {
  constructor(config) {
    super();
    const me = this;
    // 定义监听
    me.observe = function(data, prop, router) {
      // 确保监听对象是Object
      if (Object.prototype.toString.call(data) === "[object Object]") {

        // 生成路由，即从data属性根节点定位到当前属性的路径
        if (!router) {
          router = "/";
        } else {
          if (router === "/") {
            router += prop;
          } else {
            router = router + "/" + prop;
          }
        }
        // 将路由添加到订阅主题
        me.topic.add(router);

        // 重写setter，启用监听
        let val = data[prop];
        Object.defineProperty(data, prop, {
          enumerable: true,
          configurable: true,
          get() {
            return val;
          },
          set(newVal) {
            if (newVal === val) return;
            val = newVal;
            // 此处保存当前路由地址，防止从内存中释放或者因为循环、递归被修改
            const $router = router;
            me.topic.forEach(function(element, sameElement, set) {
              if (element != $router && element.startsWith($router)) {
                set.delete(element);
              }
            });

            // 遍历属性，增加监听
            for (let key in val) {
              me.observe(val, key, $router);
            }
            me.notify($router, me.getData($router));
          }
        });
        for (let key in val) {
          // 递归监听
          me.observe(val, key, router);
        }
      }
    };
    // 初始化data存储
    me.data = (config && config.data) || {};
    // 启用监听
    me.observe(me, "data");
  }

  /**
   * 根据存储路径获取数据
   * @param path
   * @returns {*|{}}
   */
  getData(path) {
    let arr = path.split("/");
    let data = this.data;
    // 数组第一个元素为空，i 从 1 开始
    for (let i = 1; i < arr.length; i++) {
      if (!data) {
        throw new Error("DataStore: 路径 " + path + " 错误，数据不存在");
      }
      data = data[arr[i]];
    }
    return data;
  }

  /**
   * 增加数据集
   * @param name
   * @param data
   */
  addDataSet(name, data) {
    if (this.data[name]) {
      throw new Error("DataStore: 数据集【" + name + "】已存在，不可重复创建");
    }
    let path = name;
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    this.data[name] = data || {}
    this.observe(this.data, name, path);
  }

  /**
   * 增加数据集
   * @param name
   * @param data
   */
  removeDataSet(name) {
    if (!this.data[name]) {
      throw new Error("DataStore: 数据集【" + name + "】不存在，无法删除");
    }
    // 遍历topic，删除以path开头的topic，删除全部相关topic的订阅
    let path = name;
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    this.topic.forEach(function(element, sameElement, set) {
      if (element.startsWith(path)) {
        set.delete(element);
        delete this.onceSubscribers[element]
        delete this.subscribers[element]
      }
    });
    delete this.data[name]
  }
}

export default DataStore;


// // 声明一个订阅者类，继承Observer
// class Subscriber extends Observer {
//   constructor(config) {
//     super(config);
//   }
//
//   methodC() {
//     console.log("execute methodC");
//   }
//
//   methodD() {
//     console.log("execute methodD");
//   }
// }
//
// // 实例化一个发布者
// var publisher = new DataStore({
//   data: { x: 1, y: { z: 2 } }
// });
// // 实例化一个订阅者
// var subscriber = new Subscriber({
//   handlers: {
//     "/x/a": function(path, event) {
//       console.log(path);
//       console.log(event);
//     }
//   }
// });
// // 长期订阅一个主题
// // 修改变量，触发监听
// publisher.data.x = {
//   a: 1,
//   b: 2
// };
// publisher.subscribe("/x/a", subscriber);
// debugger
// publisher.addDataSet("z", {x: 1})
// publisher.addDataSet("x", {x: 1})