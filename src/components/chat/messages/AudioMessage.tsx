"use client";

import { useState, useRef, useEffect } from "react";
import { RiPlayCircleLine, RiPauseCircleLine } from "react-icons/ri";

interface AudioMessageProps {
  mediaUrl: string;
  duration?: number;
  isFromMe?: boolean;
}

export default function AudioMessage({ mediaUrl, duration, isFromMe = false }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-[200px] max-w-[280px]">
      <audio ref={audioRef} src={mediaUrl} preload="metadata" />
      
      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          isFromMe 
            ? "bg-white/20 hover:bg-white/30" 
            : "bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/30"
        }`}
      >
        {isPlaying ? (
          <RiPauseCircleLine className={`w-6 h-6 ${isFromMe ? "text-white" : "text-orange-500"}`} />
        ) : (
          <RiPlayCircleLine className={`w-6 h-6 ${isFromMe ? "text-white" : "text-orange-500"}`} />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        {/* Waveform / Progress bar */}
        <div className={`h-1.5 rounded-full overflow-hidden ${isFromMe ? "bg-white/30" : "bg-neutral-200 dark:bg-neutral-600"}`}>
          <div 
            className={`h-full rounded-full transition-all ${isFromMe ? "bg-white" : "bg-orange-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time */}
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isFromMe ? "text-white/70" : "text-neutral-500"}`}>
            {formatTime(currentTime)}
          </span>
          <span className={`text-xs ${isFromMe ? "text-white/70" : "text-neutral-500"}`}>
            {formatTime(audioDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
