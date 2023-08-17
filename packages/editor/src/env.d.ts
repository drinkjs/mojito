/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_URL: string
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_GITEE_CLIENT_ID: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}