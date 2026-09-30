import React from 'react';
import { Layers, Lightbulb } from 'lucide-react';

interface TakeawayCardsProps {
  whatIsHappening: string;
  interviewTakeaway: string;
}

export const TakeawayCards: React.FC<TakeawayCardsProps> = ({
  whatIsHappening,
  interviewTakeaway,
}) => {
  return (
    <div className="takeaway-cards-grid">
      {/* Card 1: What is happening? */}
      <div className="takeaway-card">
        <div className="takeaway-card-header">
          <div className="card-header-icon card-icon-blue">
            <Layers size={18} />
          </div>
          <h2 className="takeaway-card-title">What is happening?</h2>
        </div>
        <div className="takeaway-card-body">
          <p>{whatIsHappening}</p>
        </div>
      </div>

      {/* Card 2: Interview takeaway */}
      <div className="takeaway-card">
        <div className="takeaway-card-header">
          <div className="card-header-icon card-icon-amber">
            <Lightbulb size={18} />
          </div>
          <h2 className="takeaway-card-title">Interview Takeaway</h2>
        </div>
        <div className="takeaway-card-body">
          <p>
            Say this in an interview to demonstrate senior-level clarity and precision:
          </p>
          <div className="takeaway-highlight-quote">
            "{interviewTakeaway}"
          </div>
        </div>
      </div>
    </div>
  );
};
