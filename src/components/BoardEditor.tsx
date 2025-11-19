import { useMemo, useRef, useState } from 'react'
import type { DragEvent, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlacedPiece, Plate } from '../types'

interface BoardEditorProps {
  plate: Plate | null
  pieces: PlacedPiece[]
  selectedPieceId: string | null
  onDropPiece: (pieceId: string, position: { x: number; y: number }) => void
  onMovePiece: (pieceId: string, position: { x: number; y: number }) => void
  onSelectPiece: (pieceId: string | null) => void
  onRemovePiece: (pieceId: string) => void
  lastError: string | null
}

export const BoardEditor = ({
  plate,
  pieces,
  selectedPieceId,
  onDropPiece,
  onMovePiece,
  onSelectPiece,
  onRemovePiece,
  lastError,
}: BoardEditorProps) => {
  const { t } = useTranslation()
  const boardRef = useRef<HTMLDivElement>(null)
  const [draggingPieceId, setDraggingPieceId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)

  const { scale, boardWidth, boardHeight, gridSize } = useMemo(() => {
    if (!plate) {
      return { scale: 1, boardWidth: 0, boardHeight: 0, gridSize: 1 }
    }
    
    // Usar escala 1:1 (1px = 1px) para mostrar os pixels reais da chapa
    const scale = 1
    
    // Grade de 1x1 pixel
    const gridSize = 1
    
    return {
      scale,
      boardWidth: plate.width,
      boardHeight: plate.height,
      gridSize,
    }
  }, [plate])

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!plate) {
      return
    }
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!plate) {
      return
    }
    event.preventDefault()
    const payload = event.dataTransfer.getData('application/json')
    if (!payload) {
      return
    }
    const { pieceId } = JSON.parse(payload)
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top

    // Arredondar para grid de 1x1
    const gridX = Math.round(relativeX / scale)
    const gridY = Math.round(relativeY / scale)

    onDropPiece(pieceId, { x: gridX, y: gridY })
  }

  const handlePieceMouseDown = (event: MouseEvent<HTMLButtonElement>, piece: PlacedPiece) => {
    event.preventDefault()
    event.stopPropagation()
    
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const pieceRect = event.currentTarget.getBoundingClientRect()
    // Calcular offset em relação à posição da peça na grade
    const mouseX = (event.clientX - rect.left) / scale
    const mouseY = (event.clientY - rect.top) / scale
    
    // Arredondar para grid de 1x1 e calcular offset relativo
    const gridMouseX = Math.round(mouseX)
    const gridMouseY = Math.round(mouseY)
    const offsetX = gridMouseX - piece.x
    const offsetY = gridMouseY - piece.y

    setDraggingPieceId(piece.id)
    setDragOffset({ x: offsetX, y: offsetY })
    onSelectPiece(piece.id)
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!draggingPieceId || !dragOffset || !plate) {
      return
    }

    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const mouseX = (event.clientX - rect.left) / scale
    const mouseY = (event.clientY - rect.top) / scale

    // Arredondar para grid de 1x1
    const gridX = Math.round(mouseX)
    const gridY = Math.round(mouseY)

    // Calcular nova posição respeitando o offset e a grade
    const newX = gridX - dragOffset.x
    const newY = gridY - dragOffset.y

    // Garantir que a posição final seja um valor inteiro na grade
    const finalX = Math.max(0, Math.round(newX))
    const finalY = Math.max(0, Math.round(newY))

    onMovePiece(draggingPieceId, { x: finalX, y: finalY })
  }

  const handleMouseUp = () => {
    setDraggingPieceId(null)
    setDragOffset(null)
  }

  if (!plate) {
    return (
      <section className="panel editor-panel">
        <header>
          <h2>{t('editor.title')}</h2>
        </header>
        <p className="muted">{t('editor.noPlate')}</p>
      </section>
    )
  }

  return (
    <section className="panel editor-panel">
      <header>
        <h2>{t('editor.title')}</h2>
        <span className="muted">{t('editor.dropHint')}</span>
      </header>

      <div className="board-wrapper">
        <div
          ref={boardRef}
          className={`board ${lastError ? 'invalid' : ''}`}
          style={{
            width: boardWidth,
            height: boardHeight,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            minWidth: boardWidth,
            minHeight: boardHeight,
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onSelectPiece(null)
            }
          }}
        >
          {pieces.map((piece) => (
            <button
              key={piece.id}
              type="button"
              className={`piece ${piece.id === selectedPieceId ? 'selected' : ''} ${draggingPieceId === piece.id ? 'dragging' : ''}`}
              style={{
                width: Math.max(1, piece.width * scale),
                height: Math.max(1, piece.height * scale),
                transform: `translate(${piece.x * scale}px, ${piece.y * scale}px)`,
                backgroundColor: piece.color,
              }}
              onMouseDown={(e) => handlePieceMouseDown(e, piece)}
              onClick={(e) => {
                e.stopPropagation()
                onSelectPiece(piece.id)
              }}
            >
              <span className="piece-name-text">{piece.name}</span>
              <span className="piece-area">
                {piece.width} × {piece.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {lastError && <p className="error">{t('editor.invalidPlacement')}</p>}

      <div className="selection-panel">
        <h3>{t('editor.selectedPiece')}</h3>
        {selectedPieceId ? (
          (() => {
            const piece = pieces.find((item) => item.id === selectedPieceId)
            if (!piece) {
              return <p className="muted">{t('editor.noSelection')}</p>
            }
            return (
              <>
                <ul>
                  <li>
                    <strong>{t('common.name')}:</strong> {piece.name}
                  </li>
                  <li>
                    <strong>{t('common.width')}:</strong> {piece.width}
                  </li>
                  <li>
                    <strong>{t('common.height')}:</strong> {piece.height}
                  </li>
                  <li>
                    <strong>X:</strong> {piece.x.toFixed(0)}
                  </li>
                  <li>
                    <strong>Y:</strong> {piece.y.toFixed(0)}
                  </li>
                </ul>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => {
                    onRemovePiece(piece.id)
                    onSelectPiece(null)
                  }}
                >
                  {t('editor.removePiece')}
                </button>
              </>
            )
          })()
        ) : (
          <p className="muted">{t('editor.selectionHint')}</p>
        )}
      </div>
    </section>
  )
}

