import { Outlet } from "react-router";
import { Header } from "@/components/common/Header";
import { useEffect, useState } from "react";
import { SideMenu } from "@/components/common/SideMenu";
// 전역 상태 관리를 위한 스토어
import { useAuthStore } from "@/stores/auth";
import { useSubscriptionStore } from "@/stores/subscription";
function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. 유저 정보와 구독 정보 동기화 함수 가져오기
  const { user } = useAuthStore();
  const { fetchSubscription } = useSubscriptionStore();
  // 유저 정보가 변경될 때마다 구독 정보 동기화
  useEffect(() => {
    if (user) {
      fetchSubscription(); // 로그인 상태가 감지되면 DB에서 최신 Pro/Free 상태를 가져옴
    }
  }, [user, fetchSubscription]); // user 정보가 바뀔 때마다 실행

  // 2. 유저 정보가 변경될 때마다 구독 정보 동기화
  return (
    <div>
      {/* 헤더: 메뉴 버튼 클릭 시 사이드바 열림 상태로 변경 */}
      <Header onMenuClick={() => setIsMenuOpen(true)} />

      {/* 사이드 메뉴: 상태값과 닫기 함수만 전달 (데이터는 SideMenu가 직접 스토어에서 조회) */}
      <SideMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* 메인 */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export { RootLayout };
