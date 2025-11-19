export interface Plate {
  id: string
  name: string
  width: number
  height: number
}

export interface PieceTemplate {
  id: string
  name: string
  width: number
  height: number
  quantity: number
  color: string
}

export interface PlacedPiece {
  id: string
  templateId: string
  name: string
  width: number
  height: number
  x: number
  y: number
  color: string
}

export interface CsvPieceInput {
  name: string
  width: number
  height: number
  quantity: number
}

