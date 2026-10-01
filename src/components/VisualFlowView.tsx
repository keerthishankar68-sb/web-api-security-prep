import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { DiagramNode, DiagramStep } from '../types/question';
import { soundEffects } from '../utils/audioFx';
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
  VolumeX,
  Target,
  Terminal,
  Code2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Binary,
  Radio,
  Sparkles,
  Info,
  X
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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showWiretapModal, setShowWiretapModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [wiretapTab, setWiretapTab] = useState<'wire' | 'hex' | 'sop'>('wire');
  const [stepProgress, setStepProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [arcPath, setArcPath] = useState<string>('');
  const [packetPos, setPacketPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeStep = steps[currentStepIndex] || steps[0];
  const fromNode = nodes.find(n => n.id === activeStep.from) || nodes[0];
  const toNode = nodes.find(n => n.id === activeStep.to) || nodes[nodes.length - 1];

  const stepDurationMs = 4500 / playbackSpeed;

  // Sound toggle handler
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setEnabled(next);
    if (next) {
      soundEffects.playTick();
    }
  };

  // Play audio reaction on step change
  useEffect(() => {
    if (soundEnabled) {
      soundEffects.playDispatch();
      const isBlocked = activeStep.status === 'attack' ||
        (activeStep.telemetry?.statusBadge && activeStep.telemetry.statusBadge.toLowerCase().includes('block'));
      const timeout = setTimeout(() => {
        if (isBlocked) {
          soundEffects.playBlocked();
        } else {
          soundEffects.playVerified();
        }
      }, 700 / playbackSpeed);
      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex, activeStep, soundEnabled, playbackSpeed]);

  // Voice narration when autoNarrate is enabled
  useEffect(() => {
    if (!autoNarrate || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const narrationText = `${activeStep.whatIsHappeningTitle || activeStep.label}. ${activeStep.caption}`;
    const u = new SpeechSynthesisUtterance(narrationText);
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentStepIndex, autoNarrate, activeStep]);

  // Video Progress ticker
  useEffect(() => {
    if (!isPlaying) {
      setStepProgress(0);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / stepDurationMs) * 100);
      setStepProgress(progress);
      if (elapsed >= stepDurationMs) {
        clearInterval(interval);
        onStepChange((currentStepIndex + 1) % steps.length);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, stepDurationMs, onStepChange]);

  // Calculate Bezier Arc & Node coordinates
  const calculateCurve = useCallback(() => {
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
      const arcHeight = Math.max(45, Math.min(95, distance * 0.24));
      const peakY = Math.min(y1, y2) - arcHeight;
      setArcPath('M ' + x1 + ' ' + y1 + ' Q ' + midX + ' ' + peakY + ' ' + x2 + ' ' + y2);
      setPacketPos({ x: midX, y: peakY + 8 });
    }
  }, [activeStep]);

  useEffect(() => {
    calculateCurve();
    window.addEventListener('resize', calculateCurve);
    return () => window.removeEventListener('resize', calculateCurve);
  }, [calculateCurve]);

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
  const isBlockedVerdict = activeStep.status === 'attack' ||
    (telemetry?.statusBadge && telemetry.statusBadge.toLowerCase().includes('block'));

  // Hex dump generator for simulated wiretap inspection
  const generateHexDump = (text: string) => {
    const lines: { offset: string; hex: string; ascii: string }[] = [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    for (let i = 0; i < bytes.length; i += 16) {
      const slice = bytes.slice(i, i + 16);
      const offset = i.toString(16).padStart(4, '0');
      const hexParts: string[] = [];
      let ascii = '';
      for (let j = 0; j < 16; j++) {
        if (j < slice.length) {
          hexParts.push(slice[j].toString(16).padStart(2, '0'));
          ascii += slice[j] >= 32 && slice[j] <= 126 ? String.fromCharCode(slice[j]) : '.';
        } else {
          hexParts.push('  ');
        }
      }
      lines.push({ offset, hex: hexParts.join(' '), ascii });
    }
    return lines;
  };

  const rawWireString = telemetry
    ? `${telemetry.method || 'GET'} / HTTP/1.1\r\nHost: ${toNode.sub || 'api.example.com'}\r\n${(telemetry.headers || []).join('\r\n')}\r\n\r\n${telemetry.payloadPreview || ''}`
    : `${activeStep.packet} PROTOCOL/1.0\r\nFrom: ${fromNode.label}\r\nTo: ${toNode.label}`;

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div className={`visual-split-workspace ${isTheaterMode ? 'theater-mode-active' : ''}`}>
      {/* Video Progress Tabs Bar */}
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
                soundEffects.playTick();
                onStepChange(idx);
              }}
              title={`Jump to Step ${idx + 1}: ${step.label}`}
            >
              {isCurrent && isPlaying && (
                <div
                  className="step-pill-progress-fill"
                  style={{ width: `${stepProgress}%` }}
                />
              )}
              <span className="pill-number-badge">{idx + 1}</span>
              <span className="pill-title-text">{step.label}</span>
              {isPassed && <span className="pill-check-icon">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Stage + Right Insight Panels */}
      <div className="flow-split-grid">
        {/* Left Column: Interactive Visual Lab */}
        <div className="flow-stage-column">
          <div className="interactive-stage-card" ref={containerRef}>
            <div className="cyber-grid-mesh" />

            {/* Stage Live Telemetry Bar */}
            <div className="stage-telemetry-hud">
              <div className="telemetry-route-badge">
                <Radio size={13} className="pulse-icon broadcasting" />
                <span className="route-text">{fromNode.label}</span>
                <ArrowRight size={12} className="route-arrow" />
                <span className="route-text highlight">{toNode.label}</span>
              </div>

              <div className="hud-right-actions">
                <button
                  type="button"
                  className={`hud-wiretap-btn ${showWiretapModal ? 'active' : ''}`}
                  onClick={() => setShowWiretapModal(!showWiretapModal)}
                  title="Inspect raw protocol wiretap & hex traffic"
                >
                  <Binary size={13} />
                  <span>Wiretap Inspector</span>
                </button>

                {telemetry && telemetry.statusBadge && (
                  <div className={'telemetry-status-pill ' + activeStep.status}>
                    {telemetry.statusBadge}
                  </div>
                )}
              </div>
            </div>

            {/* Laser Arc with Traveling Particle & Plasma Core */}
            <svg className="stage-laser-svg" aria-hidden="true">
              <defs>
                <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor={isBlockedVerdict ? '#ef4444' : '#10b981'} />
                </linearGradient>

                <radialGradient id="plasmaCoreGrad">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="40%" stopColor={isBlockedVerdict ? '#f87171' : '#38bdf8'} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={isBlockedVerdict ? '#dc2626' : '#2563eb'} stopOpacity="0" />
                </radialGradient>

                <filter id="laserGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {arcPath && (
                <>
                  {/* Background laser glow trace */}
                  <path
                    d={arcPath}
                    fill="none"
                    stroke={isBlockedVerdict ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.22)'}
                    strokeWidth="8"
                    className="laser-glow-trail"
                  />
                  {/* Dashed animated primary laser */}
                  <path
                    id="laserFlightPath"
                    d={arcPath}
                    fill="none"
                    stroke="url(#laserBeamGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="8,8"
                    className="laser-arc-animated"
                  />

                  {/* Traveling Energy Plasma Shuttle along the Bezier Arc */}
                  <g filter="url(#laserGlowFilter)">
                    {/* Trailing energy spark 2 */}
                    <circle r="3.5" fill={isBlockedVerdict ? '#fca5a5' : '#7dd3fc'} opacity="0.6">
                      <animateMotion
                        path={arcPath}
                        dur={`${2.4 / playbackSpeed}s`}
                        begin="-0.18s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Trailing energy spark 1 */}
                    <circle r="4.5" fill={isBlockedVerdict ? '#ef4444' : '#38bdf8'} opacity="0.8">
                      <animateMotion
                        path={arcPath}
                        dur={`${2.4 / playbackSpeed}s`}
                        begin="-0.09s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Glowing Plasma Core */}
                    <circle r="8" fill="url(#plasmaCoreGrad)">
                      <animateMotion
                        path={arcPath}
                        dur={`${2.4 / playbackSpeed}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Inner brilliant photon spark */}
                    <circle r="3" fill="#ffffff">
                      <animateMotion
                        path={arcPath}
                        dur={`${2.4 / playbackSpeed}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                </>
              )}
            </svg>

            {/* Flying Packet Chip (Interactive click to inspect) */}
            {packetPos.x > 0 && (
              <div
                className={'flying-packet-chip ' + activeStep.status + (isBlockedVerdict ? ' blocked-packet' : '')}
                style={{ left: packetPos.x + 'px', top: packetPos.y + 'px' }}
                onClick={() => setShowWiretapModal(true)}
                title="Click to inspect raw packet data"
              >
                <Zap size={13} className="zap-sparkle" />
                <span className="packet-chip-label">{activeStep.packet}</span>
                <span className="packet-inspect-hint">INSPECT</span>
              </div>
            )}

            {/* Connecting Wire */}
            <div className="stage-connecting-wire" />

            {/* Interactive Nodes Row */}
            <div className="stage-nodes-row">
              {nodes.map((node, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFrom = node.id === activeStep.from;
                const isTo = node.id === activeStep.to;
                const isSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className={`stage-node-item ${isSelected ? 'is-inspected' : ''}`}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                    title={`Click to inspect ${node.label} security parameters`}
                  >
                    {/* Sender Outgoing Radar Pulse Wave */}
                    {isFrom && <div className="node-radar-pulse" />}

                    {/* Target Node Security Shockwave Barrier */}
                    {isTo && (
                      <div className={`target-impact-shockwave ${isBlockedVerdict ? 'threat-deflection' : 'clearance-allowed'}`}>
                        <div className="shockwave-ring outer" />
                        <div className="shockwave-ring inner" />
                      </div>
                    )}

                    <div className={'node-beacon-ring ' + (isCompleted ? 'active' : '') + (isTo && isBlockedVerdict ? ' blocked' : '')} />

                    <div className={
                      'node-box-enclosure ' +
                      (isCurrent ? 'current-step' : '') +
                      (isFrom ? ' source-node' : '') +
                      (isTo ? ' target-node' : '') +
                      (node.iconType === 'attacker' ? ' threat-node' : '') +
                      (isTo && isBlockedVerdict ? ' intercepted' : '') +
                      (isSelected ? ' selected-spec' : '')
                    }>
                      {isFrom && <span className="node-live-tag dispatch">SENDING</span>}
                      {isTo && (
                        <span className={`node-live-tag ${isBlockedVerdict ? 'blocked-alert' : 'verify'}`}>
                          {isBlockedVerdict ? 'BLOCKED' : 'INSPECTING'}
                        </span>
                      )}

                      <div className="node-icon-wrapper">
                        {getNodeIcon(node.iconType)}
                      </div>
                      <div className="node-titles">
                        <div className="node-main-title">{node.label}</div>
                        {node.sub && <div className="node-sub-title">{node.sub}</div>}
                      </div>

                      {/* Interactive Tap Hint */}
                      <span className="node-spec-click-hint">
                        {isSelected ? 'Inspecting' : 'Tap to inspect'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Node Security Specification Drawer (Shown when node is clicked) */}
            {selectedNode && (
              <div className="selected-node-inspector-drawer">
                <div className="inspector-drawer-header">
                  <div className="drawer-title-group">
                    <Info size={14} className="drawer-icon" />
                    <span className="drawer-title">Entity Security Spec: <strong>{selectedNode.label}</strong></span>
                    <span className="drawer-sub-badge">{selectedNode.sub || 'Local Host'}</span>
                  </div>
                  <button
                    type="button"
                    className="drawer-close-btn"
                    onClick={() => setSelectedNodeId(null)}
                    aria-label="Close inspector"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="inspector-drawer-grid">
                  <div className="drawer-spec-col">
                    <span className="spec-label">Security Zone:</span>
                    <span className="spec-val">
                      {selectedNode.iconType === 'attacker'
                        ? '⚠️ Untrusted Origin (CORS/SOP Sandbox)'
                        : selectedNode.id === 'client' || selectedNode.id === 'browser'
                        ? '🛡️ User-Agent Process (Enforces SOP)'
                        : '🔒 Protected Origin Server'}
                    </span>
                  </div>
                  <div className="drawer-spec-col">
                    <span className="spec-label">Active Step Role:</span>
                    <span className="spec-val">
                      {selectedNode.id === activeStep.from
                        ? `Dispatches ${activeStep.packet} across network boundary`
                        : selectedNode.id === activeStep.to
                        ? `Evaluates origin policy, headers, & credentials`
                        : 'Passive intermediary / listener in this step'}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                  <div className={`deep-security-action-row ${isBlockedVerdict ? 'blocked-row' : ''}`}>
                    <span className="action-label">
                      {isBlockedVerdict ? '🛡️ Policy Enforcement:' : '🔒 Security Action:'}
                    </span>
                    <span className="action-val">{telemetry.securityAction}</span>
                  </div>
                )}

                {/* Inspect Protocol Headers Dropdown */}
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

          {/* Video Control Deck & Scrubber */}
          <div className="stage-scrubber-deck">
            <div className="scrubber-controls-left">
              <button
                className={`btn-play-circle ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => {
                  soundEffects.playTick();
                  setIsPlaying(!isPlaying);
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              </button>
              <button
                className="btn-skip-step"
                onClick={() => {
                  setIsPlaying(false);
                  soundEffects.playTick();
                  onStepChange(Math.max(0, currentStepIndex - 1));
                }}
                disabled={currentStepIndex === 0}
                title="Previous step (ArrowLeft)"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="btn-skip-step"
                onClick={() => {
                  setIsPlaying(false);
                  soundEffects.playTick();
                  onStepChange(Math.min(steps.length - 1, currentStepIndex + 1));
                }}
                disabled={currentStepIndex === steps.length - 1}
                title="Next step (ArrowRight)"
              >
                <ChevronRight size={17} />
              </button>
              <button
                className="btn-restart-pill"
                onClick={() => {
                  soundEffects.playTick();
                  onStepChange(0);
                  setIsPlaying(true);
                }}
                title="Restart simulation"
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
                  soundEffects.playTick();
                  onStepChange(parseInt(e.target.value, 10));
                }}
                className="scrubber-track-range"
                aria-label="Step scrubber"
              />
              <div className="scrubber-timeline-labels">
                <span className="timecode-label">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                {isPlaying && (
                  <span className="auto-advance-countdown">
                    Auto-advancing in {Math.max(0.1, ((100 - stepProgress) * stepDurationMs / 100000)).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>

            <div className="scrubber-speed-right">
              {/* Sound FX Toggle */}
              <button
                type="button"
                className={`btn-audio-toggle ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                title={soundEnabled ? 'Disable Cyber Audio FX' : 'Enable Cyber Audio FX'}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>FX</span>
              </button>

              {/* Voice Narration Toggle */}
              <button
                type="button"
                className={`btn-narrate-toggle ${autoNarrate ? 'active' : ''}`}
                onClick={() => setAutoNarrate(!autoNarrate)}
                title={autoNarrate ? 'Disable Auto Voice Narration' : 'Enable Auto Voice Narration'}
              >
                <Sparkles size={13} />
                <span>Narrate</span>
              </button>

              {/* Playback Speed */}
              <select
                className="speed-select-drop"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                title="Simulation Playback Speed"
              >
                <option value="0.75">0.75x</option>
                <option value="1">1.0x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
              </select>

              {/* Theater Mode Toggle */}
              <button
                type="button"
                className={`btn-theater-mode ${isTheaterMode ? 'active' : ''}`}
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                title={isTheaterMode ? 'Exit Cinema Mode' : 'Enter Cinema Mode'}
              >
                {isTheaterMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
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

      {/* Deep Wiretap & Hex Stream Inspector Modal */}
      {showWiretapModal && (
        <div className="wiretap-modal-overlay" onClick={() => setShowWiretapModal(false)}>
          <div className="wiretap-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="wiretap-modal-header">
              <div className="wiretap-modal-title">
                <Binary size={18} className="wiretap-icon" />
                <div>
                  <h4>Deep Wiretap & Protocol Packet Inspector</h4>
                  <span className="wiretap-subtitle">
                    Step {currentStepIndex + 1}: {fromNode.label} → {toNode.label} ({activeStep.packet})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="wiretap-modal-close"
                onClick={() => setShowWiretapModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-tabs: Wire vs Hex vs SOP Matrix */}
            <div className="wiretap-nav-tabs">
              <button
                type="button"
                className={`wiretap-tab-btn ${wiretapTab === 'wire' ? 'active' : ''}`}
                onClick={() => setWiretapTab('wire')}
              >
                <Code2 size={13} />
                <span>HTTP Wire Traffic</span>
              </button>
              <button
                type="button"
                className={`wiretap-tab-btn ${wiretapTab === 'hex' ? 'active' : ''}`}
                onClick={() => setWiretapTab('hex')}
              >
                <Binary size={13} />
                <span>Hex Dump Stream</span>
              </button>
              <button
                type="button"
                className={`wiretap-tab-btn ${wiretapTab === 'sop' ? 'active' : ''}`}
                onClick={() => setWiretapTab('sop')}
              >
                <ShieldCheck size={13} />
                <span>SOP Origin Tuple Check</span>
              </button>
            </div>

            <div className="wiretap-modal-content">
              {wiretapTab === 'wire' && (
                <div className="wire-traffic-view">
                  <div className="wire-meta-row">
                    <span className="meta-badge-protocol">{telemetry?.protocol || 'HTTP/1.1'}</span>
                    <span className="meta-badge-method">{telemetry?.method || 'POST'}</span>
                    <span className="meta-badge-target">Destination: {toNode.sub || 'api.example.com'}</span>
                  </div>
                  <pre className="wire-code-block">
                    {rawWireString}
                  </pre>
                  {telemetry?.securityAction && (
                    <div className="wire-security-action-box">
                      <strong>Security Engine Assertion:</strong> {telemetry.securityAction}
                    </div>
                  )}
                </div>
              )}

              {wiretapTab === 'hex' && (
                <div className="hex-dump-view">
                  <div className="hex-table-header">
                    <span className="col-offset">OFFSET</span>
                    <span className="col-hex">HEXADECIMAL DUMP</span>
                    <span className="col-ascii">ASCII</span>
                  </div>
                  <div className="hex-lines-scroll">
                    {generateHexDump(rawWireString).map((row, i) => (
                      <div key={i} className="hex-line-row">
                        <span className="hex-offset">{row.offset}</span>
                        <span className="hex-bytes">{row.hex}</span>
                        <span className="hex-ascii">{row.ascii}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wiretapTab === 'sop' && (
                <div className="sop-tuple-view">
                  <p className="sop-intro-text">
                    Browser evaluates Same-Origin Policy against the request tuple (<strong>Scheme</strong>, <strong>Host</strong>, <strong>Port</strong>):
                  </p>
                  <table className="sop-tuple-table">
                    <thead>
                      <tr>
                        <th>Tuple Component</th>
                        <th>Origin A ({fromNode.label})</th>
                        <th>Origin B ({toNode.label})</th>
                        <th>Match?</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Scheme (Protocol)</strong></td>
                        <td><code>https:</code></td>
                        <td><code>https:</code></td>
                        <td className="match-yes">✅ Yes</td>
                      </tr>
                      <tr>
                        <td><strong>Host (Domain)</strong></td>
                        <td><code>{fromNode.sub || 'app.example.com'}</code></td>
                        <td><code>{toNode.sub || 'api.example.com'}</code></td>
                        <td className={fromNode.sub === toNode.sub ? 'match-yes' : 'match-no'}>
                          {fromNode.sub === toNode.sub ? '✅ Yes' : '❌ No (Cross-Origin)'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Port</strong></td>
                        <td><code>443</code></td>
                        <td><code>443</code></td>
                        <td className="match-yes">✅ Yes</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="sop-final-verdict-box">
                    <strong>Browser Action:</strong> {
                      isBlockedVerdict
                        ? '🚫 BLOCKED: Different origin without Access-Control-Allow-Origin header matching requester.'
                        : '✅ RELAXED BY CORS: Server headers explicitly authorize cross-origin read access.'
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
