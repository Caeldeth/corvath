import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Deck, Reading, SavedImage, Settings, TarotApi } from '../shared/types'

const api: TarotApi = {
  readings: {
    getAll: (): Promise<Reading[]> => ipcRenderer.invoke('readings:getAll'),
    save: (readings: Reading[]): Promise<void> => ipcRenderer.invoke('readings:save', readings)
  },
  decks: {
    getAll: (): Promise<Deck[]> => ipcRenderer.invoke('decks:getAll'),
    save: (decks: Deck[]): Promise<void> => ipcRenderer.invoke('decks:save', decks),
    saveImage: (
      deckId: string,
      cardId: string,
      ext: string,
      data: Uint8Array
    ): Promise<SavedImage> => ipcRenderer.invoke('decks:saveImage', deckId, cardId, ext, data),
    imageUrl: (deckId: string, filename: string): string =>
      `corvath-asset://img/${encodeURIComponent(deckId)}/${encodeURIComponent(filename)}`
  },
  loadSettings: (): Promise<Settings> => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('settings:save', settings),
  window: {
    minimize: (): void => ipcRenderer.send('window:minimize'),
    toggleMaximize: (): void => ipcRenderer.send('window:toggleMaximize'),
    close: (): void => ipcRenderer.send('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (callback: (maximized: boolean) => void): (() => void) => {
      const listener = (_e: IpcRendererEvent, maximized: boolean): void => callback(maximized)
      ipcRenderer.on('window:maximizeChange', listener)
      return () => ipcRenderer.removeListener('window:maximizeChange', listener)
    }
  }
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
