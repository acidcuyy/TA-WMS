import { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 0.5,
  ease = 'power2.out',
  splitType = 'chars', // Support 'chars' or 'words'
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const Tag = tag;

  // Manual splitting
  const parts = useMemo(() => {
    if (splitType === 'words') {
      return text.split(' ').map((word, i, arr) => word + (i === arr.length - 1 ? '' : ' '));
    }
    return text.split('');
  }, [text, splitType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useGSAP(() => {
    if (!inView || !containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.split-item');
    
    gsap.fromTo(items, 
      from,
      {
        ...to,
        delay: delay / 1000,
        stagger: 0.05,
        duration: duration,
        ease: ease,
        onComplete: onLetterAnimationComplete
      }
    );
  }, { scope: containerRef, dependencies: [inView] });

  return (
    <Tag
      ref={containerRef}
      className={`split-text-container ${className}`}
      style={{ 
        textAlign, 
        position: 'relative',
        display: 'block',
        margin: 0,
        padding: 0
      }}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          className="split-item"
          style={{ 
            display: 'inline-block',
            whiteSpace: 'pre', // Preserve spaces
            willChange: 'transform, opacity'
          }}
        >
          {part}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;
