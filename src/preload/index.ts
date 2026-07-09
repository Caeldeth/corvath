import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Deck, Layout, Reading, SavedImage, Settings, TarotApi } from '../shared/types'

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
    deleteImage: (deckId: string, cardId: string): Promise<void> =>
      ipcRenderer.invoke('decks:deleteImage', deckId, cardId),
    deleteDeckImages: (deckId: string): Promise<void> =>
      ipcRenderer.invoke('decks:deleteDeckImages', deckId),
    imageUrl: (deckId: string, filename: string): string =>
      `corvath-asset://img/${encodeURIComponent(deckId)}/${encodeURIComponent(filename)}`
  },
  layouts: {
    getAll: (): Promise<Layout[]> => ipcRenderer.invoke('layouts:getAll'),
    save: (layouts: Layout[]): Promise<void> => ipcRenderer.invoke('layouts:save', layouts)
  },
  loadSettings: (): Promise<Settings> => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings: Settings): Promise<void> =>
    ipcRenderer.invoke('settings:save', settings),
  appReady: (): void => ipcRenderer.send('app:ready'),
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

// We always run with contextIsolation: true (the BrowserWindow default), so the
// non-isolated fallback some templates ship with is dead code here.
contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('api', api)
