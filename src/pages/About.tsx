import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, animate, type Easing } from 'framer-motion';
import {
  Globe,
  ShieldCheck,
  Lightbulb,
  Users,
  BookOpen,
  TrendingUp,
  Download,
  Mail,
  Github,
  Zap,
  FileCode,
  Paintbrush,
  Layout,
  Smartphone,
  Database,
  Image,
} from 'lucide-react';

/* ─── easing tokens ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
// const easeSmooth = [0.4, 0, 0.2, 1] as [number, number, number, number];

/* ─── fade-up wrapper ─── */
function FadeUp({
  children,
  delay = 0,
  y = 30,
  duration = 0.7,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: easeOutExpo, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── count-up number ─── */
function AnimatedCounter({ target, suffix = '', duration = 1 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration,
        ease: 'easeOut' as Easing,
      });
      const unsub = rounded.on('change', (v) => setDisplay(Math.round(v)));
      return () => {
        controls.stop();
        unsub();
      };
    }
  }, [isInView, target, duration, count, rounded]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ─── value card data ─── */
const values = [
  {
    icon: Globe,
    title: 'Aksesibilitas',
    text: 'Mengurangi hambatan akses ke literatur neurologi berkualitas',
  },
  {
    icon: ShieldCheck,
    title: 'Kurasi Medis',
    text: 'Setiap buku dikurasi dan diverifikasi oleh dokter spesialis',
  },
  {
    icon: Lightbulb,
    title: 'Inovasi',
    text: 'Mengadopsi teknologi terkini untuk pengalaman belajar optimal',
  },
];

/* ─── team members data ─── */
const members = [
  {
    name: 'Dr. Andi Wijaya',
    title: 'Neurologi Klinis',
    institution: 'RSCM Jakarta',
    specialties: ['Stroke', 'Epilepsi'],
    initials: 'AW',
    gradient: 'from-[#0e7490] to-[#14b8a6]',
  },
  {
    name: 'Dr. Siti Rahayu',
    title: 'Neurofisiologi',
    institution: 'FKUI',
    specialties: ['EEG', 'EMG'],
    initials: 'SR',
    gradient: 'from-[#14b8a6] to-[#0e7490]',
  },
  {
    name: 'Dr. Budi Santoso',
    title: 'Neurochirurgi',
    institution: 'RS Pondok Indah',
    specialties: ['Tumor', 'Spine'],
    initials: 'BS',
    gradient: 'from-[#0e7490] to-[#0891b8]',
  },
  {
    name: 'Dr. Maya Lestari',
    title: 'Neuroimaging',
    institution: 'FK UGM',
    specialties: ['MRI', 'CT'],
    initials: 'ML',
    gradient: 'from-[#14b8a6] to-[#2dd4bf]',
  },
  {
    name: 'Dr. Rudi Hartono',
    title: 'Pediatri Neurologi',
    institution: 'RS Sardjito',
    specialties: ['Development', 'Epilepsi'],
    initials: 'RH',
    gradient: 'from-[#0891b8] to-[#0e7490]',
  },
  {
    name: 'Dr. Nina Sari',
    title: 'Neuro-onkologi',
    institution: 'Dharmais',
    specialties: ['Glioma', 'Meningioma'],
    initials: 'NS',
    gradient: 'from-[#0e7490] to-[#155e75]',
  },
];

/* ─── tech stack data ─── */
const techs = [
  {
    name: 'React 19',
    description: 'Framework UI modern dengan fitur terbaru',
    icon: Zap,
  },
  {
    name: 'TypeScript',
    description: 'Type safety untuk kode yang lebih handal',
    icon: FileCode,
  },
  {
    name: 'Tailwind CSS',
    description: 'Styling utility-first yang fleksibel',
    icon: Paintbrush,
  },
  {
    name: 'Vite',
    description: 'Build tool ultra-cepat untuk development',
    icon: Zap,
  },
  {
    name: 'shadcn/ui',
    description: 'Komponen UI yang dapat dikustomisasi',
    icon: Layout,
  },
  {
    name: 'PWA',
    description: 'Progressive Web App, installable di perangkat',
    icon: Smartphone,
  },
  {
    name: 'LocalStorage',
    description: 'Penyimpanan lokal untuk offline support',
    icon: Database,
  },
  {
    name: 'Canvas API',
    description: 'Rendering grafis performa tinggi',
    icon: Image,
  },
];

