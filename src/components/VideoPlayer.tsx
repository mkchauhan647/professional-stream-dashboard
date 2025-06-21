import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
const apiUrl = import.meta.env.VITE_API_URL;
// console.log('API URL:', apiUrl);


interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {

  src = apiUrl + src;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Autoplay was prevented.", e));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Autoplay was prevented.", e));
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return <video ref={videoRef} controls muted className="w-full h-full bg-black rounded-lg" />;
};

export default VideoPlayer;