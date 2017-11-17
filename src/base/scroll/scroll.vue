<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: { // better-scroll的类别
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        defalt: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: { // 是否需要监听滚动事件
        type: Boolean,
        default: false
      },
      pullup: { // 是否下拉刷新
        type: Boolean,
        default: false
      }
    },
    // dom ready时调用方法
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        // 添加监听滚动事件
        if (this.listenScroll) {
          let _this = this
          this.scroll.on('scroll', (pos) => {
            _this.$emit('scroll', pos)
          })
        }
        // 如果支持下拉刷新
        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            // 快到底部时
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd') // 像父组件派发scrollToEnd事件
            }
          })
        }
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        // apply保证上下文的指向
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        }, 20)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
