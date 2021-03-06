<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdClass">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="onPercentChange" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableClass">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableClass">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdClass" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <!--作为ProgressCircle组件的slot插槽-->
            <i @click.stop="togglePlaying" :class="playIconMini" class="icon-mini"></i>
            <!--作为ProgressCircle组件的slot插槽-->
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!--歌曲播放-->
    <audio ref="audio"
           :src="currentSong.url"
           @play="ready"
           @error="error"
           @timeupdate="updateTime"
           @ended="end"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from '../../common/js/dom'
  import {playMode} from '../../common/js/config'
  import ProgressBar from '../../base/progress-bar/progress-bar.vue'
  import ProgressCircle from '../../base/progress-circle/progress-circle.vue'
  import Scroll from '../../base/scroll/scroll.vue'
  import Lyric from 'lyric-parser'
  import Playlist from 'components/playlist/playlist'
  import {playerMixin} from '../../common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')
  export default {
    mixins: [playerMixin],
    data() {
      return {
        // 歌曲准备完才能切换,避免快速切换报错bug
        songReady: false, // 歌曲准备完毕标记
        currentTime: 0, // 当前歌曲的播放时间
        radius: 32, // 圆形进度条的宽度
        currentLyric: null, // 当前歌曲歌词
        currentLineNum: 0, // 当前歌词行数
        currentShow: 'cd', // 当前处于歌词页/CD页
        playingLyric: '' // 当前播放的歌词
      }
    },
    computed: {
      cdClass() { // cd图片的旋转
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() { // 根据playing来计算播放键的状态
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      playIconMini() { // 根据playing来计算播放键的状态
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableClass() {
        return this.songReady ? '' : 'disable'
      },
//      iconMode() {
//        // 播放状态
//        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
//      },
      percent() {
        // 根据当前播放时间/歌曲总时间计算百分比
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen', // 是否全屏
//        'playlist', // 播放列表
//        'currentSong', // 当前播放歌曲
        'playing', // 播放/暂停
        'currentIndex' // 当前播放歌曲索引
//        'mode', // 播放模式
//        'sequenceList' // 初始歌曲列表
      ])
    },
    created() {
      this.touch = {}
    },
    methods: {
      back() { // 关闭播放器
        // 触发事件修改fullScreen状态
        this.setFullScreen(false)
      },
      open() { // 展开播放器
        this.setFullScreen(true)
      },
      // 配置动画钩子
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        // 配置animations
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done) // done表示跳到下一个动画状态
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      togglePlaying() {
        // 设置playing的状态
        this.setPlayingState(!this.playing)
        // 暂停歌曲,暂停歌词
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      prev() {
        // 上一首
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          // 修改playing的状态,确保CD图正确旋转
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      end() {
        // 根据播放模式判断是否跳到下一首
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        // 将当前的播放时间置为0
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        // 循环播放时,歌曲结束歌词调回开头
        if (this.currentLyric) {
          this.currentLyric.seek()
        }
      },
      next() {
        // 下一首
        if (!this.songReady) {
          return
        }
        // 如果当前playlist就一首歌,length=1
        if (this.playlist.length === 1) {
          this.loop() // 循环播放
          return
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          // 修改playing的状态
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        // 修改标记
        this.songReady = false
      },
      ready() { // audio自带的资源准备完毕事件
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      error() { // audio自带的资源准备出错事件
        this.songReady = true
      },
      updateTime(e) { // audio自带的获取当前播放时间事件
        this.currentTime = e.target.currentTime
      },
      format(interval) {
        interval = interval | 0 // 向下取整
        const mintue = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${mintue}:${second}`
      },
      onPercentChange(percent) {
        // 当前播放时间
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        // 拖动结束自动播放
        if (!this.playing) {
          this.togglePlaying()
        }
        // 歌词插件封装的方法(改变歌曲的播放进度,同步歌词)
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
//      changeMode() {
//        const mode = (this.mode + 1) % 3
//        this.setPlaymode(mode)
//        // 切换播放状态,更换歌曲列表
//        let list = null
//        if (mode === playMode.random) {
//          list = shuffle(this.sequenceList)
//        } else {
//          list = this.sequenceList
//        }
//        // 记录当前歌曲,避免切换播放状态找不到这首歌
//        this.resetCurrentIndex(list)
//        // 更换store中的playList
//        this.setPlayList(list)
//      },
//      resetCurrentIndex(list) {
//        let index = list.findIndex((item) => {
//          // 判断歌曲的唯一id
//          return item.id === this.currentSong.id
//        })
//        // 改变store中的index
//        this.setCurrentIndex(index)
//      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          // 当前的歌曲的歌词和歌词不一致时
          if (this.currentSong.lyric !== lyric) {
            return
          }
          // 利用lyric-parser插件格式化歌词
          // 查看lyric-parser插件的api
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play() // 插件封装的方法
          }
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX // 滑动的偏移量
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) { // 如果是滑动歌词时, 结束函数
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 左边距
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth) // 滑动的距离/屏幕的宽度
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent // 区块的透明度
        this.$refs.middleL.style[transitionDuration] = 0
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      middleTouchEnd() {
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },
      _pad(num, n = 2) { // 秒小于10时,补0
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      _getPosAndScale() {
        const targetWidth = 40 // 小唱片图标的宽度
        const paddingLeft = 40  // 小唱片图标的左padding
        const paddingBottom = 30 // 小唱片图标的下padding
        const paddingTop = 80 // 大唱片图标到屏幕顶部的高度
        const width = window.innerWidth * 0.8 // 大唱片图标宽度
        const scale = targetWidth / width // 缩放比列
        // 偏移距离
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
//        setPlayingState: 'SET_PLAYING_STATE',
//        setCurrentIndex: 'SET_CURRENT_INDEX',
//        setPlaymode: 'SET_PLAY_MODE',
//        setPlayList: 'SET_PLAYLIST'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      // bug1 : 当我们切换了播放模式时,虽然我们保存了当前的歌曲(记录id,再通过id去新数组中找)
      // 但是watch还是认为我们发生了改变,所以切换播放状态的时候会出现处于暂停时 自动播放bug
      currentSong(newSong, oldSong) {
        // 当我们删除播放列表的一首歌的时候(播放列表为空)
        if (!newSong) {
          return
        }
        // 判断歌曲的id没变,说明是同一首歌
        if (newSong.id === oldSong.id) {
          return
        }
        if (this.currentLyric) {
          // bug : 快速切换歌曲时,歌词出现来回跳动
          // 原因: 每次切换歌曲,插件内部都会调用定时器,所以我们需要手动清理
          this.currentLyric.stop()
        }
        // 避免在移动端后台进程切到前台,js没有执行完毕就开始播放歌曲的bug
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          // 歌曲变化时播放歌曲
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) { // 监控playing的变化,达到歌曲的播放或者暂停
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
