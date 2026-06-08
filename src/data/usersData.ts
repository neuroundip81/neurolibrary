export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  specialty: string;
  institution: string;
  avatar: string;
  joinDate: string;
  bookmarks: number[];
  readingHistory: { bookId: number; progress: number; lastRead: string }[];
}

export const allUsers: UserData[] = [
  {
    id: 'admin-1',
    name: 'Dr. Admin',
    email: 'admin@neurolibrary.id',
    password: 'YWRtaW4xMjM=', // base64 of 'admin123'
    role: 'admin',
    specialty: 'Neurologi Umum',
    institution: 'RSUD Dr. Soetomo',
    avatar: '',
    joinDate: '2024-01-15T08:00:00Z',
    bookmarks: [1, 2, 3],
    readingHistory: [
      { bookId: 1, progress: 100, lastRead: '2024-06-10T14:30:00Z' },
      { bookId: 2, progress: 75, lastRead: '2024-06-09T10:15:00Z' },
    ],
  },
  {
    id: 'user-1',
    name: 'Dr. User',
    email: 'user@neurolibrary.id',
    password: 'dXNlcjEyMw==', // base64 of 'user123'
    role: 'user',
    specialty: 'Neurologi Umum',
    institution: 'RSCM Jakarta',
    avatar: '',
    joinDate: '2024-02-20T10:30:00Z',
    bookmarks: [4, 5],
    readingHistory: [
      { bookId: 3, progress: 100, lastRead: '2024-06-08T09:00:00Z' },
      { bookId: 5, progress: 45, lastRead: '2024-06-10T16:45:00Z' },
    ],
  },
  {
    id: 'user-2',
    name: 'Oni',
    email: 'oni@neurolibrary.id',
    password: 'b25pMTIz', // base64 of 'oni123'
    role: 'user',
    specialty: 'Neurofisiologi',
    institution: 'Universitas Indonesia',
    avatar: '',
    joinDate: '2024-03-05T09:15:00Z',
    bookmarks: [6, 7, 8],
    readingHistory: [
      { bookId: 7, progress: 60, lastRead: '2024-06-11T08:30:00Z' },
      { bookId: 8, progress: 100, lastRead: '2024-06-07T14:00:00Z' },
    ],
  },
  {
    id: 'user-3',
    name: 'Azka',
    email: 'azka@neurolibrary.id',
    password: 'YXprYTEyMw==', // base64 of 'azka123'
    role: 'user',
    specialty: 'Neuroimaging',
    institution: 'Universitas Gadjah Mada',
    avatar: '',
    joinDate: '2024-03-12T11:00:00Z',
    bookmarks: [9, 10],
    readingHistory: [
      { bookId: 9, progress: 30, lastRead: '2024-06-11T10:00:00Z' },
      { bookId: 10, progress: 100, lastRead: '2024-06-05T11:30:00Z' },
    ],
  },
  {
    id: 'user-4',
    name: 'Devi',
    email: 'devi@neurolibrary.id',
    password: 'ZGV2aTEyMw==', // base64 of 'devi123'
    role: 'user',
    specialty: 'Neurologi Klinis',
    institution: 'Universitas Airlangga',
    avatar: '',
    joinDate: '2024-04-01T08:45:00Z',
    bookmarks: [11, 12],
    readingHistory: [
      { bookId: 11, progress: 85, lastRead: '2024-06-10T13:15:00Z' },
      { bookId: 12, progress: 100, lastRead: '2024-06-09T09:45:00Z' },
    ],
  },
  {
    id: 'user-5',
    name: 'Bio',
    email: 'bio@neurolibrary.id',
    password: 'YmlvMTIz', // base64 of 'bio123'
    role: 'user',
    specialty: 'Neuro-onkologi',
    institution: 'Universitas Padjadjaran',
    avatar: '',
    joinDate: '2024-04-18T13:20:00Z',
    bookmarks: [13, 14],
    readingHistory: [
      { bookId: 13, progress: 50, lastRead: '2024-06-11T07:30:00Z' },
      { bookId: 14, progress: 100, lastRead: '2024-06-08T15:00:00Z' },
    ],
  },
  {
    id: 'user-6',
    name: 'Youngky',
    email: 'youngky@neurolibrary.id',
    password: 'eW91bmdreTEyMw==', // base64 of 'youngky123'
    role: 'user',
    specialty: 'Pediatri Neurologi',
    institution: 'Universitas Hasanuddin',
    avatar: '',
    joinDate: '2024-05-01T07:30:00Z',
    bookmarks: [15, 1],
    readingHistory: [
      { bookId: 15, progress: 25, lastRead: '2024-06-11T11:00:00Z' },
      { bookId: 1, progress: 100, lastRead: '2024-06-06T10:00:00Z' },
    ],
  },
];

export const getUserDisplayData = () => {
  return allUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    joinDate: user.joinDate,
    specialization: user.specialty,
    institution: user.institution,
  }));
};
