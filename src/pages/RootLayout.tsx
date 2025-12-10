import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function RootLayout() {
  return (
    <div>
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
