import { BaseService } from "./baseService";
import * as type from "@/api/models";

const serviceFactory = <T, D = Record<string, unknown>>(endpoint: string) =>
  new BaseService<T, D>(endpoint);

interface StudyCourseTopic {
  topicId: number;
  topicName: string;
  courseId: number;
  courseName: string;
  categoryId?: number;
}

interface StudyExamTypeTopic {
  id: number;
  topicId: number;
  topicName: string;
}

interface StudyTopicAssignmentPayload {
  courseId: number;
  topicIds: number[];
}

export const userService = serviceFactory<type.User[]>("users");
export const courseService = serviceFactory<type.Course>("courses");
export const examTypeService = serviceFactory<type.ExamType>("exam-types");
export const questionService = serviceFactory<any>("questions");
export const examService = serviceFactory<any>("exams");
export const settingsService = serviceFactory<type.Settings>("settings");
export const dashboardService = serviceFactory<type.DashboardMetric>("dashboard");
export const activityLogService = serviceFactory<type.PaginatedResponse<type.ActivityLog>>("activity-logs");
export const assessmentService = serviceFactory<any[]>("cbt/exams");
export const newsService = serviceFactory<any>("news");
export const advertisementService = serviceFactory<any>("advertisements");
export const videoLibraryService = serviceFactory<any>("video-library");
export const levelService = serviceFactory<any>("levels");
export const programService = serviceFactory<any>("learn/programs");
export const learningCourseService = serviceFactory<any>("learn/courses");
export const lessonSubmissionService = serviceFactory<any>("learn/lessons");
export const faqsService = serviceFactory<type.Faq>("faqs");
export const notificationService = serviceFactory<any>("notifications");
export const cbtUpdateService = serviceFactory<any>("cbt-updates");
export const cbtUpdate = cbtUpdateService;

const studyBaseService = serviceFactory<any>('cbt/study');

export const studyService = Object.assign(studyBaseService, {
  getCourseTopics: (courseId: number | string) =>
    studyBaseService.get<StudyCourseTopic[]>(`courses/${courseId}/topics`),
  getExamTypeTopics: (examTypeId: number | string) =>
    studyBaseService.get<StudyExamTypeTopic[]>(`exam-types/${examTypeId}/topics`),
  saveExamTypeTopics: (examTypeId: number | string, data: StudyTopicAssignmentPayload) =>
    studyBaseService.post(`exam-types/${examTypeId}/topics`, data as unknown as Record<string, unknown>),
});
