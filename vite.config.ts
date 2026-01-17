import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Plugin pour copier index.html vers 404.html après le build
const copy404Plugin = () => {
  return {
    name: 'copy-404',
    closeBundle() {
      const distPath = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distPath, 'index.html');
      const notFoundPath = path.join(distPath, '404.html');
      
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
        console.log('✓ Copied index.html to 404.html for GitHub Pages');
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Si VITE_USE_CUSTOM_DOMAIN est défini, utiliser '/' (pour custom domain)
  // Sinon, utiliser le base path configuré ou '/LSCustom/' pour GitHub Pages
  base: process.env.VITE_USE_CUSTOM_DOMAIN === 'true'
    ? '/'
    : (process.env.GITHUB_PAGES === 'true' 
      ? (process.env.VITE_BASE_PATH || '/LSCustom/')
      : '/'),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    copy404Plugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
