import React from 'react';
import type { DiagramStep } from '../types/question';
import { ChevronRight } from 'lucide-react';

interface StepTimelineProps {
  steps: DiagramStep[];
  currentStepIndex: number;
  onSelectStep: (idx: number) => void;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  return (
    <div className="step-timeline-container">
      <div className="step-timeline-label">
        <span>Step Flow Progression</span>
        <span>{currentStepIndex + 1} of {steps.length}</span>
      </div>
      <div className="step-pills-row">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const statusClass = `status-${step.status}`;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={`step-pill ${statusClass} ${isActive ? 'active' : ''}`}
                onClick={() => onSelectStep(idx)}
                aria-label={`Step ${idx + 1}: ${step.label}`}
              >
                <span className="pill-status-dot" />
                <span>{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight size={14} className="step-arrow-divider" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
