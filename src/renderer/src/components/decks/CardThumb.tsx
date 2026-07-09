import { Box, Card, CardActionArea, Typography } from '@mui/material'
import type { Deck, DeckCard } from '../../../../shared/types'
import { cardPlaceholderDataUrl } from '../../lib/cardPlaceholder'

interface CardThumbProps {
  deck: Deck
  card: DeckCard
  onClick: () => void
}

export default function CardThumb({ deck, card, onClick }: CardThumbProps) {
  const imageSrc = card.image
    ? `${window.api.decks.imageUrl(deck.id, card.image)}?v=${card.imageVersion ?? 0}`
    : cardPlaceholderDataUrl(card.name)
  const hasMeaning = !!(card.meaning && card.meaning.trim())

  return (
    <Card sx={{ width: 104 }}>
      <CardActionArea onClick={onClick}>
        <Box
          sx={{
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            bgcolor: 'background.default',
            borderBottom: 1,
            borderColor: 'divider',
            position: 'relative'
          }}
        >
          <img
            src={imageSrc}
            alt={card.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // Missing art (e.g. a not-yet-drawn card in a partially shipped
              // deck) falls back to the generated name placeholder.
              const img = e.currentTarget
              if (img.dataset.fallback) return
              img.dataset.fallback = '1'
              img.src = cardPlaceholderDataUrl(card.name)
            }}
          />
          {card.section === 'major' && card.number !== undefined && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                left: 4,
                px: 0.6,
                borderRadius: 0.5,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                fontSize: '0.65rem'
              }}
            >
              {card.number}
            </Box>
          )}
          {hasMeaning && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main'
              }}
            />
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{ display: 'block', px: 0.75, py: 0.5, textAlign: 'center', lineHeight: 1.2 }}
          noWrap
        >
          {card.name}
        </Typography>
      </CardActionArea>
    </Card>
  )
}
