export type ForumPost = {
  id: string;
  moduleCode: string;
  author: string;
  role: "Student" | "Admin";
  age: string;
  body: string;
  edited?: boolean;
  pinned?: boolean;
  ownedByCurrentUser?: boolean;
};

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: "pinned-update",
    moduleCode: "MAT2611",
    author: "Course Administrator",
    role: "Admin",
    age: "2 hours ago",
    body: "Tutorial moved from 16:00 to 18:00 today. Please review the matrix-rank examples before the session.",
    pinned: true,
  },
  {
    id: "own-update",
    moduleCode: "MAT2611",
    author: "Preview student (You)",
    role: "Student",
    age: "45 minutes ago",
    body: "I am reviewing Section 1.4 before the next study block. The worked examples are helpful.",
    ownedByCurrentUser: true,
  },
  {
    id: "peer-update",
    moduleCode: "MAT2611",
    author: "Sipho M.",
    role: "Student",
    age: "15 minutes ago",
    body: "Shared notes for Gaussian elimination have been updated in the course resources.",
    edited: true,
  },
  {
    id: "reminder",
    moduleCode: "COS1511",
    author: "Lerato D.",
    role: "Student",
    age: "3 hours ago",
    body: "Reminder: the differential equations quiz opens tomorrow at 08:00.",
  },
];
