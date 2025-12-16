export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-primary tracking-tight">QUIZ</span>
      <div className="relative inline-flex items-center justify-center">
        <div 
          className="w-[0.65em] h-[0.65em] rounded-full"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
          }}
        />
      </div>
    </div>
  );
}