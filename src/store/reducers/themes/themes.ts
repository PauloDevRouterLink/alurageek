import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type ThemeType = { theme: string }

const INITIAL_STATE: ThemeType = { theme: 'light' }

const themeSlice = createSlice({
  name: 'theme',
  initialState: INITIAL_STATE,
  reducers: {
    setTheme: (state, { payload }: PayloadAction<string>) => {
      state.theme = payload
      localStorage.setItem('@appTheme', JSON.stringify(payload))
    },
  },
})

export const { setTheme } = themeSlice.actions
export const themesReducer = themeSlice.reducer
