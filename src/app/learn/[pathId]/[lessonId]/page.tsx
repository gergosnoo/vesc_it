'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LEARNING_PATHS } from '@/lib/learning/learningPaths';

export default function LessonPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const path = LEARNING_PATHS.find(p => p.id === pathId);
  const lesson = path?.lessons.find(l => l.id === lessonId);
  const lessonIndex = path?.lessons.findIndex(l => l.id === lessonId) ?? 0;

  if (!path || !lesson) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Link href="/learn" className="text-blue-400 hover:underline">
            ← Back to Learning Center
          </Link>
        </div>
      </main>
    );
  }

  const step = lesson.steps[currentStep];
  const isLastStep = currentStep === lesson.steps.length - 1;
  const nextLesson = path.lessons[lessonIndex + 1];

  const handleQuizAnswer = (index: number) => {
    setQuizAnswer(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastStep) return;
    setCurrentStep(currentStep + 1);
    setQuizAnswer(null);
    setShowExplanation(false);
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    setCurrentStep(currentStep - 1);
    setQuizAnswer(null);
    setShowExplanation(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Progress Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/learn" className="text-gray-400 hover:text-white text-sm">
              ← {path.title}
            </Link>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {lesson.steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / lesson.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="text-3xl">{lesson.icon}</span>
          <h1 className="text-2xl font-bold mt-2">{lesson.title}</h1>
          <p className="text-gray-400">{lesson.description}</p>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 min-h-[300px]">
          <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

          {step.type === 'text' && (
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
              {step.content.split('\n').map((line, i) => {
                // Handle markdown-style formatting
                if (line.startsWith('|')) {
                  // Table row
                  const cells = line.split('|').filter(c => c.trim());
                  return (
                    <div key={i} className="grid grid-cols-2 gap-2 py-1 border-b border-gray-700">
                      {cells.map((cell, j) => (
                        <span key={j} className={j === 0 ? 'font-medium' : ''}>{cell.trim()}</span>
                      ))}
                    </div>
                  );
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  // Bold line
                  return <p key={i} className="font-bold text-white mt-4">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                // Regular text with inline bold
                const parts = line.split(/(\*\*[^*]+\*\*)/);
                return (
                  <p key={i} className="my-2">
                    {parts.map((part, j) =>
                      part.startsWith('**') ?
                        <strong key={j} className="text-white">{part.replace(/\*\*/g, '')}</strong> :
                        part
                    )}
                  </p>
                );
              })}
            </div>
          )}

          {step.type === 'quiz' && step.quizQuestion && (
            <div>
              <p className="text-lg mb-4">{step.quizQuestion.question}</p>
              <div className="space-y-3">
                {step.quizQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    disabled={showExplanation}
                    className={`
                      w-full text-left p-4 rounded-lg transition-all
                      ${quizAnswer === index
                        ? index === step.quizQuestion!.correctIndex
                          ? 'bg-green-600 border-green-500'
                          : 'bg-red-600 border-red-500'
                        : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }
                      border-2
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showExplanation && (
                <div className={`mt-4 p-4 rounded-lg ${
                  quizAnswer === step.quizQuestion.correctIndex
                    ? 'bg-green-900/50 border border-green-700'
                    : 'bg-red-900/50 border border-red-700'
                }`}>
                  <p className="font-semibold mb-2">
                    {quizAnswer === step.quizQuestion.correctIndex ? '✅ Correct!' : '❌ Not quite'}
                  </p>
                  <p className="text-gray-300">{step.quizQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}

          {step.tips && step.tips.length > 0 && (
            <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">💡 Tips</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {step.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            ← Previous
          </button>

          {isLastStep ? (
            nextLesson ? (
              <Link
                href={`/learn/${pathId}/${nextLesson.id}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Next Lesson: {nextLesson.title} →
              </Link>
            ) : (
              <Link
                href="/learn"
                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                🎉 Complete Path
              </Link>
            )
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
