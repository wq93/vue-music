import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

// 插入歌曲
function insertArray(arr, val, compare, maxLen) {
  // 查找query在数组的index
  const index = arr.findIndex(compare)
  // 第一位不做什么
  if (index === 0) {
    return
  }
  if (index > 0) {
    // 删除
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 删除歌曲
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 保存搜索记录
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 删除搜索记录(单)
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 清楚搜索记录
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

// 获取搜索记录
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

// 保存播放历史歌手
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

// 获取播放历史歌手
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

// 保存我喜欢歌曲
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 删除我喜欢
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 获取我喜欢
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
