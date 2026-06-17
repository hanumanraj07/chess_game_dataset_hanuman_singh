import React, { useState } from 'react';
import Button from './Button.jsx';

const MultiStepWizard = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const StepContent = steps[currentStep].component;

  return (
    <div className="brutal-card">
      {/* Wizard Header / Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: 'var(--border-thin)', paddingBottom: 'var(--space-3)' }}>
        {steps.map((step, idx) => (
          <div 
            key={idx}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: currentStep === idx ? 'var(--color-ink)' : 'var(--color-muted)',
              opacity: currentStep < idx ? 0.5 : 1
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: currentStep >= idx ? 'var(--color-green)' : 'transparent',
              color: currentStep >= idx ? 'var(--color-white)' : 'var(--color-ink)',
              border: '2px solid',
              borderColor: currentStep >= idx ? 'var(--color-green)' : 'var(--color-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {idx + 1}
            </div>
            <span className="hide-on-mobile">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div style={{ minHeight: '200px', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>{steps[currentStep].title}</h3>
        {StepContent}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: 'var(--border-thin)', paddingTop: 'var(--space-4)' }}>
        <Button 
          variant="secondary" 
          onClick={handleBack} 
          disabled={currentStep === 0}
        >
          BACK
        </Button>
        <Button 
          variant="primary" 
          onClick={handleNext}
        >
          {currentStep === steps.length - 1 ? 'FINISH' : 'NEXT'}
        </Button>
      </div>
    </div>
  );
};

export default MultiStepWizard;
