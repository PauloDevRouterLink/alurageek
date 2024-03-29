/* eslint-disable @typescript-eslint/no-explicit-any */
import { call, cancel, put, takeLatest } from 'redux-saga/effects'
import { getUserLogged } from '@/store/reducers'
import { toasts } from '@/components/ui'
import { loadUser } from '@/store/actions/actions'
import { UsersProps } from '@/components/types'
import { UserUseCase } from '../../../../domain/user'

const usersService = new UserUseCase()

function* useAuthentication(action: any) {
  const userId = action.payload! as string

  try {
    const userOnAuth: UsersProps = yield call(usersService.userById, userId)

    const user = {
      id: userId,
      username: userOnAuth.username,
      email: userOnAuth.email,
      password: userOnAuth.password,
      photoUrl: userOnAuth.photoUrl,
    } satisfies UsersProps

    yield put(getUserLogged({ user, isLogged: true }))
  } catch (error) {
    yield put(getUserLogged({ user: {} as UsersProps, isLogged: false }))
    toasts.error({ title: 'erro' })
  }
}

export function* userLoggedSaga(): any {
  const taskUser = yield takeLatest(loadUser, useAuthentication)
  yield takeLatest(getUserLogged, () => cancel(taskUser))
}
