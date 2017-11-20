import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick' // 解决移动端300毫秒延迟
import VueLazyLoad from 'vue-lazyload'

Vue.config.productionTip = false
import 'common/stylus/index.styl'

/* eslint-disable no-unused-vars */
import vConsole from 'vconsole'

fastclick.attach(document.body)

Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
