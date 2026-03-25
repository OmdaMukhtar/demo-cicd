import { createApp } from 'vue'

const App = {
  data() {
    return {
      appName: "DevOps Demo App",
      buildNumber: import.meta.env.VITE_BUILD || "N/A",
      deployedAt: new Date().toLocaleString(),
      status: "SUCCESS",
      url: window.location.origin
    }
  },
  template: `
    <div class="card">
      <h1>{{ appName }}</h1>
      <p><strong>Build:</strong> {{ buildNumber }}</p>
      <p><strong>Deployed At:</strong> {{ deployedAt }}</p>
      <p><strong>Status:</strong> <span class="success">{{ status }}</span></p>
      <p><strong>URL:</strong> {{ url }}</p>
    </div>
  `
}

createApp(App).mount('#app')
