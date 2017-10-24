/*
 * 修改数据
 * */
import * as types from './mutations-types'

const matutaions = {
  [types.SET_SINGER](state, singer){
    state.singer = singer
  }
}

export default matutaions
