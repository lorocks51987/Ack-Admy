import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js during export.
export default function HTML({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Link to PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon & Theme Color */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="theme-color" content="#05050A" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          input, textarea, select, [role="textbox"] {
            outline: none !important;
            box-shadow: none !important;
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
