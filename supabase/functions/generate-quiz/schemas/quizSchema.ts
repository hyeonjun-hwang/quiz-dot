// schemas/quizSchema.ts
import { z } from "zod";

// 퀴즈 문제 하나에 대한 스키마
const quizItemSchema = z.object({
  id: z.number().describe("문제 번호 (1부터 시작)"),
  question: z.string().describe("퀴즈 문제 내용"),
  // 객관식일 때만 값이 있고, 나머지는 빈 배열이거나 null이어야 함
  options: z.array(z.string()).optional().describe("객관식 보기 (4~5개). OX나 단답형은 빈 배열"),
  answer: z.string().describe("정답 텍스트 (OX는 'O' 또는 'X')"),
  explanation: z.string().describe("정답에 대한 상세 해설 및 근거"),
});

// 전체 응답 스키마
export const quizResponseSchema = z.object({
  summary: z.string().describe("입력된 학습 자료의 3줄 핵심 요약"),
  quizzes: z.array(quizItemSchema).describe("생성된 퀴즈 리스트"),
});