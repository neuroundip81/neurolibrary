import { Brain, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#cffafe]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0e7490] to-[#14b8a6] flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-[#164e63]">
              Neuro<span className="text-[#0e7490]">Library</span>
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-[#64748b] hover:text-[#0e7490] transition-colors"
            >
              Beranda
            </Link>
            <Link
              to="/bookmarks"
              className="text-sm text-[#64748b] hover:text-[#0e7490] transition-colors"
            >
              Bookmark
            </Link>
            <Link
              to="/profile"
              className="text-sm text-[#64748b] hover:text-[#0e7490] transition-colors"
            >
              Profil
            </Link>
            <Link
              to="/about"
              className="text-sm text-[#64748b] hover:text-[#0e7490] transition-colors"
            >
              Tentang
            </Link>
          </nav>

          <p className="flex items-center gap-1 text-sm text-[#64748b]">
            Dibuat dengan <Heart size={14} className="text-[#ec4899] fill-[#ec4899]" /> untuk komunitas kedokteran saraf
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[#cffafe] text-center text-xs text-[#94a3b8]">
          &copy; {new Date().getFullYear()} NeuroLibrary. Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </footer>
  );
}
