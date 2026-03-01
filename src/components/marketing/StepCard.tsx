interface StepCardProps {
  step: number;
  title: string;
  description: string;
  className?: string;
}

export function StepCard({ step, title, description, className }: StepCardProps) {
  return (
    <div className={`text-center ${className ?? ''}`}>
      {/* Step number */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{
          backgroundColor: '#F97316',
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {step}
      </div>
      <h3
        className="mb-3"
        style={{
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#1A1A1A',
        }}
      >
        {title}
      </h3>
      <p
        className="max-w-xs mx-auto"
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: '#4A4A4A',
        }}
      >
        {description}
      </p>
    </div>
  );
}
