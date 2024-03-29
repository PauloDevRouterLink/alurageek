import { SignInProps } from '@/pages/authentication/modules/sign-in/useSignIn'
import { SignUpProps } from '@/pages/authentication/modules/sign-up/useSignUp'

type UsersProps = SignInProps &
  Pick<SignUpProps, 'username' | 'photoUrl'> & {
    id: string
  }

type UserType = {
  user: UsersProps
  isLogged: boolean
}

export type { UsersProps, UserType }
