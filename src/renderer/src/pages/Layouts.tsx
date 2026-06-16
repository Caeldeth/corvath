import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { UseLayouts } from '../hooks/useLayouts'
import LayoutList from '../components/layouts/LayoutList'
import LayoutEditor from '../components/layouts/LayoutEditor'

interface LayoutsProps {
  api: UseLayouts
}

export default function Layouts({ api }: LayoutsProps) {
  const {
    layouts,
    loaded,
    createLayout,
    updateLayout,
    deleteLayout,
    addPosition,
    updatePosition,
    deletePosition
  } = api
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded) return
    if (selectedId && !layouts.some((l) => l.id === selectedId)) {
      setSelectedId(layouts[0]?.id ?? null)
    } else if (!selectedId && layouts.length > 0) {
      setSelectedId(layouts[0].id)
    }
  }, [loaded, layouts, selectedId])

  const selected = layouts.find((l) => l.id === selectedId) ?? null

  const handleCreate = (): void => {
    const layout = createLayout()
    setSelectedId(layout.id)
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
      <LayoutList
        layouts={layouts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onDelete={deleteLayout}
      />
      {selected ? (
        <LayoutEditor
          key={selected.id}
          layout={selected}
          onUpdateLayout={(patch) => updateLayout(selected.id, patch)}
          onAddPosition={() => addPosition(selected.id)}
          onUpdatePosition={(positionId, patch) => updatePosition(selected.id, positionId, patch)}
          onDeletePosition={(positionId) => deletePosition(selected.id, positionId)}
        />
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Select a layout, or create a new one.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
