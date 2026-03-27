import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { colors, radius, spacing, typography } from '../../styles/tokens';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        style={{
          width: '100%',
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          padding: spacing.sm,
          fontSize: typography.sizeMd,
          ...props.style,
        }}
      />
    );
  },
);
