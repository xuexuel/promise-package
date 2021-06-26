class KPromise {
  constructor(handle) {
    this.status = "pending";
    this.value = undefined;
    this.resolveQueue = [];
    this.rejectQueue = [];
    handle(this._resolve.bind(this), this._reject.bind(this))
  }
  _mutation(val, queue) {
    const run = () => {
      let cb;
      while (cb = queue.shift()) {
        cb && cb(val);
      }
    };
    // 定义宏任务
    // setTimeout(run);
    // *定义微任务
    let ob = new MutationObserver(run);
    ob.observe(document.body, {
      attributes: true
    })
    document.body.setAttribute("kkb", Math.random);
  }
  _resolve(val) {
    this.status = "fulfilled";
    this.value = val;
    this._mutation(val, this.resolveQueue);
  }
  _reject(val) {
    this.status = "rejected";
    this.value = val;
    this._mutation(val, this.rejectQueue);
  }
  then(onResolved, onRejected) {
    // this.resolveQueue.push(onResolved);
    // this.rejectQueue.push(onRejected);
    return new KPromise((resolve, reject) => {
      this.resolveQueue.push(val => {
        let res = onResolved && onResolved(val);
        if (res instanceof KPromise) {
          return res.then(resolve);
        }
        resolve(res);
      })
      this.rejectQueue.push(val => {
        onRejected && onRejected(val);
        reject(val);
      })
    })
  }
  catch(onRejected) {
    this.then(undefined, onRejected);
  }
  static resolve(val) {
    return new KPromise(resolve => {
      resolve(val);
    })
  }
  static reject(val) {
    return new KPromise((resolve, reject) => {
      reject(val);
    })
  }
  static all(lists) {
    let arr = [];
    return new KPromise((resolve) => {
      lists.forEach(item => {
        item.then(res => {
          arr.push(res);
          if (arr.length === lists.length) resolve(arr);
        })
      });
    })
  }
  static race(lists) {
    return new KPromise((resolve, reject) => {
      lists.forEach(item => {
        item.then(res => {
          resolve(res);
        }, err => {
          reject(err);
        })
      });
      reject(val);
    })
  }
  finally(cb) {
    return this.then(cb, cb);
  }
}