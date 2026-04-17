import type { FC } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

interface PageStatusProps {
  state: 'loading' | 'empty' | 'error';
  title: string;
  description: string;
  onRetry?: () => void;
}

export const PageStatus: FC<PageStatusProps> = ({ state, title, description, onRetry }) => {
  if (state === 'loading') {
    return (
      <Card title="Cargando...">
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          <div style={{ height: '14px', background: '#efefef', borderRadius: '6px' }} />
          <div style={{ height: '14px', background: '#efefef', borderRadius: '6px' }} />
          <div style={{ height: '14px', background: '#efefef', borderRadius: '6px', width: '70%' }} />
        </div>
      </Card>
    );
  }

  if (state === 'empty') {
    return (
      <Card title={title}>
        <p>{description}</p>
        <div style={{ marginTop: '0.8rem' }}>
          <Badge variant="warning">Estado vacío</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} footer={onRetry ? <Button onClick={onRetry}>Reintentar</Button> : null}>
      <p>{description}</p>
      <div style={{ marginTop: '0.8rem' }}>
        <Badge variant="danger">Error</Badge>
      </div>
    </Card>
  );
};
