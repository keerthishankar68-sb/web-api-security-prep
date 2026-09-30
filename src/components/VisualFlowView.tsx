import React, { useEffect, useState, useRef } from 'react';
import type { DiagramNode, DiagramStep } from '../types/question';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Server,
  Database,
  Lock,
  Cpu,
  Smartphone,
  Globe,
  Key,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
  Volume2,
  Target,
  Terminal,
  Activity,
  Code2,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface VisualFlowViewProps {
  nodes: DiagramNode[];
  steps: DiagramStep[];
  interviewTakeaway: string;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export const VisualFlowView: React.FC<VisualFlowViewProps> = ({
  nodes,
  steps,
  interviewTakeaway,
  currentStepIndex,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHeaders, setShowHeaders] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [arcPath, setArcPath] = useState<string>('');
  const [packetPos, setPacketPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeStep = steps[currentStepIndex] || steps[0];
  const fromNode = nodes.find(n => n.id === activeStep.from) || nodes[0];
  const toNode = nodes.find(n => n.id === activeStep.to) || nodes[nodes.length - 1];

  useEffect(() => {
    if (!isPlaying) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsPlaying(false);
      return;
    }
    const intervalMs = 4500 / playbackSpeed;
    const timer = setInterval(() => {
      onStepChange((currentStepIndex + 1) % steps.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, steps.length, currentStepIndex, onStepChange]);

  useEffect(() => {
    if (!containerRef.current || !activeStep) return;
    const fromEl = containerRef.current.querySelector('[data-node-id="' + activeStep.from + '"]') as HTMLElement;
    const toEl = containerRef.current.querySelector('[data-node-id="' + activeStep.to + '"]') as HTMLElement;
    if (fromEl && toEl) {
      const cRect = containerRef.current.getBoundingClientRect();
      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();
      const x1 = fRect.left + fRect.width / 2 - cRect.left;
      const y1 = fRect.top + 32 - cRect.top;
      const x2 = tRect.left + tRect.width / 2 - cRect.left;
      const y2 = tRect.top + 32 - cRect.top;
      const midX = (x1 + x2) / 2;
      const distance = Math.abs(x2 - x1);
      const arcHeight = Math.max(45, Math.min(90, distance * 0.22));
      const peakY = Math.min(y1, y2) - arcHeight;
      setArcPath('M ' + x1 + ' ' + y1 + ' Q ' + midX + ' ' + peakY + ' ' + x2 + ' ' + y2);
      setPacketPos({ x: midX, y: peakY + 8 });
    }
  }, [activeStep, currentStepIndex, nodes]);

  const getNodeIcon = (iconType?: string) => {
    switch (iconType) {
      case 'key': return <Key size={20} />;
      case 'phone': return <Smartphone size={20} />;
      case 'shield': return <ShieldCheck size={20} />;
      case 'blocked': return <ShieldCheck size={20} />;
      case 'attacker': return <ShieldAlert size={20} />;
      case 'server': return <Server size={20} />;
      case 'database': return <Database size={20} />;
      case 'auth': return <Lock size={20} />;
      case 'api': return <Cpu size={20} />;
      case 'browser':
      default: return <Globe size={20} />;
    }
  };

  const copyTakeaway = () => {
    navigator.clipboard.writeText(interviewTakeaway);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakTakeaway = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(interviewTakeaway);
      u.rate = 0.95;
      u.onend = () => setIsPlayingAudio(false);
      u.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(u);
      setIsPlayingAudio(true);
    }
  };

  const telemetry = activeStep.telemetry;

  return (
    <div className="visual-split-workspace">
      {/* Step Sequence Tabs Bar */}
      <div className="flow-step-selector-row">
        {steps.map((step, idx) => {
          const isPassed = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <button
              key={step.id}
              type="button"
              className={'step-selector-pill ' + (isCurrent ? 'active' : isPassed ? 'passed' : '')}
              onClick={() => {
                setIsPlaying(false);
                onStepChange(idx);
              }}
            >
              <span className="pill-number-badge">{idx + 1}</span>
              <span className="pill-title-text">{step.label}</span>
              {isPassed && <span className="pill-check-icon">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Stage (60%) + Right Insight Panels (40%) */}
      <div className="flow-split-grid">
        {/* Left Column: Interactive Diagram Canvas + Deep Telemetry Stage */}
        <div className="flow-stage-column">
          <div className="interactive-stage-card" ref={containerRef}>
            <div className="cyber-grid-mesh" />

            {/* Stage Live Telemetry Bar */}
            <div className="stage-telemetry-hud">
              <div className="telemetry-route-badge">
                <Activity size={13} className="pulse-icon" />
                <span className="route-text">{fromNode.label}</span>
                <ArrowRight size={12} className="route-arrow" />
                <span className="route-text highlight">{toNode.label}</span>
              </div>

              {telemetry && telemetry.statusBadge && (
                <div className={'telemetry-status-pill ' + activeStep.status}>
                  {telemetry.statusBadge}
                </div>
              )}
            </div>

            {/* Laser Arc */}
            <svg className="stage-laser-svg">
              <defs>
                <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {arcPath && (
                <path
                  d={arcPath}
                  fill="none"
                  stroke="url(#laserBeamGrad)"
                  strokeWidth="3.5"
                  strokeDasharray="8,8"
                  className="laser-arc-animated"
                />
              )}
            </svg>

            {/* Flying Packet Chip */}
            {packetPos.x > 0 && (
              <div
                className={'flying-packet-chip ' + activeStep.status}
                style={{ left: packetPos.x + 'px', top: packetPos.y + 'px' }}
              >
                <Zap size={13} className="zap-sparkle" />
                <span>{activeStep.packet}</span>
              </div>
            )}

            {/* Connecting Wire */}
            <div className="stage-connecting-wire" />

            {/* Nodes Row */}
            <div className="stage-nodes-row">
              {nodes.map((node, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFrom = node.id === activeStep.from;
                const isTo = node.id === activeStep.to;
                return (
                  <div key={node.id} data-node-id={node.id} className="stage-node-item">
                    <div className={'node-beacon-ring ' + (isCompleted ? 'active' : '')} />
                    <div className={'node-box-enclosure ' + (isCurrent ? 'current-step' : '') + (isFrom ? ' source-node' : '') + (isTo ? ' target-node' : '') + (node.iconType === 'attacker' ? ' threat-node' : '')}>
                      {isFrom && <span className="node-live-tag dispatch">SENDING</span>}
                      {isTo && <span className="node-live-tag verify">INSPECTING</span>}
                      <div className="node-icon-wrapper">
                        {getNodeIcon(node.iconType)}
                      </div>
                      <div className="node-titles">
                        <div className="node-main-title">{node.label}</div>
                        {node.sub && <div className="node-sub-title">{node.sub}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* In-Depth Animation Explanation Box */}
            <div className="stage-deep-explanation-container">
              <div className="stage-deep-header">
                <div className="deep-title-group">
                  <Terminal size={14} className="terminal-icon" />
                  <span className="deep-title-label">Live Protocol Telemetry & Deep Step Breakdown</span>
                </div>
                {telemetry && telemetry.protocol && (
                  <span className="telemetry-protocol-tag">{telemetry.protocol}</span>
                )}
              </div>
              <div className="stage-deep-body">
                <p className="deep-explanation-paragraph">
                  {activeStep.deepExplanation || activeStep.whatIsHappeningText || activeStep.caption}
                </p>
                {telemetry && telemetry.securityAction && (
                  <div className="deep-security-action-row">
                    <span className="action-label">🔒 Security Action:</span>
                    <span className="action-val">{telemetry.securityAction}</span>
                  </div>
                )}
                {telemetry && telemetry.headers && telemetry.headers.length > 0 && (
                  <div className="telemetry-headers-section">
                    <button
                      type="button"
                      className="btn-toggle-headers"
                      onClick={() => setShowHeaders(!showHeaders)}
                    >
                      <Code2 size={13} />
                      <span>{showHeaders ? 'Hide Protocol Headers' : 'Inspect Protocol Headers'}</span>
                      {showHeaders ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {showHeaders && (
                      <div className="headers-terminal-box">
                        {telemetry.method && (
                          <div className="terminal-line method">
                            <span className="prompt">&gt;</span> <span className="method-text">{telemetry.method}</span>
                          </div>
                        )}
                        {telemetry.headers.map((h, i) => (
                          <div key={i} className="terminal-line header">
                            <span className="hdr-bullet">•</span> {h}
                          </div>
                        ))}
                        {telemetry.payloadPreview && (
                          <div className="terminal-line payload">
                            <span className="prompt">#</span> {telemetry.payloadPreview}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Scrubber Toolbar */}
          <div className="stage-scrubber-deck">
            <div className="scrubber-controls-left">
              <button
                className="btn-play-circle"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              </button>
              <button
                className="btn-skip-step"
                onClick={() => {
                  setIsPlaying(false);
                  onStepChange(Math.max(0, currentStepIndex - 1));
                }}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="btn-skip-step"
                onClick={() => {
                  setIsPlaying(false);
                  onStepChange(Math.min(steps.length - 1, currentStepIndex + 1));
                }}
                disabled={currentStepIndex === steps.length - 1}
              >
                <ChevronRight size={17} />
              </button>
              <button
                className="btn-restart-pill"
                onClick={() => {
                  onStepChange(0);
                  setIsPlaying(true);
                }}
              >
                <RotateCcw size={13} />
                <span>Restart</span>
              </button>
            </div>
            <div className="scrubber-range-middle">
              <input
                type="range"
                min={0}
                max={steps.length - 1}
                value={currentStepIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  onStepChange(parseInt(e.target.value, 10));
                }}
                className="scrubber-track-range"
              />
            </div>
            <div className="scrubber-speed-right">
              <span className="step-counter-tag">Step {currentStepIndex + 1} of {steps.length}</span>
              <select
                className="speed-select-drop"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              >
                <option value="0.75">0.75x</option>
                <option value="1">1.0x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: 'What is happening?' + 'Terms in this step' */}
        <div className="flow-insights-column">
          <section className="insight-panel-card what-happening-card">
            <div className="insight-card-header">
              <div className="header-icon-pill yellow">
                <Lightbulb size={16} />
              </div>
              <div className="header-text-group">
                <h3>What is happening?</h3>
                <span className="step-subheading">{activeStep.whatIsHappeningTitle}</span>
              </div>
            </div>
            <p className="what-happening-text">{activeStep.whatIsHappeningText || activeStep.deepExplanation}</p>
            {activeStep.whyItMatters && (
              <div className="why-it-matters-box">
                <span className="why-label">🎯 Why This Step Matters:</span>
                <p className="why-text">{activeStep.whyItMatters}</p>
              </div>
            )}
            {activeStep.securityVerdict && (
              <div className="security-verdict-box">
                <span className="verdict-label">🛡️ Security Verdict:</span>
                <p className="verdict-text">{activeStep.securityVerdict}</p>
              </div>
            )}
          </section>

          <section className="insight-panel-card terms-card">
            <div className="insight-card-header">
              <div className="header-icon-pill cyan">
                <BookOpen size={16} />
              </div>
              <div className="header-text-group">
                <h3>Terms in this step</h3>
                <span className="terms-count-badge">{(activeStep.terms && activeStep.terms.length) || 2} terms</span>
              </div>
            </div>
            <div className="terms-definitions-list">
              {(activeStep.terms || []).map((termItem, idx) => (
                <div key={idx} className="term-definition-box">
                  <div className="term-name-tag">{termItem.term}</div>
                  <div className="term-meaning-text">{termItem.definition}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Wide Panel: Interview Takeaway */}
      <section className="interview-takeaway-wide-card">
        <div className="takeaway-header-bar">
          <div className="takeaway-title-wrap">
            <div className="takeaway-icon-box">
              <Target size={18} />
            </div>
            <h3>Interview Takeaway Formula</h3>
          </div>
          <div className="takeaway-action-buttons">
            <button
              className={'takeaway-btn-voice ' + (isPlayingAudio ? 'active' : '')}
              onClick={speakTakeaway}
            >
              <Volume2 size={15} />
              <span>{isPlayingAudio ? 'Stop Voice' : 'Listen'}</span>
            </button>
            <button className="takeaway-btn-copy" onClick={copyTakeaway}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Takeaway'}</span>
            </button>
          </div>
        </div>
        <p className="takeaway-verdict-quote">
          "{interviewTakeaway}"
        </p>
      </section>
    </div>
  );
};
