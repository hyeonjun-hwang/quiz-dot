import { motion } from "framer-motion";
import { FileText, Brain, CheckCircle2 } from "lucide-react";

export function SummaryLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      {/* 로고 */}
      <div className="mb-8">
        <h1 className="text-3xl">
          <span>QUIZ</span>
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ml-0.5 mb-2"></span>
        </h1>
      </div>

      {/* 메인 애니메이션 영역 */}
      <div className="relative mb-8">
        {/* 문서 아이콘 (왼쪽) */}
        <motion.div
          animate={{
            x: [0, 10, 0],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20"
        >
          <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        {/* 중앙 뇌 아이콘 */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
          
          {/* 펄스 효과 */}
          <motion.div
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"
          />
        </motion.div>

        {/* 요약 아이콘 (오른쪽) */}
        <motion.div
          animate={{
            x: [0, -10, 0],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20"
        >
          <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        {/* 연결 라인 애니메이션 */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 -z-10">
          <motion.line
            x1="0"
            y1="1"
            x2="256"
            y2="1"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray="10 5"
            animate={{
              strokeDashoffset: [0, -15],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 텍스트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-12"
      >
        <h2 className="text-2xl mb-2">요약 중</h2>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          AI가 핵심 내용을 분석하고 있어요...
        </motion.p>
      </motion.div>

      {/* 진행 바 */}
      <div className="mt-8 w-full max-w-sm">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: "50%" }}
          />
        </div>
        
        {/* 처리 단계 */}
        <div className="mt-6 space-y-2">
          {["문서 읽기", "핵심 내용 추출", "요약 생성"].map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  backgroundColor: ["#c084fc", "#a855f7", "#c084fc"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                className="w-2 h-2 rounded-full bg-purple-300"
              />
              <span className="text-sm text-muted-foreground">{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
