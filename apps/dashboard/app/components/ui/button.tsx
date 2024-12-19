import * as React from 'react';
import { classNames } from './utilities';

import styles from './button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'PRIMARY' | 'SECONDARY';
  isDisabled?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ theme = 'PRIMARY', isDisabled, children, ...rest }) => {
  let className = classNames(styles.root, styles.primary);

  if (theme === 'SECONDARY') {
    className = classNames(styles.root, styles.secondary);
  }

  if (isDisabled) {
    className = classNames(styles.root, styles.disabled);

    return <div className={className}>{children}</div>;
  }

  return (
    <button className={className} role="button" tabIndex={0} disabled={isDisabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;