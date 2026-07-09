/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload'
import type { TarotApi } from '../../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: TarotApi
  }
}

export {}
