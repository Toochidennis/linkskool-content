import type { Course } from "./course";

export interface Program {
  id?: number;
  name: string;
  description?: string;
  courses: Course[];

}
