import { Button } from "./components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";

function App() {
  return (
    <>
      {/* 테스트용 임시 코드 */}
      <div>APP 화면</div>
      <p>코드 수정1</p>
      <p>코드 수정2</p>
      <p>코드 수정3</p>
      <p>코드 수정4</p>
      <Button>임시 버튼 테스트</Button>
      <Accordion type="single" collapsible className="w-fit">
        <AccordionItem value="item-1">
          <AccordionTrigger>아코디언 테스트</AccordionTrigger>
          <AccordionContent>열었다 닫았다 가능해요</AccordionContent>
        </AccordionItem>
      </Accordion>
      <p>깃허브 업로드 테스트</p>
    </>
  );
}

export default App;
