import { Menu } from "lucide-react";

import { Button } from "./ui/button";

import { Logo } from "./Logo";

interface HeaderProps {
  onMenuClick: () => void;
  showMenu?: boolean;
}

export function Header({ onMenuClick, showMenu = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4">
        <Logo className="text-xl" />

        {showMenu && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        )}
      </div>
    </header>
  );
}
