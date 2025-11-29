import { BaseService } from "./baseService";
import * as type from "@/api/models";

const serviceFactory = <T, D = Record<string, unknown>>(endpoint: string) =>
  new BaseService<T, D>(endpoint);

export const userService = serviceFactory<type.User>("users");
export const courseService = serviceFactory<type.Course>("courses");
export const programService = serviceFactory<type.Program>("exam-types");
export const questionService = serviceFactory<type.QuestionPayload>("questions");
