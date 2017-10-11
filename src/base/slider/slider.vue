<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <!--插槽-->
      <slot></slot>
    </div>
    <div class="dots">

    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import {addClass} from '../../common/js/dom'

  export default {
    props: {
      loop: { // 是否轮播
        type: Boolean,
        default: true
      },
      autoPlay: { // 是否自动轮播
        type: Boolean,
        default: true
      },
      interval: { // 轮播间隔
        type: Number,
        default: 4000
      }
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initSlider()
      }, 20)
    },
    methods: {
      _setSliderWidth() {
        this.children = this.$refs.sliderGroup.children

        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item') // 每个元素添加class

          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }

        if (this.loop) { // 如果需要轮播 加宽度
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          // BScroll配置
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
        })
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
