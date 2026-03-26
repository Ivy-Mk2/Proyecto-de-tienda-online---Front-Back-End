import type { FC, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={{ width: 'min(520px, 90vw)' }}>
        <Card title={title} footer={<Button onClick={onClose}>Cerrar</Button>}>
          {children}
        </Card>
      </div>
    </div>
  );
};
