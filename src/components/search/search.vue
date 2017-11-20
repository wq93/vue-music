<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll ref="shortcut" class="shortcut" :data="shortcut">
        <div>
          <div class="hot-key" v-show="hotKey.length!=0">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest ref="suggest"
               :query="query"
               :showSinger="showSinger"
               @select="saveSearch"
               @listScroll="blurInput"></suggest>
    </div>
    <confirm ref="confirm" @confirm="clearSearchHistory" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getHotKey} from '../../api/search'
  import {ERR_OK} from '../../api/config'
  import Scroll from '../../base/scroll/scroll'
  import SearchBox from '../../base/search-box/search-box.vue'
  import Suggest from '../../components/suggest/suggest.vue'
  import {mapActions, mapGetters} from 'vuex'
  import SearchList from '../../base/search-list/search-list.vue'
  import Confirm from '../../base/confirm/confirm'
  import {playlistMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin],
    created() {
      this._getHotkey()
    },
    computed: {
      shortcut() {
        return this.hotKey.concat(this.searchHistory)
      },
      ...mapGetters([
        'searchHistory'
      ])
    },
    data() {
      return {
        hotKey: [],
        query: '',
        showSinger: true
      }
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()
      },
      addQuery(query) {
        // 调用searchBox组件的setQuery方法
        this.$refs.searchBox.setQuery(query)
      },
      onQueryChange(query) {
        // 监听子组件传入的变量变化
        this.query = query
      },
      blurInput() {
        this.$refs.searchBox.blur()
      },
      saveSearch() {
        // 设置搜索数组
        this.saveSearchHistory(this.query)
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      _getHotkey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      ...mapActions([
        'saveSearchHistory',
        'clearSearchHistory'
      ])
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Scroll,
      Confirm
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
