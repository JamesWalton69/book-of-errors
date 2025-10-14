
import React from 'react';

const Logo: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 15.5C14 14.1193 15.1193 13 16.5 13H19V11H16.5C13.4624 11 11 13.4624 11 16.5V18H13V16.5C13 15.6716 13.6716 15 14.5 15L14 15.5Z" fill="#f7768e"/>
    <path d="M10 8.5C10 9.88071 8.88071 11 7.5 11H5V13H7.5C10.5376 13 13 10.5376 13 7.5V6H11V7.5C11 8.32843 10.3284 9 9.5 9L10 8.5Z" fill="#7aa2f7"/>
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="#c0caf5" strokeWidth="1.5"/>
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-secondary p-3 flex items-center shadow-md z-10 border-b border-gray-700">
      <Logo />
      <h1 className="text-xl font-bold ml-3 text-text-primary tracking-wider">
        PyCode <span className="text-accent/80">Cloud IDE</span>
      </h1>
    </header>
  );
};
