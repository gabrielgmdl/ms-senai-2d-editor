import type { Plate } from '../types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const defaultPlates: Plate[] = [
  { id: 'plate-a', name: 'Chapa A', width: 2750, height: 1840 },
  { id: 'plate-b', name: 'Chapa B', width: 2000, height: 1000 },
]

export const fetchPlates = async (): Promise<Plate[]> => {
  await delay(400)
  return defaultPlates
}

export const saveLayout = async () => {
  await delay(400)
  return { ok: true }
}

