<template>
  <div class="item" ref="item">
    <slot></slot>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import ResizeObserver from 'resize-observer-polyfill'

export default {
  name: 'BaseVirtualListItem',
  props: {
    index: {
      type: Number,
      default: 0,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      initItemHeight: 0,
    }
  },
  destroyed() {
    this.$emit('itemDestroyed', this.data)
  },
  created() {
    this.itemSizeChangeEndHandle = debounce(this.itemSizeChangeEndHandle, 50, {
      leading: false,
      trailing: true,
    })
  },
  mounted() {
    this.initItemHeight = this.$refs.item.offsetHeight
    const ro = new ResizeObserver(() => {
      // 高度发生变化时，将 'size-change' 事件 emit 到父组件
      const itemHeight = this.$refs.item.offsetHeight
      if (itemHeight !== this.initItemHeight) {
        this.itemSizeChangeEndHandle({ itemData: this.data, itemHeight })
      }
      this.itemSizeChangeHandle({ itemData: this.data, itemHeight })
    })
    ro.observe(this.$refs.item)
    this.$once('hook:beforeDestroy', ro.disconnect.bind(ro))

    if (this.data.type === 'dataRow') {
      this.$emit('delDestroyedList', this.data)
    }
    const itemHeight = this.initItemHeight
    this.$emit('itemMounted', { itemData: this.data, itemHeight })
  },
  methods: {
    itemSizeChangeHandle({ itemData, itemHeight }) {
      this.$emit('itemSizeChange', { itemData, itemHeight })
    },
    itemSizeChangeEndHandle({ itemData, itemHeight }) {
      this.initItemHeight = itemHeight
      this.$emit('itemSizeChangeEnd', { itemData, itemHeight })
    },
  },
}
</script>

<style scoped lang="scss">
.item {
  width: 100%;
  background-color: #fff;
}
</style>
