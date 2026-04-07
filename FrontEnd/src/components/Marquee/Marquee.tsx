import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Marquee.module.css';

type MarqueeProps = {
  text: string;
  speed?: number;
  className?: string;
};

const MIN_COPIES = 4;
const EXTRA_COPIES = 2;

const Marquee = ({ text, speed = 18, className = '' }: MarqueeProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [copies, setCopies] = useState(MIN_COPIES);

  useEffect(() => {
    const container = containerRef.current;
    const sample = measureRef.current;

    if (!container || !sample) return;

    const updateCopies = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const sampleWidth = sample.getBoundingClientRect().width;

      if (!containerWidth || !sampleWidth) {
        setCopies(MIN_COPIES);
        return;
      }

      const requiredCopies = Math.ceil(containerWidth / sampleWidth) + EXTRA_COPIES;
      setCopies(Math.max(MIN_COPIES, requiredCopies));
    };

    updateCopies();

    const observer = new ResizeObserver(updateCopies);
    observer.observe(container);
    observer.observe(sample);

    return () => observer.disconnect();
  }, [text]);

  const repeatedItems = useMemo(
    () =>
      Array.from({ length: copies }, (_, index) => (
        <span key={`marquee-${text}-${index}`} className={styles.item} aria-hidden="true">
          {text}
        </span>
      )),
    [copies, text],
  );

  return (
    <div className={`${styles.marquee} ${className}`.trim()} ref={containerRef}>
      <span className={styles.measure} ref={measureRef} aria-hidden="true">
        {text}
      </span>

      <div className={styles.track} style={{ animationDuration: `${speed}s` }}>
        {repeatedItems}
      </div>
      <div className={styles.track} style={{ animationDuration: `${speed}s` }} aria-hidden="true">
        {repeatedItems}
      </div>
    </div>
  );
};

export default Marquee;
