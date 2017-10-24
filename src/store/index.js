/*
 * 入口
 * */
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger' // 通过mutations修改state时,会在控制台输出日志

Vue.use(Vuex)

// 判断是开发模式 or 上线模式
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug, // 开启严格模式
  plugins: debug ? [createLogger()] : []
})
