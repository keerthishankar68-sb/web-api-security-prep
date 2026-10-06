import React, { useEffect, useState } from 'react';
import type { DiagramNode, DiagramStep } from '../types/question';
import { soundEffects } from '../utils/audioFx';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
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
  Lightbulb,
  BookOpen,
  Volume2,
  VolumeX,
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

// Helper to intelligently resolve node references to actual participant nodes
const resolveNodeInfo = (
  nodeRef: string,
  nodes: DiagramNode[],
  defaultIndex: number
): { node: DiagramNode; index: number } => {
  if (!nodes || nodes.length === 0) {
    const dummy: DiagramNode = { id: 'unknown', label: 'Entity', iconType: 'browser' };
    return { node: dummy, index: 0 };
  }

  // 1. Direct ID match
  const idx = nodes.findIndex(n => n.id === nodeRef);
  if (idx !== -1) return { node: nodes[idx], index: idx };

  // 2. Substring match on ID
  const lowerRef = (nodeRef || '').toLowerCase();
  const subIdx = nodes.findIndex(n => n.id.toLowerCase().includes(lowerRef) || lowerRef.includes(n.id.toLowerCase()));
  if (subIdx !== -1) return { node: nodes[subIdx], index: subIdx };

  // 3. Match on label or sub
  const labelIdx = nodes.findIndex(n =>
    n.label.toLowerCase().includes(lowerRef) ||
    (n.sub && n.sub.toLowerCase().includes(lowerRef)) ||
    lowerRef.includes(n.label.toLowerCase())
  );
  if (labelIdx !== -1) return { node: nodes[labelIdx], index: labelIdx };

  // 4. Role keywords
  if (lowerRef === 'server' || lowerRef.includes('srv') || lowerRef.includes('backend') || lowerRef.includes('api')) {
    const srvIdx = nodes.findIndex(n => n.iconType === 'server' || n.iconType === 'api' || n.label.toLowerCase().includes('server'));
    if (srvIdx !== -1) return { node: nodes[srvIdx], index: srvIdx };
  }
  if (lowerRef === 'browser' || lowerRef.includes('client') || lowerRef.includes('user')) {
    const cliIdx = nodes.findIndex(n => n.iconType === 'browser' || n.label.toLowerCase().includes('browser') || n.label.toLowerCase().includes('client'));
    if (cliIdx !== -1) return { node: nodes[cliIdx], index: cliIdx };
  }

  // 5. Fallback clamped index
  const safeIdx = Math.max(0, Math.min(nodes.length - 1, defaultIndex));
  return { node: nodes[safeIdx] || nodes[0], index: safeIdx };
};

