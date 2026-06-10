// @ts-nocheck
import type { Category } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Stroke dan Pembuluh Darah (Serebrovaskular)', slug: 'stroke-dan-pembuluh-darah', description: 'Stroke, TIA, dan penyakit pembuluh darah otak', icon: 'HeartPulse', bookCount: 0, gradient: 'from-[#dc2626] to-[#ef4444]' },
  { id: '2', name: 'Neurointervensi', slug: 'neurointervensi', description: 'Prosedur intervensi minimal invasif pada sistem saraf', icon: 'Scan', bookCount: 0, gradient: 'from-[#0891b2] to-[#06b6d4]' },
  { id: '3', name: 'Neuroimaging', slug: 'neuroimaging', description: 'CT, MRI, fMRI, PET, SPECT, dan teknik pencitraan saraf', icon: 'ScanEye', bookCount: 0, gradient: 'from-[#7c3aed] to-[#8b5cf6]' },
  { id: '4', name: 'Neurootologi dan Neurooftalmologi', slug: 'neurootologi-dan-neurooftalmologi', description: 'Gangguan keseimbangan, vertigo, dan penyakit saraf mata', icon: 'Eye', bookCount: 0, gradient: 'from-[#059669] to-[#10b981]' },
  { id: '5', name: 'Nyeri (Ina Pain)', slug: 'nyeri', description: 'Manajemen nyeri kronis dan neuropati', icon: 'Flame', bookCount: 0, gradient: 'from-[#ea580c] to-[#f97316]' },
  { id: '6', name: 'Nyeri Kepala (Headache)', slug: 'nyeri-kepala', description: 'Migraine, tension headache, cluster headache', icon: 'CloudLightning', bookCount: 0, gradient: 'from-[#db2777] to-[#ec4899]' },
  { id: '7', name: 'Neurofisiologi Klinis (EEG, EMG, dll.)', slug: 'neurofisiologi-klinis', description: 'EEG, EMG, evoked potentials, nerve conduction study', icon: 'Activity', bookCount: 0, gradient: 'from-[#2563eb] to-[#3b82f6]' },
  { id: '8', name: 'Epilepsi dan EEG', slug: 'epilepsi-dan-eeg', description: 'Diagnosis, klasifikasi, dan manajemen epilepsi', icon: 'Zap', bookCount: 0, gradient: 'from-[#ca8a04] to-[#eab308]' },
  { id: '9', name: 'Sleep Disorders (Gangguan Tidur)', slug: 'sleep-disorders', description: 'Sleep apnea, insomnia, narcolepsy, RLS', icon: 'Moon', bookCount: 0, gradient: 'from-[#4f46e5] to-[#6366f1]' },
  { id: '10', name: 'Neurobehavior dan Fungsi Luhur', slug: 'neurobehavior-dan-fungsi-luhur', description: 'Perilaku, kognisi, memori, bahasa, fungsi eksekutif', icon: 'BrainCircuit', bookCount: 0, gradient: 'from-[#9333ea] to-[#a855f7]' },
  { id: '11', name: 'Movement Disorder (Gangguan Gerak / Parkinson)', slug: 'movement-disorder', description: 'Parkinson, Huntington, dystonia, tremor, ataxia', icon: 'PersonStanding', bookCount: 0, gradient: 'from-[#16a34a] to-[#22c55e]' },
  { id: '12', name: 'Neuroinfeksi (Infeksi Sistem Saraf)', slug: 'neuroinfeksi', description: 'Meningitis, encephalitis, neuro-HIV, neuro-TB', icon: 'ShieldAlert', bookCount: 0, gradient: 'from-[#b91c1c] to-[#dc2626]' },
  { id: '13', name: 'Neurogeriatri (Saraf Lansia)', slug: 'neurogeriatri', description: 'Demensia, Alzheimer, dan gangguan neurologi lansia', icon: 'Hourglass', bookCount: 0, gradient: 'from-[#78716c] to-[#a8a29e]' },
  { id: '14', name: 'Neuropediatri (Saraf Anak)', slug: 'neuropediatri', description: 'Epilepsi anak, cerebral palsy, gangguan perkembangan', icon: 'Baby', bookCount: 0, gradient: 'from-[#0d9488] to-[#14b8a6]' },
  { id: '15', name: 'Neuroonkologi (Tumor Sistem Saraf)', slug: 'neuroonkologi', description: 'Tumor otak, glioma, meningioma, metastasis', icon: 'AlertTriangle', bookCount: 0, gradient: 'from-[#be185d] to-[#db2777]' },
  { id: '16', name: 'Neurorestorasi dan Neuroengineering', slug: 'neurorestorasi-dan-neuroengineering', description: 'Rehabilitasi saraf, BCI, stimulasi saraf', icon: 'Cpu', bookCount: 0, gradient: 'from-[#0369a1] to-[#0ea5e9]' },
  { id: '17', name: 'Neurotrauma (Cedera Saraf & Otak)', slug: 'neurotrauma', description: 'TBI, cedera spinal, dan manajemen trauma neurologi', icon: 'Siren', bookCount: 0, gradient: 'from-[#991b1b] to-[#dc2626]' },
  { id: '18', name: 'Neurointensif (Kritis Neurologi)', slug: 'neurointensif', description: 'Status epilepticus, stroke akut, peningkatan TIK', icon: 'HeartPulse', bookCount: 0, gradient: 'from-[#7f1d1d] to-[#b91c1c]' },
  { id: '19', name: 'Neuroepidemiologi', slug: 'neuroepidemiologi', description: 'Distribusi dan frekuensi penyakit neurologi', icon: 'BarChart3', bookCount: 0, gradient: 'from-[#1d4ed8] to-[#3b82f6]' },
  { id: '20', name: 'Neurologi Dasar', slug: 'neurologi-dasar', description: 'Anatomi saraf, fisiologi, neuroanatomi', icon: 'BookOpen', bookCount: 0, gradient: 'from-[#0e7490] to-[#14b8a6]' },
  { id: '21', name: 'Kedokteran Dasar', slug: 'kedokteran-dasar', description: 'Biokimia, histologi, patologi anatomi', icon: 'GraduationCap', bookCount: 0, gradient: 'from-[#155e75] to-[#0e7490]' },
];

export const filterPills = [
  { label: 'Semua', slug: 'all' },
  ...categories.map((c) => ({ label: c.name, slug: c.slug })),
];
