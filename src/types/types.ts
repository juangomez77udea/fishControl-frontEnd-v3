export interface Batch {
  id: string
  quantityAnimals: number
  averageWeight: number
  entryDate: string
  batchAge: number
  animalsRemoved: number
}

export interface CreateBatchDTO {
  quantityAnimals: number
  averageWeight: number
  entryDate: string
  batchAge: number
  animalsRemoved: number
}
