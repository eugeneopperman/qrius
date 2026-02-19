import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Label text displayed above the slider */
  label?: string;
  /** Current value to display next to label */
  showValue?: boolean;
  /** Unit suffix for the value display (e.g., '%', 'px') */
  unit?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Current value */
  value?: number;
  /** onChange callback with number value */
  onChange?: (value: number) => void;
  /** Show tick marks at min and max */
  showTicks?: boolean;
  /** Custom tick labels */
  tickLabels?: string[];
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      showValue = true,
      unit = '',
      min = 0,
      max = 100,
      step = 1,
      value = 0,
      onChange,
      showTicks = false,
      tickLabels,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const sliderId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(Number(e.target.value));
    };

    // Calculate the percentage for the gradient background
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={sliderId}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
            {showValue && (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {value}{unit}
              </span>
            )}
          </div>
        )}

        <input
          ref={ref}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={cn(
            'w-full h-2 rounded-lg appearance-none cursor-pointer',
            'bg-gray-200 dark:bg-gray-700',
            'accent-indigo-600 dark:accent-indigo-400',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-indigo-600',
            '[&::-webkit-slider-thumb]:dark:bg-indigo-400',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-indigo-600',
            '[&::-moz-range-thumb]:dark:bg-indigo-400',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            className
          )}
          style={{
            background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${percentage}%, rgb(229, 231, 235) ${percentage}%, rgb(229, 231, 235) 100%)`,
          }}
          {...props}
        />

        {showTicks && (
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            {tickLabels ? (
              tickLabels.map((label, i) => <span key={i}>{label}</span>)
            ) : (
              <>
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
