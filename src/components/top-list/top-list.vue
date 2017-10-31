<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from '../../components/music-list/music-list.vue'
  import {getMusicList} from '../../api/rank'
  import {mapGetters} from 'vuex'
  import {ERR_OK} from '../../api/config'
  import {createSong} from '../../common/js/song'
  import $ from 'jquery'
  export default {
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    created() {
      this._getTopList()
    },
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        // 显示第一张图片
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    methods: {
      _getTopList() {
        // 刷新跳转路由
        if (!this.topList.id) {
          this.$router.push('/rank')
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        $.each(list, (index, item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
