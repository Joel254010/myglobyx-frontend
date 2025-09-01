/// <reference types="vite/client" />

// acrescente apenas o que é CUSTOM seu
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // NÃO redeclare DEV/PROD/SSR etc — já vêm de "vite/client"
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
