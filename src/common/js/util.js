import $ from 'jquery'

// 区间随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 打乱数组顺序
export function shuffle(arr) {
  // 复制一个数组,以免打乱数组后影响之前的数组
  let _arr = arr.slice()
  $.each(_arr, (i, v) => {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  })
  return _arr
}

// 节流函数
export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
