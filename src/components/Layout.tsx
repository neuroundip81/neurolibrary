import { useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from './Toast';
import { useToast } from '@/hooks/useToast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

interface LayoutProps {
  children: ReactNode;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export default function Layout({ children, onSearchChange, searchValue = '' }: LayoutProps) {
  const location = useLocation();
  const { toasts, removeToast } = useToast();
  const { bookmarkCount } = useBookmarks();

  const handleSearchFocus = useCallback(() => {
    // Scroll to search section on home page
    if (location.pathname === '/') {
      const searchSection = document.getElementById('search-section');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.pathname]);

  useKeyboardShortcut({
    'Escape': () => {
      // Close modals handled by individual components
    },
  });

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar
        searchValue={searchValue}
        onSearchChange={onSearchChange || (() => {})}
        bookmarkCount={bookmarkCount}
        onSearchFocus={handleSearchFocus}
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
