import { Toaster } from "sonner";
import Home from "./pages/Home";

function App() {
  return (
    <>
      {/* 메인 페이지인 Home을 보여줍니다 */}
      <Home />

      {/* 프로젝트 어디서든 알림창(Toast)을 쓸 수 있도록 설정합니다 */}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}

export default App;
