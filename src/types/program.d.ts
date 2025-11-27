export class Program {
  id?: number
  name!: string
  description?: string
  courses!: Course[]

  constructor(init?: Partial<Program>) {
    Object.assign(this, init)
  }
}
