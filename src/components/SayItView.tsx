import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  Gauge,
  MessageSquare,
} from 'lucide-react';
import type { QuestionData } from '../types/question';

interface SayItViewProps {
  question: QuestionData;
}

// Browser SpeechRecognition definition
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export const SayItView: React.FC<SayItViewProps> = ({ question }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [hasFinishedReview, setHasFinishedReview] = useState(false);

  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Reset state on question change
    setTranscript('');
    setManualText('');
    setSeconds(0);
    setIsRecording(false);
    setHasFinishedReview(false);
    window.speechSynthesis?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, [question.slug]);

  // Ideal Speech Synthesis
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

  // Evaluate keywords against spoken / manual text
  const activeText = (transcript + ' ' + manualText).toLowerCase();
  const matchedPhrases = question.sayIt.keyPhrases.filter((phrase) => {
    const cleanPhrase = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const words = cleanPhrase.split(' ').filter(w => w.length > 2);
    // Matches if exact phrase is in text or if majority of key terms are present
    if (activeText.includes(cleanPhrase)) return true;
    const matchCount = words.filter(w => activeText.includes(w)).length;
    return words.length > 0 && matchCount >= Math.ceil(words.length * 0.7);
  });

  const keywordHitRate = Math.round((matchedPhrases.length / question.sayIt.keyPhrases.length) * 100);

  // Filler words detector
  const fillerWordRegex = /\b(um|uh|er|ah|like|you know|basically|actually|sort of|kind of)\b/gi;
  const fillerMatches = activeText.match(fillerWordRegex) || [];
  const fillerCount = fillerMatches.length;

  // Words per minute (WPM) calculation
  const totalWords = activeText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(0.1, seconds / 60);
  const wpm = seconds > 4 ? Math.round(totalWords / minutes) : 0;

  // Start / Stop Microphone Recording
  const startRecording = () => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowManualInput(true);
      alert('Live speech recognition is not supported in this browser. You can type or paste your rehearsed response for instant AI keyword scoring!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setHasFinishedReview(false);
        setSeconds(0);
        setTranscript('');
        timerRef.current = window.setInterval(() => {
          setSeconds(s => s + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = () => {
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setShowManualInput(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setHasFinishedReview(true);
  };

  const resetAll = () => {
    stopRecording();
    setTranscript('');
    setManualText('');
    setSeconds(0);
    setHasFinishedReview(false);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="say-it-container">
      {/* Studio Header Card */}
      <div className="say-it-header-card">
        <div className="say-it-badge">
          <Sparkles size={14} />
          <span>AI Spoken Rehearsal Studio</span>
        </div>
        <h2 className="say-it-prompt">{question.sayIt.prompt}</h2>
        <p className="say-it-subtitle">
          Practice delivering this concise 60-second explanation out loud. The AI audio coach checks your technical vocabulary, pacing, and filler words in real time.
        </p>
      </div>

      <div className="say-it-body-card">
        {/* Ideal Speech Script Reference Box */}
        <div className="speech-script-box">
          <div className="script-header-row">
            <span className="script-label">Ideal Candidate Spoken Script</span>
            <button
              className={`speech-play-btn ${isPlayingAudio ? 'active' : ''}`}
              onClick={toggleSpeech}
              aria-label={isPlayingAudio ? 'Stop Speech' : 'Listen to Audio'}
            >
              <Volume2 size={16} />
              <span>{isPlayingAudio ? 'Stop Voice' : 'Listen to Benchmark Delivery'}</span>
            </button>
          </div>
          <blockquote className="speech-script-text">
            "{question.sayIt.speechScript}"
          </blockquote>
        </div>

        {/* Live Keyword Checkpoint Grid */}
        <div className="key-phrases-section">
          <div className="phrases-header-row">
            <h3 className="key-phrases-title">Technical Vocabulary & Checkpoints</h3>
            <span className="keyword-score-tag">
              {matchedPhrases.length} of {question.sayIt.keyPhrases.length} Spoken ({keywordHitRate}%)
            </span>
          </div>
          <div className="key-phrases-grid">
            {question.sayIt.keyPhrases.map((phrase, idx) => {
              const isHit = matchedPhrases.includes(phrase);
              return (
                <div key={idx} className={`phrase-pill ${isHit ? 'hit' : ''}`}>
                  {isHit ? (
                    <CheckCircle2 size={15} className="phrase-check hit-icon" />
                  ) : (
                    <div className="phrase-empty-circle" />
                  )}
                  <span>{phrase}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Voice Rehearsal Deck */}
        <div className="ai-rehearsal-deck">
          <div className="rehearsal-controls-bar">
            <div className="timer-display">
              <Clock size={16} />
              <span className="timer-digits">{formatTime(seconds)}</span>
              <span className="timer-target">/ Target: ~00:45</span>
            </div>

            <div className="rehearsal-actions-group">
              {!isRecording ? (
                <button
                  type="button"
                  className="rehearsal-record-btn start"
                  onClick={startRecording}
                >
                  <Mic size={16} />
                  <span>Start Live Voice Practice</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="rehearsal-record-btn stop recording-pulse"
                  onClick={stopRecording}
                >
                  <MicOff size={16} />
                  <span>Finish &amp; Score Answer</span>
                </button>
              )}

              <button
                type="button"
                className="rehearsal-btn secondary"
                onClick={resetAll}
                title="Reset rehearsal"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                className="rehearsal-btn secondary"
                onClick={() => setShowManualInput(!showManualInput)}
              >
                <MessageSquare size={15} />
                <span>{showManualInput ? 'Hide Text' : 'Type Response'}</span>
              </button>
            </div>
          </div>

          {/* Live Audio Transcript Box */}
          {(transcript || isRecording) && (
            <div className="live-transcript-box">
              <div className="transcript-header">
                <span className="pulse-dot active" />
                <span className="transcript-label">Live Microphone Speech Transcript:</span>
              </div>
              <p className="transcript-text">
                {transcript || 'Listening... Speak your answer now into your microphone.'}
              </p>
            </div>
          )}

          {/* Manual Input Fallback */}
          {showManualInput && (
            <div className="manual-rehearsal-box">
              <label htmlFor="manual-speech-input" className="manual-input-label">
                Or type / paste your rehearsed speech for instant keyword scorecard analysis:
              </label>
              <textarea
                id="manual-speech-input"
                className="manual-textarea"
                rows={3}
                placeholder="Type or paste your spoken answer here to evaluate keywords and cadence..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
            </div>
          )}

          {/* Live Delivery Metrics Bar */}
          {(activeText.trim().length > 10 || hasFinishedReview) && (
            <div className="delivery-scorecard-banner">
              <div className="scorecard-metric">
                <Gauge size={18} className="metric-icon" />
                <div>
                  <span className="metric-val">{wpm > 0 ? `${wpm} WPM` : 'Calculating...'}</span>
                  <span className="metric-sub">
                    {wpm >= 110 && wpm <= 165
                      ? '🎯 Optimal Speed'
                      : wpm > 165
                      ? '⚡ Too Fast'
                      : wpm > 0
                      ? '🐢 Deliberate'
                      : 'Target: 120-150 WPM'}
                  </span>
                </div>
              </div>

              <div className="scorecard-metric">
                <Award size={18} className="metric-icon gold" />
                <div>
                  <span className="metric-val">{keywordHitRate}% Hit Rate</span>
                  <span className="metric-sub">{matchedPhrases.length}/{question.sayIt.keyPhrases.length} Keywords</span>
                </div>
              </div>

              <div className="scorecard-metric">
                <AlertCircle size={18} className={`metric-icon ${fillerCount === 0 ? 'green' : 'amber'}`} />
                <div>
                  <span className="metric-val">{fillerCount} Filler Words</span>
                  <span className="metric-sub">{fillerCount === 0 ? '✨ Crisp & Articulate' : 'Try reducing filler words'}</span>
                </div>
              </div>

              {/* Delivery Grade Verdict */}
              <div className="scorecard-verdict-tag">
                {keywordHitRate >= 80 ? (
                  <span className="verdict-pill senior">🏆 Senior Engineer Ready</span>
                ) : keywordHitRate >= 50 ? (
                  <span className="verdict-pill mid">⚡ Solid Core Answer</span>
                ) : (
                  <span className="verdict-pill review">🔄 Keep Rehearsing</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
