import type { Course } from "./course";

export interface Program {
  id: number;
  name: string;
  shortname: string;
  expanded?: boolean ;
  courses: Course[];
  isActive: number;
  displayOrder?: number;
}
