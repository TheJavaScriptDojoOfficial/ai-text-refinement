import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title
}) => (
  <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40">
    {title && <h2 className="mb-3 text-sm font-semibold text-slate-100">{title}</h2>}
    {children}
  </section>
);

