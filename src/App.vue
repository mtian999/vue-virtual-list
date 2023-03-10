<template>
  <div id="app">
    <input type="text" style="position: absolute; z-index: 1" @input="changeHandle" />
    <BaseVirtualList ref="refBaseVirtualList" :realData="listData" :isUnfreeze="true" v-bind="$attrs" v-on="$listeners">
      <template v-slot="{ item: listDataItem }">
        <div class="list-item" :style="{ backgroundColor: listDataItem.color }" @click="clickHandle(listDataItem)">
          {{ listDataItem.content }}
        </div>
      </template>
    </BaseVirtualList>
  </div>
</template>

<script>
import BaseVirtualList from './components/BaseVirtualList'

/**
 *
 * @param {Number} leng 指定字符串的长度
 * @returns{String} 返回生成的字符串
 */
// 按照题意生成一个函数接收方法
function sjs(leng) {
  // 大写字母、小写字母、数字能出现的情况
  var char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  // 定义一个字符串接收随机生成的字符串
  var chars = ''
  // 遍历
  for (var i = 0; i < leng; i++) {
    //    chars 的值为char中下标为随机数的值
    // 这个随机数取值是Math.random()  0-1不到1
    // Math.random()*char.length 0-1之间的数*char的长度，生成一个0-char.length之间的数,取整不包含最后一个，但是length长度为最大下标+1，所以不用加一
    //最后用+来拼接
    chars += char.charAt(parseInt(Math.random() * char.length))
  }
  //返回得到的字符串
  return chars
}
function randomNum(max, min) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return num
}
function rColor() {
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)
  return 'rgba(' + r + ',' + g + ',' + b + ',0.8)'
}
function getListData() {
  const listData = []
  for (let i = 0; i < 10000; i++) {
    const content = sjs(randomNum(500, 50))
    listData.push({
      key: i,
      content,
      color: rColor(),
      type: 'div',
    })
  }
  return Object.freeze(listData)
}
export default {
  name: 'App',
  components: {
    BaseVirtualList,
  },
  data() {
    return {
      listData: [],
    }
  },
  mounted() {
    setTimeout(() => {
      this.listData = getListData()
    }, 500)
  },
  methods: {
    clickHandle(listDataItem) {
      listDataItem.content = sjs(randomNum(500, 50))
      listDataItem.color = rColor()
    },
    changeHandle(e) {
      const idx = parseInt(e.target.value)

      if (!isNaN(idx)) {
        console.log(idx)
        this.$refs.refBaseVirtualList.scrollToTargetHandle(idx)
      }
    },
  },
}
</script>

<style>
#app {
  height: 100%;
}
.list-item {
  overflow: hidden;
}
</style>
