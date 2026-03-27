import type { FC, ReactNode } from 'react';
import { colors, radius, spacing, typography } from '../../styles/tokens';

type BadgeVariant = 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const backgroundByVariant: Record<BadgeVariant, string> = {
  info: '#e8f4ff',
  success: '#e9f9ef',
  warning: '#fff8e1',
  danger: '#fdecea',
};

const colorByVariant: Record<BadgeVariant, string> = {
  info: '#0b57d0',
  success: '#137333',
  warning: '#b06000',
  danger: colors.danger,
};

export const Badge: FC<BadgeProps> = ({ variant = 'info', children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: radius.pill,
      padding: `${spacing.xs} ${spacing.sm}`,
      backgroundColor: backgroundByVariant[variant],
      color: colorByVariant[variant],
      fontSize: typography.sizeSm,
      fontWeight: typography.weightMedium,
    }}
  >
    {children}
  </span>
);
