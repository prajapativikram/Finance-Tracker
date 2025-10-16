import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Your Personal AI Insight",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" />
      </head>
      <body className="font-sans min-h-dvh">
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Analytics />
          </ThemeProvider>
        </Suspense>

        <div id="n8n-chat" className="fixed bottom-4 right-4 z-[1000]"></div>

        <Script id="n8n-chat" strategy="afterInteractive">
          {`
            (async () => {
              try {
                console.log("[v0] n8n chat: starting init");
                (function ensureContainer() {
                  let el = document.querySelector('#n8n-chat');
                  if (!el) {
                    el = document.createElement('div');
                    el.id = 'n8n-chat';
                    el.style.position = 'fixed';
                    el.style.bottom = '16px';
                    el.style.right = '16px';
                    el.style.zIndex = '1000';
                    document.body.appendChild(el);
                  }
                })();

                const mod = await import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js');
                if (!mod || !mod.createChat) {
                  console.log("[v0] n8n chat: createChat not found on module", mod);
                  return;
                }
                mod.createChat({
                  webhookUrl: 'https://vikram9878.app.n8n.cloud/webhook/90f0993e-31ff-4523-8dbc-613465d12b64/chat',
                  target: '#n8n-chat',
                  mode: 'window'
                });
                console.log("[v0] n8n chat: initialized");
              } catch (err) {
                console.log("[v0] n8n chat: init error", err);
              }
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
