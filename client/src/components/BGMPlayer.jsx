import React, { useEffect, useRef } from 'react';

const BGMPlayer = ({ src, volume = 0.5 }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.play().catch(() => {}); // 자동재생 정책 대응
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [src, volume]);

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      autoPlay
      style={{ display: 'none' }}
    />
  );
};

export default BGMPlayer; 