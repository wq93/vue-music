import $ from 'jquery'
// 区间随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 打乱数组顺序
export function shuffle(arr) {
  $.each(arr, (i, v) => {
    let j = getRandomInt(0, i)
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  })
  return arr
}
