import React from 'react';

export default function ImobiliariaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { imobiliaria: string };
}) {
  return (
    <div className="imobiliaria-site-container">
      {children}
    </div>
  );
}

// Isso é opcional, mas ajuda a melhorar a experiência de desenvolvimento
export const dynamic = 'force-dynamic';