/* ─── stats data ─── */
const stats = [
  { icon: BookOpen, value: 150, suffix: '+', label: 'Buku Neurologi' },
  { icon: Users, value: 2.4, suffix: 'K', label: 'Pengguna Aktif', isDecimal: true },
  { icon: Download, value: 8.9, suffix: 'K', label: 'Total Unduhan', isDecimal: true },
  { icon: Globe, value: 32, suffix: '', label: 'Negara Terjangkau' },
];

/* ═══════════════════════════════════════════
   SECTION 1 — Mission Hero
   ═══════════════════════════════════════════ */
function MissionSection() {
  return (
    <section className="w-full bg-[#f0f9ff] px-4 sm:px-6 pt-16 pb-12 mt-8">
      <div className="max-w-[800px] mx-auto text-center">
        {/* Breadcrumb */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-[#64748b] mb-4"
        >
          <Link to="/" className="hover:text-[#0e7490] transition-colors">
            Beranda
          </Link>
          {' / '}
          <span className="text-[#0e7490]">Tentang</span>
        </motion.p>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="font-display font-bold text-[clamp(2rem,5vw,3rem)] text-[#164e63] leading-tight"
        >
          Misi Kami
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.3 }}
          className="w-[60px] h-[3px] bg-[#0e7490] mx-auto mt-6 rounded origin-center"
        />

        {/* Mission statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.5 }}
          className="text-[1.15rem] text-[#64748b] leading-[1.8] max-w-[600px] mx-auto mt-6"
        >
          NeuroLibrary hadir untuk mendemokratisasi akses ke literatur neurologi berkualitas tinggi.
          Kami percaya bahwa setiap praktisi medis dan mahasiswa kedokteran berhak mendapatkan
          sumber belajar terpercaya dalam bidang kedokteran saraf.
        </motion.p>

        {/* Value cards */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.7 + i * 0.15 }}
              className="flex flex-col items-center max-w-[240px] text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#f0f9ff] border border-[#cffafe] flex items-center justify-center text-[#0e7490]">
                <v.icon size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#164e63] mt-3">{v.title}</h3>
              <p className="text-sm text-[#64748b] mt-2">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 2 — Medical Advisory Board
   ═══════════════════════════════════════════ */
function MedicalBoardSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-12">
      <div className="bg-white border border-[#cffafe] rounded-2xl p-6 sm:p-8">
        {/* Section header */}
        <FadeUp y={20} duration={0.5}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={22} className="text-[#0e7490]" />
            <h2 className="font-display font-semibold text-[clamp(1.5rem,3vw,2.25rem)] text-[#164e63]">
              Dewan Medis
            </h2>
          </div>
          <p className="text-sm text-[#64748b]">
            Dikurasi oleh praktisi dan akademisi terkemuka di bidang neurologi.
          </p>
        </FadeUp>

        {/* Member grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {members.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: easeOutExpo, delay: i * 0.1 }}
              className="bg-white border border-[#cffafe] rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, ease: easeBounce }}
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}
                >
                  {m.initials}
                </motion.div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#164e63]">{m.name}</h3>
                  <p className="text-sm text-[#0e7490]">{m.title}</p>
                  <p className="text-[0.8rem] text-[#64748b]">{m.institution}</p>
                  {/* Specialty tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0f9ff] text-[#0e7490] text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 3 — Technology Stack
   ═══════════════════════════════════════════ */
function TechStackSection() {
  return (
    <section className="w-full mt-12 bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#14b8a6] px-4 sm:px-6 py-12">
      <div className="max-w-[800px] mx-auto text-center">
        <FadeUp y={20} duration={0.5}>
          <h2 className="font-display font-semibold text-[1.75rem] text-white">
            Dibangun dengan Teknologi Modern
          </h2>
          <p className="text-[0.95rem] text-white/80 mt-2">
            Kami menggunakan teknologi terkini untuk pengalaman yang cepat, aman, dan responsif.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {techs.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: easeOutExpo, delay: i * 0.08 }}
              whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.15)' }}
              className="bg-white/10 border border-white/20 rounded-xl p-5 text-left transition-colors duration-200"
            >
              <t.icon size={32} className="text-white" />
              <h3 className="text-base font-semibold text-white mt-3">{t.name}</h3>
              <p className="text-[0.8rem] text-white/70 mt-1">{t.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 4 — Impact Statistics
   ═══════════════════════════════════════════ */
function ImpactStatsSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-12">
      {/* Section header */}
      <FadeUp y={20} duration={0.5} className="text-center">
        <div className="flex items-center justify-center gap-2">
          <TrendingUp size={22} className="text-[#0e7490]" />
          <h2 className="font-display font-semibold text-[clamp(1.5rem,3vw,2.25rem)] text-[#164e63]">
            Dampak Kami
          </h2>
        </div>
      </FadeUp>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: easeOutExpo, delay: i * 0.15 }}
            className="bg-white border border-[#cffafe] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
          >
            {/* Icon circle */}
            <div className="w-16 h-16 rounded-full bg-[#f0f9ff] flex items-center justify-center mx-auto">
              <s.icon size={28} className="text-[#0e7490]" />
            </div>

            {/* Number */}
            <div className="mt-4 text-[clamp(2rem,4vw,3rem)] font-bold bg-gradient-to-r from-[#0e7490] to-[#14b8a6] bg-clip-text text-transparent">
              {s.isDecimal ? (
                <AnimatedCounter target={s.value} suffix={s.suffix} duration={1} />
              ) : (
                <AnimatedCounter target={s.value} suffix={s.suffix} duration={1} />
              )}
            </div>

            {/* Label */}
            <p className="text-base text-[#64748b] mt-2">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 5 — Contact CTA
   ═══════════════════════════════════════════ */
function ContactCTASection() {
  return (
    <section className="max-w-[600px] mx-auto px-4 sm:px-6 mt-12 mb-12 text-center">
      <FadeUp y={20} duration={0.5}>
        <h2 className="font-display font-semibold text-[1.75rem] text-[#164e63]">
          Punya Saran?
        </h2>
        <p className="text-base text-[#64748b] mt-3">
          Kami terbuka untuk masukan, koreksi, dan kolaborasi dari komunitas neurologi Indonesia.
        </p>
      </FadeUp>

      {/* Contact methods */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-6">
        <motion.a
          href="mailto:contact@neurolibrary.id"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 text-[#0e7490] hover:underline transition-all"
        >
          <Mail size={18} />
          <span className="text-sm font-medium">contact@neurolibrary.id</span>
        </motion.a>
        <motion.a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-2 text-[#0e7490] hover:underline transition-all"
        >
          <Github size={18} />
          <span className="text-sm font-medium">Open Source</span>
        </motion.a>
      </div>

      {/* Back to home button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#0e7490] text-white text-sm font-medium hover:bg-[#155e75] hover:scale-105 transition-all duration-200"
        >
          Jelajahi Katalog
        </Link>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN ABOUT PAGE
   ═══════════════════════════════════════════ */
export default function About() {
  return (
    <>
      <MissionSection />
      <MedicalBoardSection />
      <TechStackSection />
      <ImpactStatsSection />
      <ContactCTASection />
    </>
  );
}
