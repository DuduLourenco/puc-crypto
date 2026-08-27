/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_API_URL: string;
  readonly VITE_AZURE_APIM_KEY: string;
  readonly VITE_API_AUTH_TOKEN: string;
  readonly VITE_USE_MOCK_FALLBACK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
