<template>
  <div class="container" :style="containerStyle">
    <div ref="virtualList" class="virtual-list-container" @scroll.prevent="virtualScroll">
      <div class="virtual-list-box" :style="virtualBoxStyle">
        <div class="content" :style="virtualStyle">
          <item
            v-for="item of renderList"
            class="content-item"
            :data="item"
            :fixed-height="false"
            :key="item[keyName]"
            :index="item.index"
            @itemSizeChange="itemSizeChangeHandle"
            @itemSizeChangeEnd="itemSizeChangeEndHandle"
            @itemDestroyed="itemDestroyedHandle"
            @delDestroyedList="delDestroyedListHandle"
          >
            <slot :item="item"></slot>
          </item>
        </div>
      </div>
      <slot name="virtualListExtra"></slot>
    </div>
    <div class="destroyed-but-need-show">
      <template v-if="dataRowHeader">
        <slot :item="dataRowHeader"></slot>
      </template>
    </div>
    <div class="preview-item">
      <template v-if="headPreviewItem">
        <item
          ref="refHeadPreviewItem"
          :data="headPreviewItem"
          :key="headPreviewItem.key"
          @itemSizeChange="headPreviewItemSizeChangeHandle"
          @itemMounted="headPreviewItemMountedHandle"
          @itemDestroyed="headPreviewItemDestroyedHandle"
        >
          <slot :item="headPreviewItem"></slot>
        </item>
      </template>
    </div>
  </div>
</template>

<script>
import { debounce, throttle, cloneDeep } from 'lodash'
import Item from './item'

// 最多渲染
const MAX_RENDER_NUM = 100
// 待冻结的缓存个数
const CACHE_NUM = 0
// 头部缓存个数（头部缓存个数大于0，会导致子项高度变化再还原后，渲染锚点改变）
const HEAD_PRELOAD = 2
// 尾部缓存个数
const FOOTER_PRELOAD = HEAD_PRELOAD + 1

// 组件预设高度（非必须）
let compType = {
  advanced: 66,
  dataRow: 85,
  dataRowItem: 40,
  select: 0,
  text: 66,
  group: 46,
}

