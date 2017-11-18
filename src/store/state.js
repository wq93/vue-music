/**
 * 数据状态
 */
import {playMode} from '../common/js/config'

const state = {
  singer: {}, // 歌手详情信息
  playing: false, // 播放状态
  fullScreen: false, // 播放器是否全屏
  playlist: [], // 歌曲列表
  sequenceList: [], // 排序的歌曲列表
  mode: playMode.sequence, // 播放模式
  currentIndex: -1,
  disc: {}, // 推荐item详情
  topList: {}, // 排行item详情
  searchHistory: [] // 搜索历史
}
export default state
