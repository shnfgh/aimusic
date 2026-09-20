import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { CreatePanel } from './components/editor/CreatePanel';
import { Timeline } from './components/timeline/Timeline';
import { PlayerBar } from './components/player/PlayerBar';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import { GenerationProgress } from './components/progress/GenerationProgress';
import { useStudioStore } from './stores/useStudioStore';
import { getAudioEngine } from './audio/AudioEngine';

const App: React.FC = () => {
  const {
    state,
    setPrompt,
    setLyrics,
    setParameters,
    setActiveTab,
    setSelectedSection,
    toggleAutoSuggest,
    applyLyricsSuggestion,
    generateMusic,
    cancelGeneration,
    toggleTrackMute,
    toggleTrackSolo,
    setTrackVolume,
    exportProjectJSON,
    removeSection,
    addSection,
  } = useStudioStore();

  const engine = getAudioEngine();

  const handlePlay = () => {
    engine.play();
  };

  const handlePause = () => {
    engine.pause();
  };

  const handleSeek = (time: number) => {
    engine.seek(time);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={state.activeTab}
          onTabChange={setActiveTab}
          hasProject={!!state.project}
        />

        {/* Center Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top: Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {state.activeTab === 'create' && (
                <CreatePanel
                  prompt={state.prompt}
                  lyrics={state.lyrics}
                  parameters={state.parameters}
                  isGenerating={state.isGenerating}
                  lyricsAnalysis={state.lyricsAnalysis}
                  autoSuggestEnabled={state.autoSuggestEnabled}
                  onPromptChange={setPrompt}
                  onLyricsChange={setLyrics}
                  onParametersChange={setParameters}
                  onGenerate={generateMusic}
                  onApplySuggestion={applyLyricsSuggestion}
                  onToggleAutoSuggest={toggleAutoSuggest}
                />
              )}

              {state.activeTab === 'edit' && !state.project && (
                <WelcomeScreen onGoToCreate={() => setActiveTab('create')} />
              )}

              {state.activeTab === 'edit' && state.project && (
                <div className="flex-1 overflow-y-auto p-6 animate-slide-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    🎵 {state.project.title}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Prompt Display */}
                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 border border-[var(--border-color)]">
                      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Prompt</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{state.project.prompt}</p>
                    </div>

                    {/* Lyrics Display */}
                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 border border-[var(--border-color)]">
                      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Lyrics</h3>
                      <p className="text-sm text-[var(--text-secondary)] font-mono whitespace-pre-wrap">
                        {state.project.lyrics || 'No lyrics provided'}
                      </p>
                    </div>

                    {/* Parameters */}
                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 border border-[var(--border-color)]">
                      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Parameters</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <InfoItem label="Genre" value={state.project.parameters.genre} />
                        <InfoItem label="Mood" value={state.project.parameters.mood} />
                        <InfoItem label="BPM" value={String(state.project.parameters.bpm)} />
                        <InfoItem label="Key" value={`${state.project.parameters.key} ${state.project.parameters.scale}`} />
                        <InfoItem label="Vocals" value={`${state.project.parameters.vocalGender} / ${state.project.parameters.vocalStyle}`} />
                        <InfoItem label="Language" value={state.project.parameters.language} />
                      </div>
                    </div>

                    {/* Tracks */}
                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 border border-[var(--border-color)]">
                      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Tracks ({state.project.tracks.length})</h3>
                      <div className="space-y-2">
                        {state.project.tracks.map((track) => (
                          <div key={track.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: track.color }} />
                            <span className="text-xs text-[var(--text-primary)] flex-1">{track.name}</span>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={track.volume}
                              onChange={(e) => setTrackVolume(track.id, Number(e.target.value))}
                              className="w-16"
                            />
                            <button
                              onClick={() => toggleTrackMute(track.id)}
                              className={`w-5 h-5 rounded text-[9px] font-bold ${track.muted ? 'bg-red-900/50 text-red-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
                            >
                              M
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state.activeTab === 'mix' && state.project && (
                <div className="flex-1 overflow-y-auto p-6 animate-slide-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">🎛️ Mix Console</h2>
                  <div className="flex gap-4 flex-wrap">
                    {state.project.tracks.map((track) => (
                      <div key={track.id} className="w-24 bg-[var(--bg-tertiary)] rounded-xl p-3 border border-[var(--border-color)] flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: track.color + '30', border: `2px solid ${track.color}` }}>
                          <span className="text-xs">{track.name.charAt(0)}</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)]">{track.name}</span>
                        {/* Fader */}
                        <div className="w-full h-24 bg-[var(--bg-primary)] rounded relative flex items-end justify-center">
                          <div
                            className="w-full rounded-b transition-all"
                            style={{
                              height: `${track.volume * 100}%`,
                              backgroundColor: track.color + '60',
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={track.volume}
                          onChange={(e) => setTrackVolume(track.id, Number(e.target.value))}
                          className="w-full"
                        />
                        {/* Pan */}
                        <div className="w-full">
                          <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.1}
                            value={track.pan}
                            onChange={(e) => {
                              const pan = Number(e.target.value);
                              // Update pan in state would go here
                            }}
                            className="w-full"
                          />
                          <div className="flex justify-between text-[8px] text-[var(--text-muted)]">
                            <span>L</span>
                            <span>C</span>
                            <span>R</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleTrackMute(track.id)}
                            className={`w-6 h-6 rounded text-[9px] font-bold ${track.muted ? 'bg-red-900/50 text-red-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
                          >
                            M
                          </button>
                          <button
                            onClick={() => toggleTrackSolo(track.id)}
                            className={`w-6 h-6 rounded text-[9px] font-bold ${track.solo ? 'bg-yellow-900/50 text-yellow-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
                          >
                            S
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state.activeTab === 'export' && state.project && (
                <div className="flex-1 overflow-y-auto p-6 animate-slide-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">📦 Export</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <ExportCard format="WAV" description="Lossless audio, best quality" size="~50 MB" icon="🎵" />
                    <ExportCard format="MP3" description="Compressed, widely compatible" size="~8 MB" icon="🎶" />
                    <ExportCard format="FLAC" description="Lossless compressed" size="~30 MB" icon="💿" />
                    <ExportCard format="Stems (ZIP)" description="Individual track files" size="~120 MB" icon="📁" />
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={exportProjectJSON}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 transition-all"
                    >
                      📦 Export Project JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Inspector */}
            <InspectorPanel
              project={state.project}
              selectedSectionId={state.selectedSectionId}
              onSelectSection={setSelectedSection}
              onRemoveSection={removeSection}
              onAddSection={addSection}
              onExportJSON={exportProjectJSON}
            />
          </div>

          {/* Timeline */}
          {state.project && (
            <div className="h-64 flex-shrink-0">
              <Timeline
                project={state.project}
                currentTime={state.audioState.currentTime}
                duration={state.audioState.duration}
                isPlaying={state.audioState.isPlaying}
                selectedSectionId={state.selectedSectionId}
                onSeek={handleSeek}
                onSelectSection={setSelectedSection}
                onToggleMute={toggleTrackMute}
                onToggleSolo={toggleTrackSolo}
                onTrackVolumeChange={setTrackVolume}
                onRemoveSection={removeSection}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Player */}
      <PlayerBar
        isPlaying={state.audioState.isPlaying}
        currentTime={state.audioState.currentTime}
        duration={state.audioState.duration}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />

      {/* Generation Progress Modal */}
      {state.isGenerating && (
        <GenerationProgress
          status={state.generationStatus}
          progress={state.generationProgress}
          onCancel={cancelGeneration}
        />
      )}
    </div>
  );
};

// Helper Components
const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-1 border-b border-[var(--border-color)]/50">
    <span className="text-[var(--text-muted)]">{label}</span>
    <span className="text-[var(--text-primary)] capitalize">{value}</span>
  </div>
);

const ExportCard: React.FC<{ format: string; description: string; size: string; icon: string }> = ({ format, description, size, icon }) => (
  <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">{format}</h4>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">{size}</span>
    </div>
  </div>
);

const WelcomeScreen: React.FC<{ onGoToCreate: () => void }> = ({ onGoToCreate }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-lg animate-slide-up">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-900/40">
        <span className="text-3xl">🎵</span>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome to FARQAR AI Music Studio</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Create professional music with AI. Describe your vision, write lyrics, and let our AI generate complete tracks with vocals, instruments, and production.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <FeatureCard icon="✨" title="AI Generate" desc="Create from prompt" />
        <FeatureCard icon="🎛️" title="Mix & Master" desc="Professional tools" />
        <FeatureCard icon="📦" title="Export" desc="WAV, MP3, FLAC" />
      </div>
      <button
        onClick={onGoToCreate}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all hover:scale-105"
      >
        Start Creating →
      </button>
    </div>
  </div>
);

const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 border border-[var(--border-color)]">
    <span className="text-xl">{icon}</span>
    <h4 className="text-xs font-medium text-[var(--text-primary)] mt-1">{title}</h4>
    <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
  </div>
);

export default App;
