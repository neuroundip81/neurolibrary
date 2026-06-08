import { useState, useCallback, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import BookDetail from '@/pages/BookDetail';
import Bookmarks from '@/pages/Bookmarks';
import Profile from '@/pages/Profile';
import About from '@/pages/About';

const Admin = lazy(() => import('@/pages/Admin'));

function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f9ff]">
      <div className="w-10 h-10 border-4 border-[#cffafe] border-t-[#0e7490] rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <Routes>
      {/* Admin route - outside main Layout (has its own sidebar) */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminLoading />}>
            <Admin />
          </Suspense>
        }
      />
      {/* All other routes - wrapped in main Layout */}
      <Route
        path="*"
        element={
          <Layout searchValue={searchValue} onSearchChange={handleSearchChange}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </HelmetProvider>
  );
}
