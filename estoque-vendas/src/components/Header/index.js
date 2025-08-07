import React from 'react';

export default function Header({ title, children }) {
  return (
    <header className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </header>
  );
}
