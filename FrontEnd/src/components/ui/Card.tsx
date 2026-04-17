import type { FC, ReactNode } from 'react';
import { colors, radius, spacing } from '../../styles/tokens';

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Card: FC<CardProps> = ({ title, children, footer }) => {
  return (
    <section
      style={{
        background: colors.secondary,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: spacing.lg,
      }}
    >
      {title ? <h3 style={{ marginBottom: spacing.md }}>{title}</h3> : null}
      <div>{children}</div>
      {footer ? <div style={{ marginTop: spacing.md }}>{footer}</div> : null}
    </section>
  );
};