export const VisualFlowView: React.FC<VisualFlowViewProps> = ({
  nodes,
  steps,
  interviewTakeaway,
  currentStepIndex,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showHeaders, setShowHeaders] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showWiretapModal, setShowWiretapModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [wiretapTab, setWiretapTab] = useState<'wire' | 'hex' | 'sop'>('wire');
  const [stepProgress, setStepProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyTakeaway = () => {
    if (interviewTakeaway) {
      navigator.clipboard.writeText(interviewTakeaway);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeStep = steps[currentStepIndex] || steps[0];
  const { node: fromNode, index: fromNodeIdx } = resolveNodeInfo(activeStep.from, nodes, 0);
  const { node: toNode, index: toNodeIdx } = resolveNodeInfo(activeStep.to, nodes, nodes.length - 1);

  const stepDurationMs = 4500 / playbackSpeed;

  // Sound toggle handler
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setEnabled(next);
    if (next) soundEffects.playTick();
  };

  // Play audio reaction on step change
  useEffect(() => {
    if (soundEnabled) {
      soundEffects.playDispatch();
      const isBlocked =
        activeStep.status === 'attack' ||
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

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
        soundEffects.playTick();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        soundEffects.playTick();
        onStepChange(Math.max(0, currentStepIndex - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        soundEffects.playTick();
        onStepChange(Math.min(steps.length - 1, currentStepIndex + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, steps.length, onStepChange]);

  const getNodeIcon = (iconType?: string) => {
    switch (iconType) {
      case 'key': return <Key size={18} />;
      case 'phone': return <Smartphone size={18} />;
      case 'shield': return <ShieldCheck size={18} />;
      case 'blocked': return <ShieldCheck size={18} />;
      case 'attacker': return <ShieldAlert size={18} />;
      case 'server': return <Server size={18} />;
      case 'database': return <Database size={18} />;
      case 'auth': return <Lock size={18} />;
      case 'api': return <Cpu size={18} />;
      case 'browser':
      default: return <Globe size={18} />;
    }
  };


  const telemetry = activeStep.telemetry;
  const isBlockedVerdict =
    activeStep.status === 'attack' ||
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
      {/* Step Selector Pills Bar */}
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

      {/* Main Grid: Left Stage (Sequence Diagram) + Right Insight Panels */}
      <div className="flow-split-grid">
        {/* Left Column: Interactive Sequence Diagram */}
        <div className="flow-stage-column">
          <div className="sequence-diagram-card">
            <div className="cyber-grid-mesh" />

            {/* Top Sequence Telemetry HUD */}
            <div className="sequence-hud-bar">
              <div className="sequence-route-info">
                <Radio size={13} className="pulse-icon broadcasting" />
                <span className="hud-label">SEQUENCE TRACE:</span>
                <span className="hud-entity-name">{fromNode.label}</span>
                <ArrowRight size={12} className="hud-arrow" />
                <span className="hud-entity-name highlight">{toNode.label}</span>
                <span className="hud-timecode">[T+{currentStepIndex * 75}ms]</span>
              </div>

              <div className="sequence-hud-actions">
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

            {/* Sequence Diagram Body */}
            <div className="sequence-diagram-canvas">
              {/* Participant Lifeline Columns Header */}
              <div className="sequence-participants-row" style={{ gridTemplateColumns: `repeat(${nodes.length}, 1fr)` }}>
                {nodes.map((node, nIdx) => {
                  const isNodeActive = nIdx === fromNodeIdx || nIdx === toNodeIdx;
                  const isSender = nIdx === fromNodeIdx;
                  const isReceiver = nIdx === toNodeIdx;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      className={`sequence-participant-column ${isNodeActive ? 'participant-active' : ''} ${isSelected ? 'participant-selected' : ''}`}
                      onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                      title={`Click to inspect security profile of ${node.label}`}
                    >
                      <div className={`participant-header-box ${node.iconType === 'attacker' ? 'attacker-box' : ''}`}>
                        <div className="participant-icon-pill">
                          {getNodeIcon(node.iconType)}
                        </div>
                        <div className="participant-meta">
                          <div className="participant-label">{node.label}</div>
                          {node.sub && <div className="participant-sub">{node.sub}</div>}
                        </div>
                        {isSender && <span className="participant-role-tag sender-tag">SENDING</span>}
                        {isReceiver && (
                          <span className={`participant-role-tag ${isBlockedVerdict ? 'blocked-tag' : 'receiver-tag'}`}>
                            {isBlockedVerdict ? 'BLOCKED' : 'VERIFYING'}
                          </span>
                        )}
                      </div>

                      {/* Vertical Lifeline Track Guide */}
                      <div className={`sequence-lifeline-track ${isNodeActive ? 'active-track' : ''}`} />
                    </div>
                  );
                })}
              </div>

              {/* Sequential Request / Response Step Rows */}
              <div className="sequence-messages-corridor">
                {steps.map((step, sIdx) => {
                  const isCurrent = sIdx === currentStepIndex;
                  const isPassed = sIdx < currentStepIndex;
                  const isFuture = sIdx > currentStepIndex;

                  const { index: stepFromIdx } = resolveNodeInfo(step.from, nodes, 0);
                  const { index: stepToIdx } = resolveNodeInfo(step.to, nodes, nodes.length - 1);

                  const totalCols = Math.max(1, nodes.length);
                  const colWidthPercent = 100 / totalCols;
                  const fromCenterPercent = (stepFromIdx + 0.5) * colWidthPercent;
                  const toCenterPercent = (stepToIdx + 0.5) * colWidthPercent;

                  const isLeftToRight = stepToIdx >= stepFromIdx;
                  const isSelfCall = stepFromIdx === stepToIdx;

                  const arrowLeft = Math.min(fromCenterPercent, toCenterPercent);
                  const arrowWidth = isSelfCall ? colWidthPercent * 0.45 : Math.abs(toCenterPercent - fromCenterPercent);

                  const stepBlocked = step.status === 'attack' ||
                    (step.telemetry?.statusBadge && step.telemetry.statusBadge.toLowerCase().includes('block'));

                  return (
                    <div
                      key={step.id}
                      className={`sequence-message-row ${isCurrent ? 'row-active' : ''} ${isPassed ? 'row-passed' : ''} ${isFuture ? 'row-future' : ''}`}
                      onClick={() => {
                        setIsPlaying(false);
                        soundEffects.playTick();
                        onStepChange(sIdx);
                      }}
                      title={`Click to jump to Step ${sIdx + 1}: ${step.label}`}
                    >
                      {/* Step Chrono Label */}
                      <div className="sequence-row-timestamp">
                        <span className="seq-num-badge">#{sIdx + 1}</span>
                        <span className="seq-time-text">T+{sIdx * 75}ms</span>
                      </div>

                      {/* Message Arrow Container */}
                      <div className="sequence-arrow-track">
                        {isSelfCall ? (
                          /* Loopback self-referential check arrow */
                          <div
                            className={`sequence-self-arrow ${isCurrent ? 'active' : ''} ${stepBlocked ? 'blocked' : ''}`}
                            style={{ left: `${fromCenterPercent}%` }}
                          >
                            <div className="self-loop-arc" />
                            <div className="seq-packet-banner self-banner">
                              <span className="seq-action-tag">SELF-EVAL</span>
                              <span className="seq-packet-text">{step.packet}</span>
                            </div>
                          </div>
                        ) : (
                          /* Inter-lifeline directional message arrow */
                          <div
                            className={`sequence-arrow-lane ${isCurrent ? 'active-lane' : ''} ${stepBlocked ? 'blocked-lane' : ''}`}
                            style={{
                              left: `${arrowLeft}%`,
                              width: `${arrowWidth}%`,
                            }}
                          >
                            {/* Directional Arrow Line */}
                            <div className={`sequence-vector-line ${isLeftToRight ? 'flow-right' : 'flow-left'}`}>
                              <div className="vector-stem" />
                              {isLeftToRight ? (
                                <div className="vector-head right-head" />
                              ) : (
                                <div className="vector-head left-head" />
                              )}

                              {/* Animated Photon Packet along active line */}
                              {isCurrent && (
                                <div
                                  className={`vector-photon-particle ${isLeftToRight ? 'slide-right' : 'slide-left'} ${stepBlocked ? 'blocked-particle' : ''}`}
                                  style={{ animationDuration: `${2.2 / playbackSpeed}s` }}
                                />
                              )}
                            </div>

                            {/* Message Payload & Method Badge */}
                            <div className="sequence-payload-card">
                              {step.telemetry?.method && (
                                <span className="seq-method-tag">{step.telemetry.method.split(' ')[0]}</span>
                              )}
                              <span className="seq-packet-label">{step.packet}</span>
                              {isCurrent && (
                                <button
                                  type="button"
                                  className="seq-inspect-chip-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowWiretapModal(true);
                                  }}
                                  title="Inspect wiretap"
                                >
                                  INSPECT
                                </button>
                              )}
                              {step.telemetry?.statusBadge && (
                                <span className={`seq-verdict-pill ${stepBlocked ? 'blocked' : 'allowed'}`}>
                                  {step.telemetry.statusBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Node Spec Drawer */}
            {selectedNode && (
              <div className="selected-node-inspector-drawer">
                <div className="inspector-drawer-header">
                  <div className="drawer-title-group">
                    <Info size={14} className="drawer-icon" />
                    <span className="drawer-title">Entity Security Spec: <strong>{selectedNode.label}</strong></span>
                    <span className="drawer-sub-badge">{selectedNode.sub || 'Host'}</span>
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
                        : 'Passive intermediary / observer in this step'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Telemetry & Deep Step Breakdown Console */}
            <div className="stage-deep-explanation-container">
              <div className="stage-deep-header">
                <div className="deep-title-group">
                  <Terminal size={14} className="terminal-icon" />
                  <span className="deep-title-label">Step Telemetry & Security Action</span>
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
                title="Restart sequence"
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
                <option value="2.0">2.0x</option>
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

          {interviewTakeaway && (
            <div className="flow-takeaway-banner">
              <div className="takeaway-banner-header">
                <span className="takeaway-badge">🎯 INTERVIEW GOLDEN TAKEAWAY</span>
                <button
                  type="button"
                  className="btn-copy-takeaway"
                  onClick={copyTakeaway}
                  title="Copy Interview Takeaway"
                >
                  <Copy size={13} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="takeaway-banner-text">{interviewTakeaway}</p>
            </div>
          )}
        </div>
      </div>

      {/* Wiretap Inspector Modal */}
      {showWiretapModal && (
        <div className="wiretap-modal-overlay" onClick={() => setShowWiretapModal(false)}>
          <div className="wiretap-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="wiretap-modal-header">
              <div className="modal-title-group">
                <Binary size={18} className="cyber-neon-icon" />
                <div>
                  <h3 className="modal-main-title">Wiretap Protocol Inspector</h3>
                  <p className="modal-sub-title">Live traffic frame analysis for step: {activeStep.label}</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowWiretapModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Wiretap Tabs Switcher */}
            <div className="wiretap-modal-tabs">
              <button
                type="button"
                className={'wiretap-tab-btn ' + (wiretapTab === 'wire' ? 'active' : '')}
                onClick={() => setWiretapTab('wire')}
              >
                <Terminal size={14} />
                <span>Raw HTTP Traffic</span>
              </button>
              <button
                type="button"
                className={'wiretap-tab-btn ' + (wiretapTab === 'hex' ? 'active' : '')}
                onClick={() => setWiretapTab('hex')}
              >
                <Binary size={14} />
                <span>Hex Dump (RFC Frame)</span>
              </button>
              <button
                type="button"
                className={'wiretap-tab-btn ' + (wiretapTab === 'sop' ? 'active' : '')}
                onClick={() => setWiretapTab('sop')}
              >
                <ShieldCheck size={14} />
                <span>SOP / CORS Policy</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="wiretap-modal-body">
              {wiretapTab === 'wire' && (
                <div className="raw-wire-container">
                  <div className="wire-code-header">
                    <span>HTTP/1.1 WIRE DISPATCH (SYN/ACK)</span>
                    <button
                      type="button"
                      className="btn-copy-wire"
                      onClick={() => {
                        navigator.clipboard.writeText(rawWireString);
                      }}
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="wire-code-block">
                    <code>{rawWireString}</code>
                  </pre>
                </div>
              )}

              {wiretapTab === 'hex' && (
                <div className="hexdump-container">
                  <div className="hexdump-header-row">
                    <span className="col-offset">OFFSET</span>
                    <span className="col-hex">HEX DATA (16 BYTES)</span>
                    <span className="col-ascii">ASCII</span>
                  </div>
                  <div className="hexdump-lines-box">
                    {generateHexDump(rawWireString).map((line, idx) => (
                      <div key={idx} className="hexdump-line">
                        <span className="col-offset">{line.offset}</span>
                        <span className="col-hex">{line.hex}</span>
                        <span className="col-ascii">{line.ascii}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wiretapTab === 'sop' && (
                <div className="sop-policy-container">
                  <div className="sop-card">
                    <h4>Same-Origin Policy (SOP) Context</h4>
                    <p>
                      The Same-Origin Policy isolates origins defined strictly by <code>Scheme + Host + Port</code>.
                      CORS (Cross-Origin Resource Sharing) selectively relaxes this sandbox when the server explicitely returns <code>Access-Control-Allow-Origin</code>.
                    </p>
                    <div className="policy-verdict-banner">
                      <span className="badge-label">Current Protocol State:</span>
                      <strong className="badge-value">{activeStep.packet}</strong>
                    </div>
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
