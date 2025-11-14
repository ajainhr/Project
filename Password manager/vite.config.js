import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin_login.html',
        adminDashboard: 'admin_dashboard.html',
        userDashboard: 'user_dashboard.html'
      }
    }
  },
  server: {
    port: 3000
  }
});