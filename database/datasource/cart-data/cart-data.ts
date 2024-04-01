import { doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { DBFactory } from '../../db-factory'
import { COLLECTIONS } from '../../types'
import { CartRepository } from '../../../domain/cart'

interface ICartUserSaved extends CartRepository {
  id: string
}

export class CartData {
  private database = DBFactory.database()

  async getCartByUserId(userId: string) {
    const snapCart = await getDoc(
      doc(this.database.getDB(), COLLECTIONS.CARTS, userId),
    )
    const cart = snapCart.data() as CartRepository

    return cart
  }

  async getCartByUserIdSaved(userId: string) {
    const userCartList: ICartUserSaved[] = []

    const userCartRef = this.database.collection({
      path: COLLECTIONS.USERS,
      id: userId,
      collections: COLLECTIONS.CARTS,
    })

    const queryUserCart = await getDocs(
      query(userCartRef, where('userId', '==', userId)),
    )

    queryUserCart.forEach((doc) => {
      userCartList.push({
        id: doc.id,
        cart: doc.data().data,
        totalPrice: doc.data().totalPrice,
        userId: doc.data().userId,
      } as ICartUserSaved)
    })

    return userCartList
  }
}