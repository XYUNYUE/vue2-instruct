
# install
```
npm install vue2-instruct

```


# Usage

### 1. VDrag 拖拽指令
```
  import { VDrag } from "vue2-instruct";

  Vue.directive('VDrag', VDrag);

  <!-- 元素身上前提条件是，元素本事需要用 position 脱离文档流 -->
  <div v-VDrag  style="position: absolute">拖拽指令</div>
```


### 2. VCopy 双击复制指令
```
  <!-- 注意：复制指令目前仅支持复制本身，没办法复制第三个元素内容 -->

  import { VCopy } from "vue2-instruct";

  Vue.directive('VCopy', VCopy);

  <div v-VCopy >复制指令</div>
  <input v-VCopy  type="text"  />
```

### 3. 防抖/节流 指令
  - 防抖指令
    - 在连续点击的最后一次生效

  - 节流指令
    - 在点击多久后触发一次，中间点击触发则忽略
```
  import { VJitter,VThrottle } from "vue2-instruct";

  <!-- 防抖 -->
  Vue.directive('VJitter', VJitter);
  <input v-VJitter:input="{
    function:function(e,value,obj){console.log(e,value,obj)},
    time:1000,
    params:{
      value:123
    }
  }"  type="text"/>

  <!-- 节流 -->
  Vue.directive('VThrottle', VThrottle);
  <div v-VThrottle:click="{
      function:function(e,value,obj){console.log(e,value,obj)},
      time:1000,
      params:{
        value:123
      }
    }" >节流指令</div>

```

属性 | 说明 | 类型 | 默认值
---|---|---|---
time | 防抖/节流的操作时间 | Number | 500/ms
function | 回调函数(callback) | Function | function(e,value,obj){},e : 默认的事件对象，value : 当前元素的值(实验)，obj : 自定义传入的参数
params | 回调函数的参数 | Object | null
click | 事件类型 | String | click


---


# contact
```
  发现 BUG ，或者有什么想法。麻烦联系 3113400031@qq.com
```