import { create } from 'zustand'

/**
 * Whether the Report Issue dialog is open.
 *
 * **Transient, and deliberately not persisted.** It has two openers — the About
 * card's button and the error boundary's fallback — which is the only reason it
 * is a store at all rather than local state in the component that opens it. It
 * carries no settings key, so it never touches `settingsSchema` or the four-place
 * settings edit chain.
 */
interface ReportState {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useReportStore = create<ReportState>((set) => ({
  open: false,
  setOpen: (open) => set({ open })
}))
