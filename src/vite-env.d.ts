/// <reference types="vite/client" />

interface ImportMeta {
  env: {
    VITE_APP_GA_ID: string;
  };
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
