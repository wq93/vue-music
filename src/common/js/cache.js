import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15

function insertArray(arr, val, compare, maxLen) {
  // 查找query在数组的index
  const index = arr.findIndex(compare)
  console.log(compare, index)
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

export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function loadSearch() {
  console.log(storage.get(SEARCH_KEY, []))
  return storage.get(SEARCH_KEY, [])
}
