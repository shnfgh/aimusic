import React, { useState } from 'react';
import { MusicSynthesizer } from '../../audio/MusicSynthesizer';
import { getAudioEngine } from '../../audio/AudioEngine';

export const AudioTest: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const testGenerate = async () => {
    setIsGenerating(true);
    setLogs([]);
    
    try {
      addLog('Starting test generation...');
      
      const synthesizer = new MusicSynthesizer({
        key: 'C',
        scale: 'minor',
        bpm: 120,
        mood: 'sad',
        genre: 'pop',
        duration: 10, // 10 seconds for quick test
      });

      addLog('Rendering audio (this may take a few seconds)...');
      const audioBuffer = await synthesizer.render();
      addLog(`Audio rendered! Duration: ${audioBuffer.duration}s, Channels: ${audioBuffer.numberOfChannels}`);
      
      addLog('Converting to WAV...');
      const wavBlob = MusicSynthesizer.bufferToWav(audioBuffer);
      addLog(`WAV blob created! Size: ${(wavBlob.size / 1024).toFixed(2)} KB`);
      
      const url = URL.createObjectURL(wavBlob);
      addLog(`Audio URL created: ${url.substring(0, 50)}...`);
      
      setAudioUrl(url);
      addLog('✅ Test complete! Click Play to listen.');
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      console.error('Test generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const testPlay = () => {
    if (!audioUrl) return;
    
    addLog('Loading audio into engine...');
    const engine = getAudioEngine();
    engine.loadAudioUrl(audioUrl);
    
    setTimeout(() => {
      addLog('Playing audio...');
      engine.play();
    }, 500);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 shadow-2xl w-80">
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">🧪 Audio Test Panel</h3>
      
      <div className="space-y-2">
        <button
          onClick={testGenerate}
          disabled={isGenerating}
          className="w-full py-2 px-3 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : '1. Generate Test Audio (10s)'}
        </button>

        {audioUrl && (
          <button
            onClick={testPlay}
            className="w-full py-2 px-3 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors"
          >
            2. Play Generated Audio
          </button>
        )}

        {audioUrl && (
          <audio controls src={audioUrl} className="w-full h-8" />
        )}
      </div>

      <div className="mt-3 max-h-40 overflow-y-auto bg-[var(--bg-primary)] rounded-lg p-2">
        <p className="text-[10px] text-[var(--text-muted)] mb-1">Console Logs:</p>
        {logs.map((log, i) => (
          <p key={i} className="text-[10px] text-[var(--text-secondary)] font-mono">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};
