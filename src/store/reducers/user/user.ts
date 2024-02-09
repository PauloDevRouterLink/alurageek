import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { UsersProps } from '@/components/types/users-props'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { collectionUser } from '@/config/firebase/collections'
import { SignUpProps } from '@/pages/authentication/modules/sign-up/useSignUp'
import { auth } from '@/config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { toasts } from '@/components/ui'
import { SignInProps } from '@/pages/authentication/modules/sign-in/useSignIn'
import { setLocalStorage } from './functions/set-local-storage'
import { dataUserLocalStorageKey } from '@/constants/local-storage-key'
import usersService from '@/services/get-users'

type UserType = {
  user: UsersProps
  isLogged: boolean
}

const fetchUser = createAsyncThunk('user/get', usersService.get)

const INITIAL_STATE: UserType = {
  user: {} as UsersProps,
  isLogged: false,
}

const usersSlice = createSlice({
  name: 'user',
  initialState: INITIAL_STATE,
  reducers: {
    handleSignUp: (_, { payload }: PayloadAction<SignUpProps>) => {
      const { email, password } = payload

      const signUp = async () => {
        try {
          const authResponse = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          )
          const uid = authResponse.user.uid
          const docRef = doc(collectionUser, uid)

          await setDoc(docRef, payload)
          toasts.success({ title: 'Usuário cadastrado' })
        } catch (error: unknown) {
          if (error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
              toasts.error({ title: 'Email já cadastrado' })
              return
            }
          }

          toasts.error({ title: 'Ops! Aconteceu um erro inesperado' })
        }
      }

      signUp()
    },
    handleSignIn: (state, { payload }: PayloadAction<SignInProps>) => {
      const { email, password } = payload

      const signIn = async () => {
        try {
          const authResponse = await signInWithEmailAndPassword(
            auth,
            email,
            password,
          )
          const uid = authResponse.user.uid
          await setLocalStorage(uid)
          toasts.success({ title: 'Usuário logado' })
        } catch (error: unknown) {
          if (error instanceof FirebaseError) {
            if (error.code === 'auth/invalid-credential') {
              toasts.error({ title: 'Credenciais inválidas' })
              return
            }
          }
          toasts.error({ title: 'Ops! Aconteceu um erro inesperado' })
        }
      }

      signIn()
      state.isLogged = true
    },
    logout: (state) => {
      state.isLogged = false
      async function handleLogout() {
        await signOut(auth)
          .then(() => {
            localStorage.removeItem(dataUserLocalStorageKey)
          })
          .catch((err) => {
            console.log(err)
          })
      }
      handleLogout()
    },
    getUserLogged: (_, { payload }: PayloadAction<UserType>) => {
      return payload
    },
  },
})

export { fetchUser }
export const { handleSignUp, handleSignIn, logout, getUserLogged } =
  usersSlice.actions
export const userReducer = usersSlice.reducer
