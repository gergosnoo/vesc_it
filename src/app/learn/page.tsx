'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LEARNING_PATHS } from '@/lib/learning/learningPaths';

export default function LearnPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
            ← Back to Chat
          </Link>
          <h1 className="text-4xl font-bold mb-4">📚 VESC Learning Center</h1>
          <p className="text-gray-400 text-lg">
            Choose your path based on your experience level
          </p>
        </div>

        {/* Learning Path Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {LEARNING_PATHS.map((path) => (
            <div
              key={path.id}
              onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
              className={`
                bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-300
                border-2 ${selectedPath === path.id ? 'border-blue-500 scale-105' : 'border-gray-700 hover:border-gray-600'}
              `}
            >
              <div className="text-4xl mb-4">{path.icon}</div>
              <h2 className="text-xl font-bold mb-2">{path.title}</h2>
              <p className="text-gray-400 text-sm mb-4">{path.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">⏱️ {path.estimatedTime}</span>
                <span className="text-gray-500">{path.lessons.length} lessons</span>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">{path.targetAudience}</p>
            </div>
          ))}
        </div>

        {/* Expanded Path View */}
        {selectedPath && (
          <div className="bg-gray-800 rounded-xl p-8 mb-8">
            {LEARNING_PATHS.filter(p => p.id === selectedPath).map(path => (
              <div key={path.id}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{path.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{path.title}</h2>
                    <p className="text-gray-400">{path.description}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-300">📖 Lessons</h3>
                <div className="space-y-3">
                  {path.lessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${path.id}/${lesson.id}`}
                      className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{lesson.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                              {index + 1}/{path.lessons.length}
                            </span>
                            <h4 className="font-semibold">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-gray-400">{lesson.description}</p>
                        </div>
                        <span className="text-sm text-gray-500">⏱️ {lesson.duration}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors">
            💬 Chat with AI
          </Link>
          <Link href="/playground" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors">
            🎮 Playground
          </Link>
          <Link href="/safety" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors">
            🛡️ Safety Simulator
          </Link>
          <Link href="/troubleshoot" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors">
            🔧 Troubleshoot
          </Link>
        </div>
      </div>
    </main>
  );
}
