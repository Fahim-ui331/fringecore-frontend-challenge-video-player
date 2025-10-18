import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Play, Pause } from 'lucide-react'; 

const PLAYER_SIZE = 450;
const VIDEO_SIZE = 350;

const App = () => {
  const videoRef = useRef(null);
  const seekBarRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0); 
  const [isEnded, setIsEnded] = useState(false);

  const progressPercent = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        if (isEnded) {
          video.currentTime = 0;
          setIsEnded(false);
        }
        video.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleVideoEnd = () => {
      setIsPlaying(false);
      setIsEnded(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  const handleSeek = (e) => {
    const seekBar = seekBarRef.current;
    const video = videoRef.current;

    if (seekBar && video) {
      const rect = seekBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      
      const seekTime = (clickX / width) * duration;
      video.currentTime = seekTime;
      setCurrentTime(seekTime);
      
      if (isEnded) {
        setIsEnded(false);
      }
    }
  };

  const handleMouseMove = (e) => {
    const seekBar = seekBarRef.current;
    if (seekBar) {
      const rect = seekBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      
      setHoverPosition((clickX / width) * 100);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-400 p-8">
      
      <div>
        <div className="p-4">Your code goes here... show us your magic ✨</div>
        <video className="w-[300px] ml-4 hidden" src="/demo.mp4" controls />;
      </div>
      
      <div 
        className="relative shadow-2xl rounded-[50px] overflow-hidden"
        style={{ width: `${PLAYER_SIZE}px`, height: `${PLAYER_SIZE}px` }}
      >
        
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to right, #ffffff ${progressPercent}%, #dc2626 ${progressPercent}%)`,
            border: '2px solid #dc2626',
          }}
        />

        <div 
          className="absolute bg-black rounded-xl overflow-hidden shadow-lg"
          style={{
            width: `${VIDEO_SIZE}px`,
            height: `${VIDEO_SIZE}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
             <video 
                ref={videoRef} 
                src="/demo.mp4" 
                className="w-full h-full object-cover" 
                controls={false}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={togglePlayPause} 
                className="p-4 rounded-full bg-red-600 bg-opacity-70 text-white transition-opacity hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause size={36} fill="white" strokeWidth={0} />
                ) : (
                  <Play size={36} fill="white" strokeWidth={0} className="translate-x-[2px]" />
                )}
              </button>
            </div>
        </div>
        
        <div 
          ref={seekBarRef}
          className="absolute w-full cursor-pointer z-20"
          style={{ 
            top: `${PLAYER_SIZE / 2 - 2}px`,
            height: '4px',
          }}
          onClick={handleSeek}
          onMouseEnter={() => setIsHoveringSeek(true)}
          onMouseLeave={() => setIsHoveringSeek(false)}
          onMouseMove={handleMouseMove}
        >
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
                background: `linear-gradient(to right, #dc2626 ${progressPercent}%, transparent ${progressPercent}%)`,
            }}
          />
          
          {isHoveringSeek && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-yellow-400 rounded-full pointer-events-none"
              style={{ left: `${hoverPosition}%`, transform: `translate(-50%, -50%)` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;