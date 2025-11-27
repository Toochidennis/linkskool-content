export class Course {
  id?: number
  title!: string
  description?: string
  syllabusId!: number
  topics?: Topic[]

  constructor(init?: Partial<Course>) {
    Object.assign(this, init)
  }
}
