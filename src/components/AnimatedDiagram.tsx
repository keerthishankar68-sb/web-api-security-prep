import React, { useEffect, useState, useRef } from 'react';
import type { DiagramNode, DiagramStep } from '../types/question';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
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
  Terminal,
  Info
} from 'lucide-react';

interface AnimatedDiagramProps {
  nodes: DiagramNode[];
  steps: DiagramStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export const AnimatedDiagram: React.FC<AnimatedDiagramProps> = ({
  nodes,
  steps,
  currentStepIndex,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [arcPath, setArcPath] = useState<string>('');
  const [packetPos, setPacketPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    if (!isPlaying) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsPlaying(false);
      return;
    }

    const intervalMs = 3800 / playbackSpeed;
    const timer = setInterval(() => {
      onStepChange((currentStepIndex + 1) % steps.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, steps.length, currentStepIndex, onStepChange]);

  useEffect(() => {
    if (!containerRef.current || !activeStep) return;

    const fromEl = containerRef.current.querySelector(`[data-node-id="${activeStep.from}"]`) as HTMLElement;
    const toEl = containerRef.current.querySelector(`[data-node-id="${activeStep.to}"]`) as HTMLElement;

    if (fromEl && toEl) {
      const cRect = containerRef.current.getBoundingClientRect();
      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      const x1 = fRect.left + fRect.width / 2 - cRect.left;
      const y1 = fRect.top + 34 - cRect.top;
      const x2 = tRect.left + tRect.width / 2 - cRect.left;
      const y2 = tRect.top + 34 - cRect.top;

      const midX = (x1 + x2) / 2;
      const distance = Math.abs(x2 - x1);
      const arcHeight = Math.max(50, Math.min(105, distance * 0.25));
      const peakY = Math.min(y1, y2) - arcHeight;

      const pathD = `M ${x1} ${y1} Q ${midX} ${peakY} ${x2} ${y2}`;
      setArcPath(pathD);
      setPacketPos({ x: midX, y: peakY + 8 });
    }
  }, [activeStep, currentStepIndex, nodes]);

  const getNodeIcon = (iconType?: string) => {
    switch (iconType) {
      case 'key': return <Key size={22} />;
      case 'phone': return <Smartphone size={22} />;
      case 'shield': return <ShieldCheck size={22} />;
      case 'blocked': return <ShieldCheck size={22} />;
      case 'attacker': return <ShieldAlert size={22} />;
      case 'server': return <Server size={22} />;
      case 'database': return <Database size={22} />;
      case 'auth': return <Lock size={22} />;
      case 'api': return <Cpu size={22} />;
      case 'browser':
      default: return <Globe size={22} />;
    }
  };

  const copyInterviewLine = () => {
    const interviewStep = steps.find((s) => s.isInterviewLine) || steps[steps.length - 1];
    navigator.clipboard.writeText(interviewStep.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inspectedNode = nodes.find((n) => n.id === inspectedNodeId);

  return (
    <div className="neo-simulator-deck">
      {/* Visual Step Phase Timeline */}
      <div className="phase-stepper-track">
        {steps.map((step, idx) => {
          const isPassed = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              className={`phase-node-pill ${isCurrent ? 'is-active' : isPassed ? 'is-done' : ''}`}
              onClick={() => {
                setIsPlaying(false);
                onStepChange(idx);
              }}
            >
              <span className="phase-pill-number">0{idx + 1}</span>
              <span className="phase-pill-name">{step.label}</span>
              {isPassed && <span className="phase-check-badge">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Futuristic Visual Stage */}
      <div className="neo-cyber-stage" ref={containerRef}>
        {/* Glow Circuit Background */}
        <div className="stage-cyber-grid" />

        {/* Dynamic Curved Laser Arc */}
        <svg className="stage-laser-overlay">
          <defs>
            <linearGradient id="neonLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {arcPath && (
            <path
              d={arcPath}
              fill="none"
              stroke="url(#neonLaserGrad)"
              strokeWidth="3.5"
              strokeDasharray="10,8"
              filter="url(#glowFilter)"
              className="traveling-laser-beam"
            />
          )}
        </svg>

        {/* Flying Packet Tag */}
        {packetPos.x > 0 && (
          <div
            className={`neon-packet-chip ${activeStep.status}`}
            style={{ left: `${packetPos.x}px`, top: `${packetPos.y}px` }}
          >
            <Zap size={13} className="packet-sparkle" />
            <span>{activeStep.packet}</span>
          </div>
        )}

        {/* Connecting Data Highway */}
        <div className="data-highway-line" />

        {/* 4 Interactive Node Cards */}
        <div className="nodes-isometric-cluster">
          {nodes.map((node, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isFrom = node.id === activeStep.from;
            const isTo = node.id === activeStep.to;
            const isLastNode = idx === 3;

            return (
              <div
                key={node.id}
                data-node-id={node.id}
                className="isometric-node-column"
                onClick={() => setInspectedNodeId(inspectedNodeId === node.id ? null : node.id)}
              >
                {/* Step 4 Key Punchline Beacon */}
                {isLastNode && (
                  <div className={`gold-takeaway-beacon ${currentStepIndex === 3 ? 'active-glow' : ''}`}>
                    <Sparkles size={11} />
                    <span>Core Security Verdict</span>
                  </div>
                )}

                {/* Pipeline Checkpoint Beacon */}
                <div className={`checkpoint-beacon ${isCompleted ? 'charged' : ''} ${isCurrent ? 'pulsing' : ''}`} />

                {/* Glassmorphic Node Enclosure */}
                <div
                  className={`node-cyber-enclosure ${isCurrent ? 'current-active' : ''} ${isFrom ? 'is-source' : ''} ${isTo ? 'is-target' : ''} ${node.iconType === 'attacker' ? 'threat-host' : ''}`}
                  title="Click to inspect node protocol telemetry"
                >
                  <div className="node-avatar-halo">
                    {getNodeIcon(node.iconType)}
                  </div>
                  <div className="node-label-wrap">
                    <span className="node-primary-title">{node.label}</span>
                    {node.sub && <span className="node-secondary-sub">{node.sub}</span>}
                  </div>
                  <div className="node-inspect-hint">
                    <Info size={11} />
                    <span>Inspect</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Node Telemetry Inspector Drawer */}
        {inspectedNode && (
          <div className="node-inspector-drawer">
            <div className="drawer-header">
              <div className="drawer-title">
                <Terminal size={14} />
                <span>Node Telemetry: {inspectedNode.label}</span>
              </div>
              <button className="drawer-close-btn" onClick={() => setInspectedNodeId(null)}>✕</button>
            </div>
            <div className="drawer-body">
              <p><strong>Context:</strong> {inspectedNode.sub || 'Security boundary endpoint'}</p>
              <p><strong>Active Protocol Action:</strong> {activeStep.packet}</p>
            </div>
          </div>
        )}

        {/* Step Caption Callout Box */}
        <div className={`cyber-step-callout ${activeStep.status}`}>
          <div className="callout-header-strip">
            <span className="step-badge-indicator">STEP 0{currentStepIndex + 1}</span>
            <span className="step-classification">
              {activeStep.status === 'attack' ? '⚠️ Exploit Execution' : activeStep.status === 'defense' ? '🛡️ Defensive Verification' : '⚡ State Transition'}
            </span>
            {currentStepIndex === 3 && (
              <button className="copy-verdict-btn" onClick={copyInterviewLine}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Verdict'}</span>
              </button>
            )}
          </div>
          <p className="callout-caption-text">{activeStep.caption}</p>
        </div>
      </div>

      {/* Cyber Scrubber Deck */}
      <div className="cyber-control-deck">
        <div className="deck-playback-group">
          <button
            className="neon-play-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          </button>

          <button
            className="deck-arrow-btn"
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.max(0, currentStepIndex - 1));
            }}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            className="deck-arrow-btn"
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.min(steps.length - 1, currentStepIndex + 1));
            }}
            disabled={currentStepIndex === steps.length - 1}
          >
            <ChevronRight size={18} />
          </button>

          <button
            className="deck-restart-btn"
            onClick={() => {
              onStepChange(0);
              setIsPlaying(true);
            }}
          >
            <RotateCcw size={13} />
            <span>Restart</span>
          </button>
        </div>

        <div className="deck-range-group">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange(parseInt(e.target.value, 10));
            }}
            className="cyber-range-slider"
          />
        </div>

        <div className="deck-speed-group">
          <span className="speed-tag">Pace:</span>
          {[1, 1.5, 2].map((spd) => (
            <button
              key={spd}
              className={`speed-button-pill ${playbackSpeed === spd ? 'is-active' : ''}`}
              onClick={() => setPlaybackSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
