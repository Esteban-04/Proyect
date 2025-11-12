import React, { useState, useEffect } from 'react';

const codeSnippets = [
  'const x = 10;',
  'if (err) throw err;',
  'console.log("init");',
  'return <App />;',
  'const [count, setCount] = useState(0);',
  'import React from "react";',
  'const API_URL = process.env.API_URL;',
  'function fetchData() { ... }',
  'a.map(i => i * 2);',
  '.container { display: flex; }',
  'z-index: 10;',
  'type User = { id: string; }',
  'await fetch(url);',
  'Promise.all([...]);',
  'background-color: #0d1a2e;',
  'opacity: 0.5;',
];

interface Snippet {
  id: number;
  code: string;
  top: string;
  left: string;
  opacity: number;
  fontSize: string;
  animationDuration: string;
}

const CodeBackground: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    const generatedSnippets: Snippet[] = [];
    const snippetCount = 50; // Adjust for density

    for (let i = 0; i < snippetCount; i++) {
      generatedSnippets.push({
        id: i,
        code: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.2 + 0.1, // Faint opacity
        fontSize: `${Math.random() * 8 + 8}px`, // Small font sizes
        animationDuration: `${Math.random() * 20 + 15}s`,
      });
    }
    setSnippets(generatedSnippets);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {snippets.map((snippet) => (
        <pre
          key={snippet.id}
          className="text-cyan-200 font-mono absolute animate-pulse"
          style={{
            top: snippet.top,
            left: snippet.left,
            opacity: snippet.opacity,
            fontSize: snippet.fontSize,
            animationDuration: snippet.animationDuration,
            textShadow: '0 0 5px rgba(100, 200, 255, 0.5)',
            transform: 'translateX(-50%) translateY(-50%)',
          }}
        >
          {snippet.code}
        </pre>
      ))}
    </div>
  );
};

export default CodeBackground;