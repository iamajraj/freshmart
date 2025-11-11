import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = 'min-h-screen bg-gray-50' }: PageLayoutProps) {
  return (
    <div className={className}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
