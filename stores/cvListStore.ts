import { createStore } from 'zustand/vanilla'
import { type CvData } from '@/schemas/cv_data_schema'
import { fetchAllCvs } from '@/services/cv_data.service'

export type CVListState = {
  cvs: CvData[]
}

export type CVListActions = {
  updateList: () => Promise<CvData[]>
  getCVS: () => CvData[]
}

export type CVListStore = CVListState & CVListActions

export const defaultInitState: CVListState = {
  cvs: [],
}

export const createCVListStore = (
  initState: CVListState = defaultInitState,
) => {
  return createStore<CVListStore>()((set, get) => ({
    ...initState,
    updateList: async () => {
        const data = await fetchAllCvs()
        console.log(data)
        set((state) => ({ cvs: data }))
        return data
    },
    getCVS: () => {
        return get().cvs
    }
  }))
}
