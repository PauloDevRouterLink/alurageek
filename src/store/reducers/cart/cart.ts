import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { addDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore'
import { toasts } from '@/components/ui'
import { CartType } from '@/components/types'
import { db } from '@/config/firebase'

type QuantityProps = {
  id: string
  quantity: number
}

type AddToCartProps = {
  userId: string
  productId: string
}

type AddCartProps = Pick<CartType, 'userId' | 'data' | 'totalPrice'>

const INITIAL_STATE: CartType = {
  userId: '',
  data: [],
  totalPrice: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    addToCart: (state, { payload }: PayloadAction<AddToCartProps>) => {
      const existProductCart = state.data.find(
        (prod) => prod.id === payload.productId,
      )

      const newCartProduct = {
        id: payload.productId,
        quantity: 1,
      }

      const newCart: AddCartProps = {
        userId: payload.userId,
        data: [...state.data, newCartProduct],
        totalPrice: 0,
      }

      const updatedCart = state.data.map((item) =>
        item.id === payload.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )

      const addProductToCart = async () => {
        const cartRef = doc(db, 'carts', payload.userId)

        if (state.data.length === 0) {
          console.log('create')
          await setDoc(cartRef, newCart)
        } else {
          console.log(state)
          toasts.warn({ title: 'Não adicionou' })
          await updateDoc(cartRef, { data: updatedCart })
        }
      }

      if (existProductCart) {
        toasts.warn({ title: 'Produto já esta no carinho' })

        return {
          userId: payload.userId,
          data: updatedCart,
          totalPrice: state.totalPrice,
        }
      } else {
        addProductToCart()
        state = newCart
      }
    },
    removeToCart: (state, { payload }: PayloadAction<{ id: string }>) => {
      const index = state.data.findIndex((item) => item.id === payload.id)
      state.data.splice(index, 1)
    },
    handleQuantity: (state, { payload }: PayloadAction<QuantityProps>) => {
      state.data.map((itemCart) => {
        if (itemCart.id === payload.id) itemCart.quantity += payload.quantity
        return itemCart
      })
    },
    cartCheckout: (state, { payload }: PayloadAction<CartType>) => {
      const createCartCheckout = async () => {
        const cartRef = collection(db, 'carts', payload.userId, 'finish-cart')
        await addDoc(cartRef, payload)
      }

      if (payload.data.length === 0 || state.data.length === 0) {
        toasts.warn({ title: 'Não foi possível finaliza a compra ' })
        console.log('não foi')
      } else {
        console.log('chegou')
        createCartCheckout()
      }
    },
    getCart: (_, { payload }: PayloadAction<CartType>) => {
      console.log(payload)
      return payload
    },
    resetCart: () => INITIAL_STATE,
  },
})

export const {
  addToCart,
  removeToCart,
  getCart,
  handleQuantity,
  cartCheckout,
} = cartSlice.actions
export const cartReducer = cartSlice.reducer
