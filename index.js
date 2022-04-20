/**
 * 移动端拖拽指令
 *  - 使用 指令 时需要元素 先 脱离文档流 定位里面：position
 */
export const VDrag = {
  inserted(el) {
    let content = {
      startX: 0, //元素 X轴 位置
      startY: 0, //元素 Y轴 位置
      viewX: document.documentElement.clientWidth, //视图的 X轴
      viewY: document.documentElement.clientHeight, //视图的 Y轴
      contentW: el.offsetWidth, //元素本身宽度
      contentH: el.offsetHeight, //元素本身高度
    }

    function _DragTouchStart_(e) {
      content.startX = e.targetTouches[0].pageX - this.offsetLeft;
      content.startY = e.targetTouches[0].pageY - this.offsetTop;
    }
    el.addEventListener('touchstart', _DragTouchStart_);

    function _DragTouchMove_(e) {
      e.stopPropagation()
      var leftX = e.targetTouches[0].pageX - content.startX;
      var topY = e.targetTouches[0].pageY - content.startY;
      if (leftX >= content.viewX - content.contentW) {
        leftX = content.viewX - content.contentW;
      } else if (leftX <= 0) {
        leftX = 0
      }
      if (topY >= content.viewY - content.contentH) {
        topY = content.viewY - content.contentH;
      } else if (topY <= 0) {
        topY = 0
      }
      // 设置当前的位置
      this.style.left = leftX + "px";
      this.style.top = topY + "px";
    }
    el.addEventListener('touchmove', _DragTouchMove_);
    el._DragTouchStart_ = _DragTouchStart_;
    el._DragTouchMove_ = _DragTouchMove_;
  },
  unbind(el) {
    document.removeEventListener('touchstart', el._DragTouchStart_);
    document.removeEventListener('touchmove', el._DragTouchMove_);
    delete el._DragTouchStart_;
    delete el._DragTouchMove_;
  }
}


/**
 * 复制 指令
 *  - 目前只能复制自身，不支持复制其它元素
 *  - 双击复制
 */
export const VCopy = {
  bind(el) {

    var _dbClick_ = doubleClick(dbclick, 600, 2);

    function dbclick(el) {
      el = el[0];
      var $value = "";
      if (el.target.nodeName == 'INPUT') {
        // 如果点击的是input 则获取input 的文本
        $value = el.target.value;
      } else {
        $value = el.path[0].innerText;
      }
      // debugger
      // console.log(el);
      el = el.path[0];
      el.$value = $value;
      if (!el.$value || el.$value.length <= 0) {
        // 值为空的时候，给出提示
        return
      }
      // 动态创建 textarea 标签
      const textarea = document.createElement('textarea');
      // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
      textarea.readOnly = 'readonly';
      textarea.style.position = 'absolute';
      textarea.style.top = '0px';
      textarea.style.left = '-9999px';
      textarea.style.zIndex = '-9999';
      // 将要 copy 的值赋给 textarea 标签的 value 属性
      textarea.value = el.$value;
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea)
      // 兼容IOS 没有 select() 方法
      if (textarea.createTextRange) {
        textarea.select(); // 选中值并复制
      } else {
        textarea.setSelectionRange(0, el.$value.length);
        textarea.focus();
      }
      const result = document.execCommand('Copy');
      if (result) alert('复制成功');
      document.body.removeChild(textarea);

    }
    el._dbClick_ = _dbClick_;
    el.addEventListener('click', _dbClick_);
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el._dbClick_);
  },
}


/**
 * 生成-双击函数
 * @param {*} callBack 回调函数
 * @param {*} t 时间
 * @param {*} n 点击几次触发
 */
function doubleClick(callBack, t = 1000, n = 2) {
  let count = 0;
  let timing = null;
  return function (...arg) {
    if (!timing) {
      timing = setTimeout(() => {
        count = 0;
        timing = null;
      }, t);
    }
    count++;
    if (count === n) {
      callBack(arg);
      count = 0;
      clearTimeout(timing);
      timing = null;
    }
  };
}


/**
 * 防抖函数 - 最后一次生效
 *  - 使用方法：注册后 v-jitter:event="options"
 *    - event 事件名称。例如：click,input
 *    - options type Object
 *      - time : 回调时间( number / ms )，多久之后触发中间触发则会重新计算时间
 *      - function : 回调函数( function(e,params) )，等到时间到的时候则执行这个函数
 *      - params : 参数列表( Object ),等到回调函数执行的时候，会把这个参会传进去
 */
