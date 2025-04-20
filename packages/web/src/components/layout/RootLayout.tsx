import { Chatbot } from '@/components/support/Chatbot';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Header />
      
      <main className="flex-1">{children}</main>
      
      <Footer />
      
      <Chatbot />
      
      <Toaster />
    </ThemeProvider>
  );
} 