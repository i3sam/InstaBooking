import './ScrollStack.css';

interface ScrollStackItemProps {
  children: React.ReactNode;
  itemClassName?: string;
}

export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollStack = ({ children, className = '' }: ScrollStackProps) => {
  return (
    <div className={`scroll-stack-container ${className}`.trim()}>
      {children}
    </div>
  );
};

export default ScrollStack;
