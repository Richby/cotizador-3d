import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
