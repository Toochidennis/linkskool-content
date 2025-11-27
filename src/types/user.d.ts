export class User {
  id?: number
  name!: string
  username!: string
  password!: string
  email?: string
  role!: string = 'user' | 'admin'
  permissions?: string[]

  constructor(init?: Partial<User>) {
    Object.assign(this, init)
  }
}
