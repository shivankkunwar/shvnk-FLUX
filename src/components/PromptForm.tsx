import React, { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useHealth } from '../contexts/HealthContext';

interface PromptFormProps {
  onSubmit: (prompt: string, engine: 'p5' | 'manim', duration: number) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit }) => {
  const { apiKey, setApiKey } = useApiKey();
  const { p5, manim } = useHealth();
  const [prompt, setPrompt] = useState('');
  const [engine, setEngine] = useState<'p5' | 'manim'>('p5');
  const [duration, setDuration] = useState<number>(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, engine, duration);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 shimmer-border p-4 mb-8 bg-gray-800 rounded">
      <div>
        <label className="block text-gray-300 mb-1">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200"
          placeholder="Enter your Gemini API key"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-1">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200"
          rows={3}
          placeholder="Describe the animation you want..."
          required
        />
      </div>

      <div>
        <span className="block text-gray-300 mb-1">Engine</span>
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            name="engine"
            value="p5"
            checked={engine === 'p5'}
            onChange={() => setEngine('p5')}
            className="form-radio"
            disabled={!p5}
          />
          <span className="ml-2 text-gray-200">p5.js</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="engine"
            value="manim"
            checked={engine === 'manim'}
            onChange={() => setEngine('manim')}
            className="form-radio"
            disabled={!manim}
          />
          <span className="ml-2 text-gray-200">
            Manim {!manim && '(install Python & Manim)'}
          </span>
        </label>
      </div>

      {engine === 'p5' && (
        <div>
          <label className="block text-gray-300 mb-1">Duration (seconds)</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!prompt || !apiKey}
        className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400 disabled:opacity-50"
      >
        Generate Video
      </button>
    </form>
  );
};

export default PromptForm; 