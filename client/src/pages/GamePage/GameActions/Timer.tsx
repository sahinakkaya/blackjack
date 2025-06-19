import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const TimerText = styled.div`
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  width: 200px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number; $isWarning: boolean; }>`
  height: 100%;
  background-color: ${props => props.$isWarning ? '#ff4444' : '#4CAF50'};
  width: ${props => props.$progress}%;
  transition: width 0.1s linear, background-color 0.3s ease;
`;

interface TimerProps {
  duration: number; // Duration in seconds
  onTimeout: () => void;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ duration, onTimeout, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      return;
    }

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          onTimeout();
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeout, duration]);

  // Reset timer when isActive changes to true
  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [isActive, duration]);

  const progress = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 3; // Warning when 3 seconds or less

  if (!isActive) {
    return null;
  }

  return (
    <TimerContainer>
      <TimerText>
        {t('timer.time_left')}: {Math.ceil(timeLeft)}s
      </TimerText>
      <ProgressBarContainer>
        <ProgressBar $progress={progress} $isWarning={isWarning} />
      </ProgressBarContainer>
    </TimerContainer>
  );
};