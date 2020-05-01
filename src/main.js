import Vue from 'vue'
import layer from 'vue-layer'
// 组件
import App from './App.vue'
// 样式
import 'vue-layer/lib/vue-layer.css'

Vue.prototype.$layer = layer(Vue)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
