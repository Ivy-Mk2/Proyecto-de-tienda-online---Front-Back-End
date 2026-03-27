import type { ButtonHTMLAttributes, CSSProperties, FC } from 'react';
import { colors, radius, spacing, typography } from '../../styles/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.secondary,
    border: `1px solid ${colors.primary}`,
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.text,
    border: `1px solid ${colors.border}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.text,
    border: `1px solid transparent`,
  },
  danger: {
    backgroundColor: colors.danger,
    color: colors.secondary,
    border: `1px solid ${colors.danger}`,
  },
};

export const Button: FC<ButtonProps> = ({ variant = 'primary', style, ...props }) => (
  <button
    {...props}
    style={{
      borderRadius: radius.sm,
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: typography.sizeMd,
      cursor: 'pointer',
      ...variantStyles[variant],
      ...style,
    }}
  />
);
