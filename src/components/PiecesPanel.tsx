import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CsvPieceInput, PieceTemplate } from '../types'

interface PiecesPanelProps {
  pieces: PieceTemplate[]
  onAddPiece: (data: CsvPieceInput) => void
  onBulkAdd: (data: CsvPieceInput[]) => void
}

export const PiecesPanel = ({ pieces, onAddPiece, onBulkAdd }: PiecesPanelProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState<string | null>(null)

  const totalPieces = useMemo(
    () => pieces.reduce((total, piece) => total + piece.quantity, 0),
    [pieces],
  )

  const resetForm = () => {
    setName('')
    setWidth('')
    setHeight('')
    setQuantity('1')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name || !width || !height || !quantity) {
      setError(t('common.required'))
      return
    }

    onAddPiece({
      name,
      width: Number(width),
      height: Number(height),
      quantity: Number(quantity),
    })
    setError(null)
    resetForm()
  }

  const parseCsv = (text: string): CsvPieceInput[] => {
    const rows = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    return rows.map((row) => {
      const [csvName, csvWidth, csvHeight, csvQuantity] = row.split(/[;,]/).map((value) => value.trim())
      const widthValue = Number(csvWidth)
      const heightValue = Number(csvHeight)
      const quantityValue = Number(csvQuantity)
      if (!csvName || Number.isNaN(widthValue) || Number.isNaN(heightValue) || Number.isNaN(quantityValue)) {
        throw new Error('invalid csv')
      }
      return {
        name: csvName,
        width: widthValue,
        height: heightValue,
        quantity: quantityValue,
      }
    })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseCsv(String(reader.result))
        onBulkAdd(data)
        setError(null)
      } catch {
        setError(t('common.invalidCsv'))
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <section className="panel pieces-panel">
      <header>
        <h2>{t('pieces.panelTitle')}</h2>
        <span className="badge">{t('pieces.remaining', { count: totalPieces })}</span>
      </header>

      <div className="panel-block">
        <h3>{t('pieces.addTitle')}</h3>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('pieces.name')}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          <label className="field">
            <span>{t('common.width')}</span>
            <input
              type="number"
              min={1}
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t('common.height')}</span>
            <input
              type="number"
              min={1}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t('common.quantity')}</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary">
            {t('pieces.addPiece')}
          </button>
        </form>
      </div>

      <div className="panel-block">
        <h3>{t('pieces.loadCsv')}</h3>
        <div className="csv-actions">
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>
        <small className="muted">{t('pieces.csvHint')}</small>
      </div>

      <div className="panel-block">
        <h3>{t('pieces.listTitle')}</h3>
        {error && <p className="error">{error}</p>}
        {pieces.length === 0 ? (
          <p className="muted">{t('pieces.empty')}</p>
        ) : (
          <ul className="piece-list">
            {pieces.map((piece) => (
              <li
                key={piece.id}
                className={piece.quantity === 0 ? 'disabled' : ''}
                draggable={piece.quantity > 0}
                onDragStart={(event) =>
                  event.dataTransfer.setData('application/json', JSON.stringify({ pieceId: piece.id }))
                }
              >
                <div className="piece-name">
                  <strong>{piece.name}</strong>
                  <small>
                    {piece.width} x {piece.height}
                  </small>
                </div>
                <span className="badge">{t('pieces.remaining', { count: piece.quantity })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

