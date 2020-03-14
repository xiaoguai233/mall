import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios';
import './assets/fonts/iconfont.css'

axios.defaults.baseURL = 'http://106.12.11.162:8888/api/private/v1'
//这样每个vue的组件就可以通过this.$http访问到axios
axios.interceptors.request.use(config => {
  // NProgress.start()
  // console.log(config)
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
