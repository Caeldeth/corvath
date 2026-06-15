import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Reading, Settings, TarotApi } from '../shared/types'

const api: TarotApi = {
  readings: {
    getAll: (): Promise<Reading[]> => ipcRenderer.invoke('readings:getAll'),
    save: (readings: Reading[]): Promise<void> => ipcRenderer.invoke('readings:save', readings)
  },
  loadSettings: (): Promise<Settings> => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('settings:save', settings)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore (define types in env.d.ts)
  window.electron = electronAPI
  // @ts-ignore (define types in env.d.ts)
  window.api = api
}
