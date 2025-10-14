
import React from 'react';

const Logo: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#7aa2f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 14.5L12 12L7.5 14.5" stroke="#9ece6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V12" stroke="#7aa2f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 7L12 12" stroke="#7aa2f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7L12 12" stroke="#7aa2f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="flex items-center p-3 bg-secondary border-b border-gray-700 shadow-md flex-shrink-0">
      <Logo />
      <h1 className="text-xl font-bold ml-3 text-text-primary tracking-wider">PyForge IDE</h1>
      <span className="ml-2 text-xs text-accent bg-accent/20 px-2 py-0.5 rounded-full">Gemini Powered</span>
    </header>
  );
};
