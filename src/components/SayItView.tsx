import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Volume2, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import type { QuestionData } from '../types/question';

interface SayItViewProps {
  question: QuestionData;
}

export const SayItView: React.FC<SayItViewProps> = ({ question }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.slug]);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.sayIt.speechScript);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const togglePracticeTimer = () => {
    if (isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      setSeconds(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const resetPracticeTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setSeconds(0);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="say-it-container">
      <div className="say-it-header-card">
        <div className="say-it-badge">
          <Sparkles size={14} />
          <span>Spoken Rehearsal Studio</span>
        </div>
        <h2 className="say-it-prompt">{question.sayIt.prompt}</h2>
        <p className="say-it-subtitle">
          Practice delivering this concise, authoritative 60-second explanation out loud.
        </p>
      </div>

      <div className="say-it-body-card">
        <div className="speech-script-box">
          <div className="script-header-row">
            <span className="script-label">Ideal Candidate Spoken Script</span>
            <button
              className={`speech-play-btn ${isPlayingAudio ? 'active' : ''}`}
              onClick={toggleSpeech}
              aria-label={isPlayingAudio ? 'Stop Speech' : 'Listen to Audio'}
            >
              <Volume2 size={16} />
              <span>{isPlayingAudio ? 'Stop Voice' : 'Listen to Ideal Delivery'}</span>
            </button>
          </div>
          <blockquote className="speech-script-text">
            "{question.sayIt.speechScript}"
          </blockquote>
        </div>

        <div className="key-phrases-section">
          <h3 className="key-phrases-title">Key Vocabulary & Checkpoints</h3>
          <div className="key-phrases-grid">
            {question.sayIt.keyPhrases.map((phrase, idx) => (
              <div key={idx} className="phrase-pill">
                <CheckCircle2 size={14} className="phrase-check" />
                <span>{phrase}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="practice-timer-bar">
          <div className="timer-display">
            <Clock size={16} />
            <span className="timer-digits">{formatTime(seconds)}</span>
            <span className="timer-target">/ Target: ~00:45</span>
          </div>

          <div className="timer-actions">
            <button
              className={`timer-btn ${isRecording ? 'recording' : 'primary'}`}
              onClick={togglePracticeTimer}
            >
              {isRecording ? <Square size={14} /> : <Play size={14} />}
              <span>{isRecording ? 'Stop Practice' : 'Start Rehearsal'}</span>
            </button>
            <button className="timer-btn secondary" onClick={resetPracticeTimer}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
