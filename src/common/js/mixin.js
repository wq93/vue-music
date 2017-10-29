import {mapGetters} from 'vuex'
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  // dom准备完
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  // keep-alive切换过来时触发
  activated () {
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
