import type { PlacedPiece } from '../types'

interface RectInput {
  x: number
  y: number
  width: number
  height: number
}

export const rectanglesOverlap = (a: RectInput, b: RectInput) => {
  // Dois retângulos se sobrepõem se há interseção real em ambas as dimensões
  // Isso significa que eles compartilham pelo menos um pixel de espaço
  const overlapX = a.x < b.x + b.width && b.x < a.x + a.width
  const overlapY = a.y < b.y + b.height && b.y < a.y + a.height
  return overlapX && overlapY
}

export const pieceToRect = (piece: PlacedPiece): RectInput => ({
  x: piece.x,
  y: piece.y,
  width: piece.width,
  height: piece.height,
})

