/**
 Observer既可以是发布者，又可以是订阅者
 构造函数的参数说明如下：
 {
    // Array, 作为发布者，允许订阅的主题名称集
    topic: ["ObserverA/topicA", "ObserverA/topicB"],

    // Object, 作为订阅者，接收到通知后的处理过程
    handlers: {
        "ObserverA/topicA": function(topic, event) {
                console.log(topic)    // "ObserverA/topicA"
                console.log(event)    // 发布者传出的参数
            }
        }
    }

 方法：
 // 将订阅者subscriber注册进来，订阅topic主题，isOnce=true表示只订阅一次
 subscribe(topic,subscriber, isOnce)

 // 使subscriber取消订阅topic主题，isOnce=true表示只取消单次订阅的对象
 unsubscribe(topic,subscriber, isOnce)

 // 发布者触发通知，告知所有订阅者
 notify(topic,event)

 // receive为保留方法名，不可以重复声明
 receive(topic, event)

 示例：
 // 声明一个发布者类，继承Observer
 class Publisher extends Observer {
        constructor(config){
        super(config);
            // 声明主题集
            ["Subpub/topicA", "Subpub/topicB"].map(x => this.topic.add(x))
        }
        methodA() {
            console.log("execute methodA")
            this.notify("Subpub/topicA")
        }

        methodB() {
            console.log("execute methodB")
            this.notify("Subpub/topicB")
        }
    }

 // 声明一个订阅者类，继承Observer
 class Subscriber extends Observer {
        constructor(config) {
            super(config);
        }

        methodC() {
            console.log("execute methodC")
        }

        methodD() {
            console.log("execute methodD")
        }
    }

 // 实例化一个发布者
 var publisher = new Publisher()
 // 实例化一个订阅者
 var subscriber = new Subscriber({
        handlers: {
            "Subpub/topicA": function (self, event) {
                this.methodC()
            },
            "Subpub/topicB": function (self, event) {
                this.methodD()
            }
        }
    })
 // 长期订阅一个主题
 publisher.subscribe("Subpub/topicA", subscriber)
 // 单次订阅一个主题
 publisher.subscribe("Subpub/topicB", subscriber, true);
 // 发送通知
 publisher.notify("Subpub/topicA")
 // 发送通知
 publisher.notify("Subpub/topicB")
 */
class Observer {
  constructor(config) {

    /**
     * 可订阅主题集，不在集合中的主题无法订阅
     */
    this.topic = new Set();

    /**
     * 长期订阅者
     */
    this.subscribers = {};

    /**
     * 单次订阅者
     */
    this.onceSubscribers = {};

    /**
     * 通知处理器
     */
    this.handlers = {};

    if (config) {
      if (config.topic) {
        config.topic.map(x => this.topic.add(x));
      }
      if (config.handlers) {
        this.handlers = config.handlers;
      }
    }
  }

  /**
   * 订阅主题
   */
  subscribe(topic, subscriber, isOnce) {
    // 不存在可订阅的主题时，终止
    if (!this.topic.has(topic)) {
      return;
    }
    if (isOnce) {
      if (!this.onceSubscribers[topic]) {
        this.onceSubscribers[topic] = [];
      }
      if (this.onceSubscribers[topic].indexOf(subscriber) === -1) {
        this.onceSubscribers[topic].push(subscriber);
      }
    } else {
      if (!this.subscribers[topic]) {
        this.subscribers[topic] = [];
      }
      if (this.subscribers[topic].indexOf(subscriber) === -1) {
        this.subscribers[topic].push(subscriber);
      }
    }
  };

  /**
   * 取消订阅主题
   */
  unsubscribe(topic, subscriber, isOnce) {
    let index;
    // 不存在可订阅的主题时，终止
    if (!this.topic.has(topic)) {
      console.error("不存在【" + topic + "】主题");
      return;
    }
    // 不是只取消单次订阅时，取消全部订阅
    if (!isOnce) {
      index = this.subscribers[topic].indexOf(subscriber);
      if (index !== -1) {
        this.subscribers[topic].splice(index, 1);
      }
    }
    // 取消单次订阅
    index = this.onceSubscribers[topic].indexOf(subscriber);
    if (index !== -1) {
      this.onceSubscribers[topic].splice(index, 1);
    }
  };

  /**
   * 通知
   */
  notify(topic, event) {
    // 未指定主题
    if (!arguments || !arguments.length) {
      console.error("未指定主题，无法通知");
      return;
    }
    // 不存在指定的主题
    if (!this.topic.has(topic)) {
      console.error("不存在【" + topic + "】主题");
      return;
    }
    // 通知长期订阅者
    let subscribers = this.subscribers[topic];
    if (subscribers && subscribers.length) {
      for (let i = 0; i < subscribers.length; i++) {
        let sub = subscribers[i];
        sub.receive(topic, event);
      }

    }
    // 通知单次订阅者
    let onceSubs = this.onceSubscribers[topic];
    if (onceSubs && onceSubs.length) {
      for (let i = 0; i < onceSubs.length; i++) {
        let sub = onceSubs[i];
        sub.receive(topic, event);
        this.unsubscribe(topic, sub, true);
      }
    }
  };


  /**
   * 接收通知
   */
  receive(topic, event) {
    // 调用通知代理，处理通知
    let func = this.handlers[topic];
    if (func && typeof func == "function") {
      return func.apply(this, [topic, event]);
    }
  }
}

export default Observer;