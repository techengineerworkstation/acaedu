import 'framer-motion';

declare module 'framer-motion' {
  export interface MotionProps {
    variants?: {
      hidden?: Record<string, any>;
      visible?: Record<string, any>;
    };
    initial?: string | Record<string, any>;
    animate?: string | Record<string, any>;
    exit?: string | Record<string, any>;
    whileHover?: Record<string, any>;
    whileTap?: Record<string, any>;
    whileFocus?: Record<string, any>;
    whileInView?: Record<string, any>;
    transition?: any;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode;
    key?: string | number;
  }

  export interface HTMLMotionProps<T> extends React.HTMLAttributes<T>, MotionProps {
    // Allow any HTML element
  }

  export const motion: {
    div: React.FC<HTMLMotionProps<'div'>>;
    span: React.FC<HTMLMotionProps<'span'>>;
    button: React.FC<HTMLMotionProps<'button'>>;
    a: React.FC<HTMLMotionProps<'a'>>;
    p: React.FC<HTMLMotionProps<'p'>>;
    h1: React.FC<HTMLMotionProps<'h1'>>;
    h2: React.FC<HTMLMotionProps<'h2'>>;
    h3: React.FC<HTMLMotionProps<'h3'>>;
    h4: React.FC<HTMLMotionProps<'h4'>>;
    li: React.FC<HTMLMotionProps<'li'>>;
    ul: React.FC<HTMLMotionProps<'ul'>>;
    section: React.FC<HTMLMotionProps<'section'>>;
    nav: React.FC<HTMLMotionProps<'nav'>>;
    main: React.FC<HTMLMotionProps<'main'>>;
    header: React.FC<HTMLMotionProps<'header'>>;
    footer: React.FC<HTMLMotionProps<'footer'>>;
    article: React.FC<HTMLMotionProps<'article'>>;
    aside: React.FC<HTMLMotionProps<'aside'>>;
    form: React.FC<HTMLMotionProps<'form'>>;
    input: React.FC<HTMLMotionProps<'input'>>;
    label: React.FC<HTMLMotionProps<'label'>>;
    img: React.FC<HTMLMotionProps<'img'>>;
    svg: React.FC<HTMLMotionProps<'svg'>>;
    tr: React.FC<HTMLMotionProps<'tr'>>;
    td: React.FC<HTMLMotionProps<'td'>>;
    th: React.FC<HTMLMotionProps<'th'>>;
    tbody: React.FC<HTMLMotionProps<'tbody'>>;
    thead: React.FC<HTMLMotionProps<'thead'>>;
    table: React.FC<HTMLMotionProps<'table'>>;
  };

  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    mode?: 'sync' | 'popLayout' | 'wait';
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
}
