import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const requireContext = require.context('.', false, /\.js$/)
const modules = {}

requireContext.keys().forEach((fileName) => {
  if (fileName === './index.js') return
  const moduleName = fileName.replace(/(\.\/|\.js)/g, '')
  modules[moduleName] = requireContext(fileName).default
})

export default new Vuex.Store({
  modules
})
