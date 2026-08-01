export type RoleType = 'Software Developer' | 'AI Engineer' | 'Full Stack Developer' | 'Custom';

export type SalutationType = 
  | "Hi Ma'am/Sir" 
  | "Dear Ma'am/Sir" 
  | "Dear Hiring Manager" 
  | "Hi Hiring Manager" 
  | "Dear Hiring Team" 
  | "Hi Hiring Team" 
  | "Custom";

export interface EmailTemplate {
  id: string;
  role: RoleType;
  customRoleName?: string;
  name: string;
  subject: string;
  body: string;
  isDefault?: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  resumeFileName?: string;
  resumeFileDataUrl?: string;
  avatarUrl?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpHost?: string;
  smtpPort?: string;
  yearsOfExperience: string;
  primaryTechStack: string;
}

export interface ApplicationLog {
  id: string;
  timestamp: number;
  companyName: string;
  recipientEmail: string;
  role: string;
  managerName?: string;
  subject: string;
  body: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  notes?: string;
}

export interface BatchCompany {
  id: string;
  companyName: string;
  recipientEmail: string;
  managerName?: string;
  status: 'pending' | 'completed';
}