export const VJitter = {
  bind: function (el, binding) {
    let t = binding.value.time ? binding.value.time : 500; // 延迟时间
    let fn = binding.value.function?binding.value.function:function(){}; // 回调函数
    let par = binding.value.params?binding.value.params:null; // 自定义参数
    let timing = null;
    function _jitter_(e) {
      timing && clearTimeout(timing);
      timing = setTimeout(()=>{
        let $value = e.path[0].innerText ? e.path[0].innerText : e.target.value ? e.target.value : null; 
        fn(e,$value,e.target.$params);
        clearTimeout(timing);
        timing = null;
      }, t);
    }
    el.addEventListener(binding.arg, _jitter_);
    el.$params = par;
    el._jitter_ = _jitter_;
    el._event_ = binding.arg;
  },
  unbind(el) {
    el.removeEventListener(el._event_, el._jitter_);
  },
}


/**
 * 节流函数 - 多久触发一次，中间触发则忽略
 *  - 使用方法：注册后 v-VThrottle:event="options"
 *    - event 事件名称。例如：click,input
 *    - options type Object
 *      - time : 回调时间( number / ms )，多久之后触发中间触发则 忽略
 *      - function : 回调函数( function(e,params) )，等到时间到的时候则执行这个函数
 *      - params : 参数列表( Object ),等到回调函数执行的时候，会把这个参会传进去
 */
 export const VThrottle = {
  bind: function (el, binding) {
    let t = binding.value.time ? binding.value.time : 500; // 延迟时间
    let fn = binding.value.function ? binding.value.function : function(){}; // 回调函数
    let par = binding.value.params ? binding.value.params : null; // 自定义参数
    let _event_ = binding.arg ? binding.arg : "click";//事件类型
    let timing = null;
    function _throttle_(e) {
      if(!timing){
        timing = setTimeout(()=>{
          let $value = e.path[0].innerText ? e.path[0].innerText : e.target.value ? e.target.value : null; 
          fn(e,$value,e.target.$params);
          clearTimeout(timing);
          timing = null;
        }, t);
      }
    }
    el.addEventListener(_event_, _throttle_);
    el._throttle_ = _throttle_;
    el.$params = par;
    el._event_ = _event_;
  },
  unbind(el) {
    el.removeEventListener(el._event_, el._throttle_);
  },
}


/**
 * 移动端 - 长按指令
 *  - 使用方法：注册后 v-VLongPress="options"
 *    - options type Object
 *      - time : 回调时间( number / ms )，多久之后触发中间触发则 忽略
 *      - function : 回调函数( function(e,params) )，等到时间到的时候则执行这个函数
 *      - params : 参数列表( Object ),等到回调函数执行的时候，会把这个参会传进去
 */
export const VLongPress = {
  bind: function (el, binding) {
    let t = binding.value.time ? binding.value.time : 2000; // 长按时间
    let fn = binding.value.function?binding.value.function:function(){}; // 回调函数
    let par = binding.value.params?binding.value.params:null; // 自定义参数
    let timing = null; // 长按定时器
    function _LongPress_(e) {
      timing && clearTimeout(timing);
      timing = setTimeout(()=>{
        let $value = e.path[0].innerText ? e.path[0].innerText : e.target.value ? e.target.value : null; 
        fn(e,$value,e.target.$params);
      }, t);
    }
    function _clear_(){
      timing && clearTimeout(timing);
      timing = null;
    }
    el.addEventListener('touchstart', _LongPress_);
    el.addEventListener('touchend', _clear_);//结束活动则取消定时器
    el.addEventListener('touchmove', _clear_);//手指移动了则取消进行
    el.$params = par;
    el._LongPress_ = _LongPress_;
    el._clear_ = _clear_;
    
    // 防止出现复制
    el.style["touch-callout"] = "none";
    el.style["-webkit-touch-callout"] = "none";
    el.style["-moz-touch-callout"] = "none";
    el.style["-ms-touch-callout"] = "none";
  },
  componentUpdated(el, binding) {
    console.log(el, binding);
  },
  unbind(el) {
    el.removeEventListener("touchstart", el._LongPress_);
    el.removeEventListener("touchend", el._clear_);
    el.removeEventListener("touchmove", el._clear_);
  },
}