function getValueByPath(obj, path) {
  const props = path.split('.')
  let value = obj
  for (let i = 0; i < props.length; i++) {
    value = value[props[i]]
    if (value === undefined) {
      break
    }
  }
  return value
}
function splitLastDot(str) {
  const lastIndex = str.lastIndexOf('.')
  return lastIndex === -1 ? [str, ''] : [str.substr(0, lastIndex), str.substr(lastIndex + 1)]
}
const binarySearch = function (list, target) {
  const len = list.length
  let left = 0
  let right = len - 1
  let bestMatchIndex = null

  while (left <= right) {
    let midIndex = (left + right) >> 1
    const targetBottom = list[midIndex]._nodeInfo._topNum + list[midIndex]._nodeInfo._height
    let midVal = targetBottom

    if (midVal === target) {
      return midIndex
    } else if (midVal < target) {
      left = midIndex + 1
    } else {
      // list不一定存在与target相等的项，不断收缩右区间，寻找最匹配的项
      if (bestMatchIndex === null || bestMatchIndex > midIndex) {
        bestMatchIndex = midIndex
      }
      right--
    }
  }
  // 如果没有搜索到完全匹配的项 就返回最匹配的项
  return bestMatchIndex
}
export default {
  name: 'BaseVirtualList',
  components: { Item },
  props: {
    // 全部数据
    realData: {
      type: Array,
      default() {
        return []
      },
    },
    // 唯一性主键的键名
    keyName: {
      type: String,
      default: 'key',
    },
    // 是否解冻
    isUnfreeze: {
      type: Boolean,
      default: true,
    },
    // 组件卸载时，想要冻结的属性（为空则默认深克隆子项重新赋值，清除子项的全部Observer）
    freezeKeyName: {
      type: [String, Array],
    },
    // 虚拟列表容器高度
    virtualListHeight: {
      type: [Number, String],
    },
  },
  data() {
    return {
      currentRealData: [],
      screenHeight: 0,
      preItemHeight: 50,
      totalHeight: 0, // 虚拟列表总高度
      virtualStyle: {},
      scrollTopVal: 0,
      renderList: [],
      renderStartNode: {
        index: 0,
        scrollOffset: 0,
      },
      headPreviewItem: null, // 头部预加载item数据
      destroyedData: {}, // 被卸载的数据行头部数据
      showKey: '', // 需要绝对定位显示，显示的key
      waitFrozenList: [], // 等待冻结的数据列表
      isHasWaitFrozenList: new WeakMap(),
      isFreezing: false, // 是否在冻结中
      // 修正滚动的数据
      waitScrollOffsetData: {
        offsetScroll: 0, // 修正距离
        isScrollToTarget: false, // 是否是方法触发滚动动作
      },
      isSizeChange: false,
      isUpdatingHeadPreviewItem: false,
      isUpdatingRealHeight: false,
      waitUpdateItemMinIdx: 0, // 等待更新的item最小index
      isAmendScrollTop: false, // 是否手动修正滚动位移，不用更新列表
    }
  },
  computed: {
    realDataLen() {
      return this.realData.length
    },
    containerStyle() {
      let virtualListHeight = this.virtualListHeight
      if (virtualListHeight) {
        if (Object.prototype.toString.call(virtualListHeight) === '[object Number]') {
          virtualListHeight = virtualListHeight + 'px'
        }
        return {
          height: virtualListHeight,
        }
      } else {
        return {
          height: '100%',
        }
      }
    },
    virtualBoxStyle() {
      return {
        minHeight: `${this.totalHeight}px`,
      }
    },
    // 数据行头部
    dataRowHeader() {
      let res
      if (this.showKey) {
        res = this.destroyedData[this.showKey]
      }
      return res
    },
  },
  watch: {
    'renderStartNode.index': {
      handler(startIdx) {
        this.headPreviewItem = null
        let res
        const start = startIdx
        const headPreviewItem = this.currentRealData[start - 1]
        if (headPreviewItem) {
          res = { ...headPreviewItem }
          res._nodeInfo = { ...headPreviewItem._nodeInfo }
        }
        this.headPreviewItem = res
      },
    },
    dataRowHeader(dataRowHeader) {
      if (dataRowHeader) {
        this.waitScrollOffsetData = Object.assign({}, this.waitScrollOffsetData, {
          offsetScroll: dataRowHeader._nodeInfo._height * -1,
        })
      }
    },
    waitScrollOffsetData(newWaitScrollOffsetData) {
      this.$nextTick(() => {
        if (newWaitScrollOffsetData.isScrollToTarget && newWaitScrollOffsetData.offsetScroll) {
          const offsetScroll = newWaitScrollOffsetData.offsetScroll
          if (offsetScroll !== undefined) {
            this.offsetScrollHandle(offsetScroll)
          }
          this.waitScrollOffsetData.isScrollToTarget = false
        }
      })
    },
    realData: {
      handler() {
        this.initRender()
      },
    },
  },
  created() {
    this.itemSizeChangeEndHandle = debounce(this.itemSizeChangeEndHandle, 50, {
      leading: false,
      trailing: true,
    })
    this.debounceFrozenDataProcessByCompatible = throttle(this.frozenDataProcessByCompatible, 5000, {
      leading: false,
    })
  },
  mounted() {
    this.initRender()
    window.bv = this
  },
  methods: {
    initRender() {
      this.renderList = []

      this.initCurrentRealDataAndRealHeight()
      this.$nextTick(() => {
        this.getRenderList()
      })
    },
    addDestroyedListHandle(visibleItem) {
      this.$set(this.destroyedData, visibleItem.key, visibleItem)
    },
    delDestroyedListHandle(visibleItem) {
      // console.log('del', visibleItem)
      this.$delete(this.destroyedData, visibleItem.key)
    },
    setDestroyedListShowOrderHandle(visibleItem) {
      if (visibleItem.type === 'dataRowItem') {
        this.showKey = visibleItem.rowDataKey
      }
    },
    headPreviewItemDestroyedHandle() {
      this.updateRealHeight()
    },
    headPreviewItemMountedHandle({ itemData: headPreviewItem, itemHeight }) {
      if (this.isUpdatingHeadPreviewItem === false) {
        this.isUpdatingHeadPreviewItem = true
        const itemData = this.currentRealData[headPreviewItem.index]
        if (itemData && (itemData._nodeInfo._height !== itemHeight || itemData._nodeInfo._isInitialHeight === true)) {
          itemData._nodeInfo._height = itemHeight
          itemData._nodeInfo._isInitialHeight = false
          if (this.waitUpdateItemMinIdx > itemData.index) {
            this.waitUpdateItemMinIdx = itemData.index
          }
        }
        // 向上滚动，如果有差异需要立即更新
        if (this.waitUpdateItemMinIdx < this.realDataLen) {
          this.updateRealHeight()
        }
        this.isUpdatingHeadPreviewItem = false
      }
    },
    headPreviewItemSizeChangeHandle({ itemData, itemHeight }) {
      const realItemData = this.currentRealData[itemData.index]
      if (realItemData._nodeInfo._height !== itemHeight || realItemData._nodeInfo._isInitialHeight === true) {
        // 如果头部预加载子项的headPreviewItem高度和realData同index的子项数据储存的不同，则更新

        realItemData._nodeInfo._height = itemHeight
        realItemData._nodeInfo._isInitialHeight = false

        if (this.waitUpdateItemMinIdx > itemData.index) {
          this.waitUpdateItemMinIdx = itemData.index
        }
      }
    },
    itemSizeChangeEndHandle() {
      compType = Object.assign({}, compType, this.getAverageCompPreHeight(this.currentRealData))
      this.updateRealHeight()
    },
    itemSizeChangeHandle({ itemData, itemHeight }) {
      if (itemData._nodeInfo._height !== itemHeight || itemData._nodeInfo._isInitialHeight === true) {
        this.isSizeChange = true
        itemData._nodeInfo._height = itemHeight
        itemData._nodeInfo._isInitialHeight = false
        if (this.waitUpdateItemMinIdx > itemData.index) {
          this.waitUpdateItemMinIdx = itemData.index
        }
      }
    },
    // 添加node到待冻结列表
    itemDestroyedHandle(node) {
      if (!this.isUnfreeze && !this.freezeKeyName) {
        // 如果不需要解冻，并且需要冻结keyName为空，则退出
        return
      }
      const currentNode = node
      const isHas = this.isHasWaitFrozenList.has(currentNode)
      if (!isHas) {
        this.waitFrozenList.push(currentNode)
        this.isHasWaitFrozenList.set(currentNode)
      }
      this.frozenDataHandle()
    },
    frozenDataHandle() {
      if (this.isFreezing) {
        return
      }
      this.isFreezing = true
      if (window.requestIdleCallback) {
        requestIdleCallback(this.frozenDataProcess)
      } else {
        this.debounceFrozenDataProcessByCompatible()
      }
    },
    frozenDataProcess(deadline) {
      this.isFreezing = false

      while (deadline.timeRemaining() > 30 && this.waitFrozenList.length > CACHE_NUM) {
        const currentNode = this.waitFrozenList.shift()
        // 冻结children
        this.isHasWaitFrozenList.delete(currentNode)
        if (this.isUnfreeze) {
          this.freezeHandle(this.currentRealData, currentNode, this.freezeKeyName)
        }
      }
      if (this.waitFrozenList.length > CACHE_NUM) {
        // 留下CACHE_NUM个缓存
        this.frozenDataHandle()
      }
    },
    frozenDataProcessByCompatible() {
      this.isFreezing = false
      while (this.waitFrozenList.length > CACHE_NUM) {
        const currentNode = this.waitFrozenList.shift()
        // 冻结children
        const isFrozen = Object.isFrozen(currentNode.children)
        if (isFrozen === false) {
          currentNode.children = Object.freeze(cloneDeep(currentNode.children))
        }
      }
    },
    virtualScroll(e) {
      const diff = e.target.scrollTop - this.scrollTopVal
      this.scrollTopVal += diff
      if (Math.abs(diff) > 200) {
        // 手动滚动过快还是要渲染
        if (this.isAmendScrollTop) {
          this.getRenderList()
          this.isAmendScrollTop = false
          return
        }
        // 滚动过快则略过渲染
        return
      }
      if (this.isAmendScrollTop === false) {
        this.getRenderList()
      }

      this.isAmendScrollTop = false
    },
    initCurrentRealDataAndRealHeight() {
      let totalHeight = 0
      for (let i = 0; i < this.realDataLen; i++) {
        const temp = { ...this.realData[i] }
        if (temp._nodeInfo === undefined) {
          temp._nodeInfo = {}
        }
        temp.index = i
        temp._nodeInfo._topNum = totalHeight
        if (temp._nodeInfo._height === undefined) {
          temp._nodeInfo._height = compType[temp.type] || this.preItemHeight
          temp._nodeInfo._isInitialHeight = true
        }
        totalHeight += temp._nodeInfo._height
        if (this.isUnfreeze) {
          this.currentRealData[i] = temp
        } else {
          this.currentRealData[i] = Object.freeze(temp)
        }
      }
      this.totalHeight = totalHeight
    },
    updateRealHeight() {
      const realDataLen = this.realDataLen
      if (this.waitUpdateItemMinIdx === realDataLen) {
        return
      }
      const firstChangeIdx = this.waitUpdateItemMinIdx
      this.waitUpdateItemMinIdx = realDataLen

      const updateStartIdx = firstChangeIdx
      if (this.isUpdatingRealHeight) {
        return
      }
      this.isUpdatingRealHeight = true
      let totalHeight = 0
      const updateEndIdx = realDataLen
      const renderStartNodeHeight = this.currentRealData[this.renderStartNode.index]._nodeInfo._height
      for (let i = updateStartIdx; i < updateEndIdx; i++) {
        const item = this.currentRealData[i]
        const preItem = this.currentRealData[i - 1]

        if (item._nodeInfo._isInitialHeight === true) {
          // 如果高度是初始赋值，则判断初始赋值是否有变化，有变化则重新赋值初始值
          const initialHeight = compType[item.type] || this.preItemHeight
          if (item._nodeInfo._height !== initialHeight) {
            item._nodeInfo._height = initialHeight
          }
        }
        if (preItem) {
          item._nodeInfo._topNum = preItem._nodeInfo._topNum + preItem._nodeInfo._height
        } else {
          item._nodeInfo._topNum = 0
        }

        totalHeight = item._nodeInfo._topNum + item._nodeInfo._height
      }
      this.totalHeight = totalHeight
      const toScrollTop = this.currentRealData[this.renderStartNode.index]?._nodeInfo._topNum + this.renderStartNode.scrollOffset
      let refVirtualList = this.$refs.virtualList
      console.log('sizeChange', firstChangeIdx, this.renderStartNode.index, renderStartNodeHeight)
      if (refVirtualList && refVirtualList.scrollTop !== toScrollTop) {
        // 因为renderStartNode之前的子项高度改变，导致页面渲染内容改变，所以要修正滚动高度，修正transform的位移
        this.isAmendScrollTop = true
        this.$nextTick(() => {
          this.$refs.virtualList.scrollTop = toScrollTop
          this.virtualStyle = {
            transform: `translate3d(0, ${this.currentRealData[this.renderStartNode.index]?._nodeInfo._topNum}px, 0)`,
          }
        })
      } else {
        this.getRenderList()
      }
      refVirtualList = null
      this.isUpdatingRealHeight = false
    },
    findCenterIndex(value, list) {
      let start = 0

      // realData.some((item, index) => {
      //   if (item._nodeInfo._topNum > value) {
      //     start = Math.max(0, index - 1)
      //     return true
      //   }
      // })
      start = binarySearch(list, value) || 0
      if (start === 0) {
        if (value > list[list.length - 1]?._nodeInfo._topNum) {
          start = list.length - 1 >= 0 ? list.length - 1 : 0
        }
      }
      return start
    },
    offsetScrollHandle(offsetScroll) {
      if (offsetScroll) {
        // 锚点补上偏移
        this.$refs.virtualList.scrollTop = this.$refs.virtualList.scrollTop + offsetScroll
      }
    },
    scrollToTargetHandle(virtualListItemIdx) {
      this.updateRealHeight()
      const res = this.currentRealData.find(item => {
        return item.index === virtualListItemIdx
      })
      if (res) {
        this.scrollToIndex(res)
      }
    },
    /**
     * 跳转到指定的item
     */
    scrollToIndex(targetItem) {
      this.$refs.virtualList.scrollTop = targetItem._nodeInfo._topNum
      this.scrollTopVal = targetItem._nodeInfo._topNum
      this.waitScrollOffsetData = Object.assign({}, this.waitScrollOffsetData, {
        isScrollToTarget: true,
      })
    },
    getRenderList() {
      const top = this.scrollTopVal
      let start = this.findCenterIndex(top, this.currentRealData) - HEAD_PRELOAD
      // console.log('start:', start)
      if (start < 0) {
        start = 0
      }
      const transformHeight = this.currentRealData[start]?._nodeInfo._topNum || 0
      this.renderStartNode = {
        index: start,
        scrollOffset: top - transformHeight,
      }
      if (start === this.renderList?.[0]?.index && this.isSizeChange === false) {
        // 起点start相同并且size也相同，则不更新renderList
        return
      } else {
        this.isSizeChange = false
      }

      this.virtualStyle = {
        transform: `translate3d(0, ${transformHeight}px, 0)`,
      }

      const fillHeight = MAX_RENDER_NUM // 最多同时渲染条数
      let end = start + fillHeight
      end = Math.min(end, this.realDataLen)

      let heightSum = 0
      let maxNodeHeight = 0
      let isDelMax = false
      const result = []
      if (this.screenHeight === 0) {
        this.screenHeight = this.$refs.virtualList.offsetHeight
      }

      for (let i = start; i < end; i++) {
        const currentNode = this.currentRealData[i]
        const nextNode = this.currentRealData[i + 1]
        const currentHeight = currentNode._nodeInfo._height
        const nextHeight = nextNode?._nodeInfo._height || 0
        if (currentHeight < this.screenHeight * 1.5) {
          // 只计算小于1.5倍屏幕高度的node的总高度
          heightSum += currentHeight
        }
        if (currentHeight > maxNodeHeight) {
          maxNodeHeight = currentHeight
        }
        if (nextHeight > maxNodeHeight) {
          maxNodeHeight = nextHeight
        }
        if (heightSum < this.screenHeight * 1.5) {
          if (this.isUnfreeze) {
            // 解冻，会修改currentNode
            this.unfreezeHandle(this.currentRealData, currentNode, this.freezeKeyName)
          }
          result.push(currentNode)
          if (heightSum + nextHeight > this.screenHeight * 1.5) {
            if (!isDelMax) {
              isDelMax = true
              heightSum -= maxNodeHeight
            }
          }
        } else {
          break
        }
      }
      if (start === this.renderList?.[0]?.index && this.renderList.length === result.length) {
        // 起点start相同并且result的length也相同，则不更新renderList
        return
      }

      if (result) {
        // 数据行头部显隐逻辑
        const res = result.find(item => {
          return item.type === 'dataRowItem'
        })
        if (res) {
          // 渲染列表里是否有数据行头部
          let dadaRowHeader = result.find(item => {
            return item.key === res.rowDataKey
          })
          // 渲染列表里没有数据行头部，并且destroyedData里也没数据行头部，则储存到destroyedData
          if (dadaRowHeader === undefined && this.destroyedData[res.rowDataKey] === undefined) {
            dadaRowHeader = this.currentRealData.find(item => {
              return item.key === res.rowDataKey
            })
            if (dadaRowHeader) {
              this.$set(this.destroyedData, res.rowDataKey, dadaRowHeader)
            }
          }

          // 设置最终要显示的数据行头部
          this.setDestroyedListShowOrderHandle(res)
        } else {
          // 如果渲染数据里没有数据行，则将destroyedData置空
          this.destroyedData = {}
        }
      }
      // 尾部增加预加载数据
      const resultEndItem = result[result.length - 1]
      if (resultEndItem) {
        const resultEndIdx = resultEndItem.index
        const footerExtraStartIdx = resultEndIdx + 1
        for (let i = footerExtraStartIdx; i < footerExtraStartIdx + FOOTER_PRELOAD; i++) {
          const endItem = this.currentRealData[i]
          if (endItem) {
            result.push(endItem)
          }
        }
      }

      this.renderList = result
      // console.log(this.currentRealData)
    },
    /**
     * 将列表子项的目标属性解冻，会修改原数据
     */
    unfreezeHandle(realData, realDataItem, freezeKeyName) {
      let ArrFreezeKeyName = []
      if (freezeKeyName) {
        ArrFreezeKeyName = ArrFreezeKeyName.concat(freezeKeyName)
        ArrFreezeKeyName.forEach(keyName => {
          const temp = getValueByPath(realDataItem, keyName)
          if (temp) {
            // 解冻temp
            const isFrozen = Object.isFrozen(temp)
            if (isFrozen === true) {
              const [parentKeyName, childrenKeyName] = splitLastDot(keyName)
              let cloneTemp = temp
              if (Array.isArray(temp)) {
                cloneTemp = [...temp]
              } else {
                cloneTemp = { ...temp }
              }
              if (childrenKeyName === '') {
                realDataItem[parentKeyName] = cloneTemp
              } else {
                getValueByPath(realDataItem, parentKeyName)[childrenKeyName] = cloneTemp
              }
            }
          }
        })
      } else {
        if (Object.isFrozen(realDataItem)) {
          realData[realDataItem.index] = { ...realDataItem }
        }
      }
    },
    /**
     * 将列表子项的目标属性冻结，会修改原数据
     */
    freezeHandle(realData, realDataItem, freezeKeyName) {
      let ArrFreezeKeyName = []
      if (freezeKeyName) {
        ArrFreezeKeyName = ArrFreezeKeyName.concat(freezeKeyName)
        ArrFreezeKeyName.forEach(keyName => {
          const temp = getValueByPath(realDataItem, keyName)
          if (temp) {
            // 冻结temp
            const isFrozen = Object.isFrozen(temp)
            if (isFrozen === false) {
              const [parentKeyName, childrenKeyName] = splitLastDot(keyName)
              const cloneTemp = Object.freeze(cloneDeep(temp))
              if (childrenKeyName === '') {
                realDataItem[parentKeyName] = cloneTemp
              } else {
                getValueByPath(realDataItem, parentKeyName)[childrenKeyName] = cloneTemp
              }
            }
            realData[realDataItem.index] = { ...realDataItem }
          }
        })
      } else {
        // 清空realDataItem的Observer
        realData[realDataItem.index] = cloneDeep(realDataItem)
        // 清空realDataItem的Observer，并冻结
        // realData[realDataItem.index] =Object.freeze(cloneDeep(realDataItem))
      }
    },
    getAverageCompPreHeight(realData) {
      const averageCompPreHeight = {}
      const compType = {}
      for (let i = 0; i < realData.length; i++) {
        const realDataItem = realData[i]
        if (averageCompPreHeight[realDataItem.type] === undefined) {
          averageCompPreHeight[realDataItem.type] = {
            totalHeight: 0,
            count: 0,
          }
        }
        if (realDataItem._nodeInfo._isInitialHeight === false) {
          averageCompPreHeight[realDataItem.type].totalHeight += realDataItem._nodeInfo._height
          averageCompPreHeight[realDataItem.type].count += 1
        }
      }
      Object.keys(averageCompPreHeight).forEach(key => {
        const { totalHeight, count } = averageCompPreHeight[key]
        if (count > 0) {
          compType[key] = Math.floor(totalHeight / count)
        }
      })
      return compType
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/style/mixin.scss';

.container {
  height: 100%;
}
.virtual-list-container {
  @media (min-width: 768px) {
    @include scrollBar;

    &::-webkit-scrollbar {
      width: 4px;
    }
  }

  height: 100%;
  position: relative;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.phantom {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}

.content-item {
  position: relative;
}
.destroyed-but-need-show {
  position: absolute;
  width: 100%;
  z-index: 9;
  top: 0;
}
.preview-item {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
}
</style>
