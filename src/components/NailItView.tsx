import React from 'react';
import { Award, AlertTriangle, Cpu, Target, CheckCircle } from 'lucide-react';
import type { QuestionData } from '../types/question';

interface NailItViewProps {
  question: QuestionData;
}

export const NailItView: React.FC<NailItViewProps> = ({ question }) => {
  const { nailIt } = question;

  return (
    <div className="nail-it-container">
      <div className="nail-it-grid">
        {/* Card 1: What is happening */}
        <section className="nail-it-card under-the-hood">
          <div className="nail-it-card-header">
            <div className="nail-icon-wrap blue">
              <Cpu size={18} />
            </div>
            <h3>Under The Hood Mechanics</h3>
          </div>
          <p className="nail-it-text">{nailIt.whatIsHappening}</p>
        </section>

        {/* Card 2: Why Interviewers Ask This */}
        <section className="nail-it-card takeaway">
          <div className="nail-it-card-header">
            <div className="nail-icon-wrap emerald">
              <Target size={18} />
            </div>
            <h3>Why Interviewers Ask This</h3>
          </div>
          <p className="nail-it-text">{nailIt.interviewTakeaway}</p>
        </section>

        {/* Card 3: Common Traps */}
        <section className="nail-it-card traps">
          <div className="nail-it-card-header">
            <div className="nail-icon-wrap amber">
              <AlertTriangle size={18} />
            </div>
            <h3>Common Traps & Red Flags to Avoid</h3>
          </div>
          <ul className="nail-it-list">
            {nailIt.commonTraps.map((trap, idx) => (
              <li key={idx} className="trap-item">
                <span className="trap-bullet">✕</span>
                <span>{trap}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Card 4: Senior Differentiators */}
        <section className="nail-it-card senior">
          <div className="nail-it-card-header">
            <div className="nail-icon-wrap purple">
              <Award size={18} />
            </div>
            <h3>Senior Candidate Talking Points</h3>
          </div>
          <ul className="nail-it-list">
            {nailIt.seniorPoints.map((point, idx) => (
              <li key={idx} className="senior-item">
                <CheckCircle size={15} className="senior-check" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
