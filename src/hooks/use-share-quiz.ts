import { useState, useCallback } from "react";
import type { HistoryItem } from "@/api/getHistory";

// 훅이 받을 콜백 함수의 타입을 정의합니다.
// (이 타입은 이제 이 파일에서 사용되지 않지만, 참조용으로 남겨둘 수 있습니다.
// 혹은 부모 컴포넌트로 옮겨도 됩니다.)
export type QuizUpdateCallback = (
  quizId: string,
  isShared: boolean,
  sharedToken: string | null
) => void;

/**
 * 퀴즈 공유 다이얼로그의 상태와 로직을 관리하는 커스텀 훅.
 * JSX 렌더링을 직접 반환하지 않아 TypeScript 모듈 규칙과 호환됩니다.
 */
export function useShareQuiz() {
  // 1. 다이얼로그를 열기 위해 현재 선택된 퀴즈를 관리하는 state
  const [sharingQuiz, setSharingQuiz] = useState<HistoryItem | null>(null);

  // 2. 다이얼로그를 여는 함수 (이 함수를 버튼의 onClick에 연결)
  const openShareDialog = useCallback((quiz: HistoryItem) => {
    setSharingQuiz(quiz);
  }, []);

  // 3. 다이얼로그를 닫는 함수 (부모가 ShareDialog에 prop으로 전달)
  const closeShareDialog = useCallback(() => {
    setSharingQuiz(null);
  }, []);

  // 4. 훅의 결과물로, 상태와 핸들러를 반환합니다.
  return {
    sharingQuiz,
    openShareDialog,
    closeShareDialog,
  };
}
