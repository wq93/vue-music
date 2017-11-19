import {playMode} from '../../common/js/config'
import {shuffle} from '../../common/js/util'
import {mapGetters, mapMutations, mapActions} from 'vuex'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  // dom准备完
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  // keep-alive切换过来时触发
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    // 导入的组件内没有定义handlePlaylist方法报错
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'playlist', // 播放列表
      'currentSong', // 当前播放歌曲
      'mode', // 播放模式
      'sequenceList' // 初始歌曲列表
    ])
  },
  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlaymode(mode)
      // 切换播放状态,更换歌曲列表
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 记录当前歌曲,避免切换播放状态找不到这首歌
      this.resetCurrentIndex(list)
      // 更换store中的playList
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        // 判断歌曲的唯一id
        return item.id === this.currentSong.id
      })
      // 改变store中的index
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlaymode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}
