import React, { useState } from 'react';
import { DEFAULT_AUREOAMP_TRACKS } from '../../game/tycoonAdvancedEngine';

interface AureoAmpWindowProps {
  onClose: () => void;
}

export const AureoAmpWindow: React.FC<AureoAmpWindowProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackSec, setPlaybackSec] = useState(42);

  const tracks = DEFAULT_AUREOAMP_TRACKS;
  const currentTrack = tracks[currentTrackIdx];

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIdx((currentTrackIdx + 1) % tracks.length);
    setPlaybackSec(0);
  };

  const handlePrev = () => {
    setCurrentTrackIdx((currentTrackIdx - 1 + tracks.length) % tracks.length);
    setPlaybackSec(0);
  };

  return (
    <div className="flex flex-col w-80 bg-[#282828] text-[#00ff00] font-mono select-none border-2 border-t-[#666] border-l-[#666] border-b-black border-r-black p-1 shadow-2xl">
      {/* Title Bar Winamp Style */}
      <div className="bg-gradient-to-r from-[#000066] to-[#0033cc] text-white px-2 py-0.5 text-[10px] font-bold flex justify-between items-center cursor-move">
        <span className="flex items-center gap-1">
          <span>⚡</span>
          <span>ÁUREO-AMP 2000 PRO</span>
        </span>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white font-bold px-1"
        >
          ✕
        </button>
      </div>

      {/* Main Winamp Face */}
      <div className="p-2 bg-[#191919] border border-[#333] space-y-2 mt-1">
        {/* LCD Green Display */}
        <div className="bg-black border-2 border-t-[#111] border-l-[#111] border-b-[#333] border-r-[#333] p-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${isPlaying ? 'text-[#00ff00] animate-pulse' : 'text-gray-600'}`}>
              {isPlaying ? '▶ PLAY' : '■ STOP'}
            </span>
            <span className="text-sm font-bold tracking-widest text-[#00ff00]">
              {Math.floor(playbackSec / 60)}:{(playbackSec % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-[10px] text-[#00ff00] truncate max-w-[130px] font-bold">
            {currentTrack.title}
          </div>
        </div>

        {/* Visualizer & Bitrate */}
        <div className="flex justify-between items-center text-[9px] text-[#00cc00] px-1">
          <div className="flex items-end gap-0.5 h-4">
            <div className={`w-1 bg-[#00ff00] ${isPlaying ? 'h-3 animate-bounce' : 'h-1'}`} />
            <div className={`w-1 bg-[#00ff00] ${isPlaying ? 'h-4 animate-pulse' : 'h-1'}`} />
            <div className={`w-1 bg-[#00ff00] ${isPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
            <div className={`w-1 bg-[#00ff00] ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1'}`} />
            <div className={`w-1 bg-[#00ff00] ${isPlaying ? 'h-1.5 animate-bounce' : 'h-1'}`} />
          </div>
          <span>192 kbps • 44 kHz</span>
          <span className="text-gray-400">{currentTrack.genre}</span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between bg-[#222] p-1 border border-[#444]">
          <div className="flex gap-1">
            <button
              onClick={handlePrev}
              className="px-2 py-0.5 bg-[#444] text-white hover:bg-[#555] text-[10px] font-bold border-t border-l border-[#888] border-b border-r border-black"
            >
              ⏮
            </button>
            <button
              onClick={handleTogglePlay}
              className="px-3 py-0.5 bg-[#444] text-[#00ff00] hover:bg-[#555] text-[10px] font-bold border-t border-l border-[#888] border-b border-r border-black"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={handleNext}
              className="px-2 py-0.5 bg-[#444] text-white hover:bg-[#555] text-[10px] font-bold border-t border-l border-[#888] border-b border-r border-black"
            >
              ⏭
            </button>
          </div>

          <div className="flex items-center gap-1 text-[9px] text-gray-300">
            <span>VOL</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-16 h-1 accent-[#00ff00] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Playlist Drawer */}
      <div className="mt-1 bg-black border border-[#333] p-1.5 text-[10px] space-y-1 max-h-32 overflow-y-auto">
        <div className="text-gray-400 font-bold border-b border-[#333] pb-0.5 flex justify-between">
          <span>LISTA DE REPRODUCCIÓN</span>
          <span>{tracks.length} PISTAS</span>
        </div>
        {tracks.map((t, idx) => (
          <div
            key={t.id}
            onClick={() => {
              setCurrentTrackIdx(idx);
              setIsPlaying(true);
              setPlaybackSec(0);
            }}
            className={`cursor-pointer px-1 py-0.5 flex justify-between items-center ${
              idx === currentTrackIdx ? 'bg-[#000066] text-[#00ff00] font-bold' : 'text-gray-300 hover:bg-[#222]'
            }`}
          >
            <span className="truncate max-w-[200px]">{idx + 1}. {t.title} - {t.artist}</span>
            <span className="text-gray-500 font-mono">
              {Math.floor(t.durationSec / 60)}:{(t.durationSec % 60).toString().padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
