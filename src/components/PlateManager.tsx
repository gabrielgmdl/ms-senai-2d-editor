import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Plate } from '../types'

interface PlateManagerProps {
  plates: Plate[]
  selectedPlateId: string | null
  onSelectPlate: (plateId: string) => void
  onCreatePlate: (data: { name: string; width: number; height: number }) => void
  currentPlate?: Plate | null
}

export const PlateManager = ({
  plates,
  selectedPlateId,
  onSelectPlate,
  onCreatePlate,
  currentPlate,
}: PlateManagerProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name || !width || !height) {
      return
    }

    onCreatePlate({
      name,
      width: Number(width),
      height: Number(height),
    })
    setName('')
    setWidth('')
    setHeight('')
  }

  return (
    <section className="panel plate-panel">
      <header>
        <h2>{t('plates.managerTitle')}</h2>
      </header>

      <div className="panel-block">
        <label className="field">
          <span>{t('plates.selectLabel')}</span>
          <select
            value={selectedPlateId ?? ''}
            onChange={(event) => onSelectPlate(event.target.value)}
          >
            <option value="">{t('plates.placeholder')}</option>
            {plates.map((plate) => (
              <option key={plate.id} value={plate.id}>
                {`${plate.name} (${plate.width}x${plate.height})`}
              </option>
            ))}
          </select>
        </label>

        <div className="current-plate">
          <strong>{t('plates.current')}</strong>
          {currentPlate ? (
            <>
              <span>{currentPlate.name}</span>
              <small>
                {t('plates.dimensions')}: {currentPlate.width} x {currentPlate.height}
              </small>
            </>
          ) : (
            <small>{t('plates.noSelection')}</small>
          )}
          <p className="muted">{t('plates.gridHint')}</p>
        </div>
      </div>

      <div className="panel-block">
        <h3>{t('plates.newTitle')}</h3>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('plates.name')}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          <label className="field">
            <span>{t('plates.width')}</span>
            <input
              type="number"
              min={1}
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t('plates.height')}</span>
            <input
              type="number"
              min={1}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary">
            {t('plates.create')}
          </button>
        </form>
      </div>
    </section>
  )
}

