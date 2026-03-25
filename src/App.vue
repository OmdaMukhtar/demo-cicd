<template>
  <div class="card">
    <h1>{{ appName }}</h1>
    <p><strong>Build:</strong> {{ buildNumber }}</p>
    <p><strong>Deployed At:</strong> {{ deployedAt }}</p>
    <p><strong>Status:</strong> <span class="success">{{ status }}</span></p>
    <p><strong>URL:</strong> {{ url }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      appName: "DevOps Demo App",
      buildNumber: import.meta.env.VITE_BUILD || "N/A",
      deployedAt: new Date().toLocaleString(),
      status: "SUCCESS",
      url: window.location.origin
    };
  }
};
</script>

<style>
.card {
  background: #1e293b;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  margin: auto;
}
.success {
  color: #22c55e;
}
</style>
