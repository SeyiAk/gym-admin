/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_FEATURE_ENABLED?: string;
  readonly VITE_APP_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
