import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { LanguageSelector } from './components/LanguageSelector'
import { PlateManager } from './components/PlateManager'
import { PiecesPanel } from './components/PiecesPanel'
import { BoardEditor } from './components/BoardEditor'
import type { CsvPieceInput, PieceTemplate, PlacedPiece, Plate } from './types'
import { fetchPlates } from './services/mockApi'
import { colorFromString } from './utils/colors'
import { pieceToRect, rectanglesOverlap } from './utils/geometry'

const buildId = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Date.now()}`

const upsertPiece = (collection: PieceTemplate[], payload: CsvPieceInput): PieceTemplate[] => {
  const existingIndex = collection.findIndex(
    (piece) =>
      piece.name.toLowerCase() === payload.name.toLowerCase() &&
      piece.width === payload.width &&
      piece.height === payload.height,
  )

  if (existingIndex >= 0) {
    const clone = [...collection]
    clone[existingIndex] = {
      ...clone[existingIndex],
      quantity: clone[existingIndex].quantity + payload.quantity,
    }
    return clone
  }

  return [
    ...collection,
    {
      id: buildId('piece'),
      name: payload.name,
      width: payload.width,
      height: payload.height,
      quantity: payload.quantity,
      color: colorFromString(`${payload.name}-${payload.width}-${payload.height}`),
    },
  ]
}

function App() {
  const { t } = useTranslation()
  const [plates, setPlates] = useState<Plate[]>([])
  const [selectedPlateId, setSelectedPlateId] = useState<string | null>(null)
  const [pieces, setPieces] = useState<PieceTemplate[]>([])
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>([])
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlates().then((data) => {
      setPlates(data)
      if (data.length) {
        setSelectedPlateId(data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    setLastError(null)
  }, [selectedPlateId])

  const selectedPlate = useMemo(
    () => plates.find((plate) => plate.id === selectedPlateId) ?? null,
    [plates, selectedPlateId],
  )

  const handleSelectPlate = (plateId: string) => {
    if (!plateId) {
      setSelectedPlateId(null)
      setPlacedPieces([])
      return
    }
    setSelectedPlateId(plateId)
    setPlacedPieces([])
    setSelectedPieceId(null)
  }

  const handleCreatePlate = (data: { name: string; width: number; height: number }) => {
    const newPlate: Plate = {
      id: buildId('plate'),
      ...data,
    }
    setPlates((prev) => [...prev, newPlate])
    setSelectedPlateId(newPlate.id)
    setPlacedPieces([])
  }

  const handleAddPiece = (payload: CsvPieceInput) => {
    setPieces((prev) => upsertPiece(prev, payload))
  }

  const handleBulkAdd = (items: CsvPieceInput[]) => {
    setPieces((prev) => items.reduce((acc, item) => upsertPiece(acc, item), prev))
  }

  const handleDropPiece = (pieceId: string, position: { x: number; y: number }) => {
    if (!selectedPlate) {
      return
    }

    const template = pieces.find((piece) => piece.id === pieceId)
    if (!template || template.quantity <= 0) {
      return
    }

    // Garantir que a peça tenha no mínimo 1x1
    if (template.width < 1 || template.height < 1) {
      setLastError('minSize')
      return
    }

    // Garantir que a posição seja um valor inteiro na grade de 1x1
    const roundedX = Math.max(0, Math.floor(position.x))
    const roundedY = Math.max(0, Math.floor(position.y))

    const withinBounds =
      roundedX >= 0 &&
      roundedY >= 0 &&
      roundedX + template.width <= selectedPlate.width &&
      roundedY + template.height <= selectedPlate.height

    if (!withinBounds) {
      setLastError('bounds')
      return
    }

    const candidate: PlacedPiece = {
      id: buildId('placed'),
      templateId: template.id,
      name: template.name,
      width: template.width,
      height: template.height,
      x: roundedX,
      y: roundedY,
      color: template.color,
    }

    const collides = placedPieces.some((piece) => rectanglesOverlap(pieceToRect(piece), pieceToRect(candidate)))

    if (collides) {
      setLastError('collision')
      return
    }

    setPlacedPieces((prev) => [...prev, candidate])
    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === pieceId ? { ...piece, quantity: Math.max(piece.quantity - 1, 0) } : piece,
      ),
    )
    setSelectedPieceId(candidate.id)
    setLastError(null)
  }

  const handleMovePiece = (pieceId: string, position: { x: number; y: number }) => {
    if (!selectedPlate) {
      return
    }

    const piece = placedPieces.find((p) => p.id === pieceId)
    if (!piece) {
      return
    }

    // Garantir mínimo de 1x1
    if (piece.width < 1 || piece.height < 1) {
      setLastError('minSize')
      return
    }

    // Garantir que a posição seja um valor inteiro na grade de 1x1
    const roundedX = Math.max(0, Math.floor(position.x))
    const roundedY = Math.max(0, Math.floor(position.y))

    // Verificar limites da chapa
    const withinBounds =
      roundedX >= 0 &&
      roundedY >= 0 &&
      roundedX + piece.width <= selectedPlate.width &&
      roundedY + piece.height <= selectedPlate.height

    if (!withinBounds) {
      setLastError('bounds')
      return
    }

    // Criar candidato com nova posição (sempre valores inteiros)
    const candidate: PlacedPiece = {
      ...piece,
      x: roundedX,
      y: roundedY,
    }

    // Verificar colisão com outras peças (exceto a própria peça sendo movida)
    const collides = placedPieces.some(
      (otherPiece) => otherPiece.id !== pieceId && rectanglesOverlap(pieceToRect(otherPiece), pieceToRect(candidate)),
    )

    if (collides) {
      setLastError('collision')
      return
    }

    // Atualizar posição da peça
    setPlacedPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? candidate : p)),
    )
    setLastError(null)
  }

  const handleRemovePiece = (pieceId: string) => {
    const piece = placedPieces.find((p) => p.id === pieceId)
    if (!piece) {
      return
    }

    // Remover a peça da chapa
    setPlacedPieces((prev) => prev.filter((p) => p.id !== pieceId))

    // Incrementar a quantidade disponível do template
    setPieces((prev) =>
      prev.map((template) =>
        template.id === piece.templateId
          ? { ...template, quantity: template.quantity + 1 }
          : template,
      ),
    )

    setSelectedPieceId(null)
    setLastError(null)
  }

  return (
    <div className="app">
      {/* Mensagem de erro no canto superior */}
      {lastError && (
        <div className="error-toast">
          {lastError === 'collision' && t('editor.collisionError')}
          {lastError === 'bounds' && t('editor.boundsError')}
          {lastError === 'minSize' && t('editor.minSizeError')}
        </div>
      )}

      <header className="app-header">
        <div>
          <h1>{t('app.title')}</h1>
          {selectedPlate && (
            <p>
              {selectedPlate.name} · {selectedPlate.width} x {selectedPlate.height}
            </p>
          )}
        </div>
        <LanguageSelector />
      </header>

      <main className="layout">
        <div className="sidebar">
          <PlateManager
            plates={plates}
            selectedPlateId={selectedPlateId}
            onSelectPlate={handleSelectPlate}
            onCreatePlate={handleCreatePlate}
            currentPlate={selectedPlate}
          />
          <PiecesPanel pieces={pieces} onAddPiece={handleAddPiece} onBulkAdd={handleBulkAdd} />
        </div>
        <BoardEditor
          plate={selectedPlate}
          pieces={placedPieces}
          selectedPieceId={selectedPieceId}
          onDropPiece={handleDropPiece}
          onMovePiece={handleMovePiece}
          onSelectPiece={setSelectedPieceId}
          onRemovePiece={handleRemovePiece}
          lastError={lastError}
        />
      </main>
    </div>
  )
}

export default App
