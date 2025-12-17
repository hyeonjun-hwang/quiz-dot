import { motion } from "framer-motion";
import { Sparkles, FileText, Zap } from "lucide-react";

export function QuizGeneratingLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* 로고 */}
      <div className="mb-8">
        <h1 className="text-3xl">
          <span>QUIZ</span>
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ml-0.5 mb-2"></span>
        </h1>
      </div>

      {/* 메인 애니메이션 영역 */}
      <div className="relative mb-8">
        {/* 중앙 아이콘 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* 주변 원형 아이콘들 */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2"
            style={{
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              rotate: [index * 120, index * 120 + 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              style={{
                transform: `translateY(-80px)`,
              }}
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut",
              }}
              className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center"
            >
              {index === 0 && <FileText className="w-5 h-5 text-blue-600" />}
              {index === 1 && <Zap className="w-5 h-5 text-blue-600" />}
              {index === 2 && <Sparkles className="w-5 h-5 text-blue-600" />}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* 텍스트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl mb-2">퀴즈 생성 중</h2>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          AI가 맞춤형 퀴즈를 생성하고 있어요...
        </motion.p>
      </motion.div>

      {/* 진행 단계 표시 */}
      <div className="mt-8 space-y-3 w-full max-w-sm">
        {["자료 분석 중", "문제 생성 중", "최적화 중"].map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.3 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                backgroundColor: ["#93c5fd", "#60a5fa", "#93c5fd"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.5,
              }}
              className="w-2 h-2 rounded-full bg-blue-300"
            />
            <span className="text-sm text-muted-foreground">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
