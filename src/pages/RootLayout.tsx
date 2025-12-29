import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/common/Header";
import { useState } from "react";
import { SideMenu } from "@/components/common/SideMenu";
function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      {/* 토스터 */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export { RootLayout };
