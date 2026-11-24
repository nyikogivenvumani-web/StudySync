export type UserRole = "student" | "admin";
export type InstitutionType = "College" | "University";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: UserRole;
  institution_type?: InstitutionType | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
