import React, { useEffect, useState } from 'react';
import { RecordingIcon } from '../assets/icons';

interface RecordingIndicatorProps {
  recordingStartTime: string | null;
}

export default function RecordingIndicator({ recordingStartTime }: RecordingIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!recordingStartTime) return;

    const startTimestamp = new Date(recordingStartTime).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimestamp) / 1000);
      setElapsedSeconds(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [recordingStartTime]);

  const formatTime = (totalSeconds: number) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="lk-recording">
      <span>
        <RecordingIcon color="red" />
      </span>
      <span>{formatTime(elapsedSeconds)}</span>
    </div>
  );
}
