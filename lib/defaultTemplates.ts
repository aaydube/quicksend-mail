import { EmailTemplate, UserProfile } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'Aayush Dubey',
  email: 'dubeyaayush019@gmail.com',
  phone: '+91 7678282879',
  portfolioUrl: 'https://github.com/aaydube',
  linkedinUrl: 'https://linkedin.com/in/aaydube',
  githubUrl: 'https://github.com/aaydube',
  resumeUrl: 'https://drive.google.com/file/d/1_AayushDubey_Resume/view',
  resumeFileName: 'Aayush_Resume.pdf',
  yearsOfExperience: 'CS Graduate (AI/ML)',
  primaryTechStack: 'Next.js, Python, RAG, LangChain, OAuth, Node.js, AI/ML'
};

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'software-dev-default',
    role: 'Software Developer',
    name: 'Software Developer Application',
    isDefault: true,
    subject: 'Applying for Software Developer | {my_name}',
    body: `{greeting},

I'm applying for the Software Developer position at {company}. I'm a Computer Science graduate specializing in AI/ML with production experience building full-stack and AI-powered applications.

A few things I've shipped recently:

- At Edufin Services, I built and launched a full-stack education consultancy platform and admin CRM in Next.js, integrating OAuth, OTP authentication, and payment processing end to end.
- During my internship at the National Informatics Centre, I developed a RAG-based chatbot using LangChain, applying strict guardrails that cut hallucinations by roughly 80%.
- Independently, I've built VoxHire, an AI mock-interview platform with sub-700ms voice latency, and AI Workflow Builder, a full-stack Next.js app with a visual node-execution canvas for automated marketing workflows, powered by Google Gemini and a custom RAG pipeline.

My resume is attached. I'd welcome the chance to talk about how I can contribute to your team.

Best regards,
{my_name}
{phone} | {email}
linkedin.com/in/aaydube | github.com/aaydube`
  },
  {
    id: 'ai-engineer-default',
    role: 'AI Engineer',
    name: 'AI Engineer Application',
    isDefault: true,
    subject: 'Applying for AI Engineer | {my_name}',
    body: `{greeting},

I'm applying for the AI Engineer position at {company}. I'm a Computer Science graduate specializing in AI/ML with production experience building full-stack and AI-powered applications.

A few things I've shipped recently:

- Developed a RAG-based chatbot using LangChain at the National Informatics Centre, applying strict guardrails that cut hallucinations by roughly 80%.
- Built VoxHire, an AI mock-interview platform with sub-700ms voice latency, and an AI Workflow Builder with a visual node-execution canvas powered by Google Gemini and custom RAG pipelines.
- Architected and launched full-stack applications integrating modern AI workflows with robust backend APIs.

My resume is attached. I'd welcome the chance to talk about how I can contribute to your team.

Best regards,
{my_name}
{phone} | {email}
linkedin.com/in/aaydube | github.com/aaydube`
  },
  {
    id: 'full-stack-default',
    role: 'Full Stack Developer',
    name: 'Full Stack Developer Application',
    isDefault: true,
    subject: 'Applying for Full Stack Developer | {my_name}',
    body: `{greeting},

I'm applying for the Full Stack Developer position at {company}. I'm a Computer Science graduate specializing in AI/ML with production experience building full-stack and AI-powered applications.

A few things I've shipped recently:

- At Edufin Services, I built and launched a full-stack education consultancy platform and admin CRM in Next.js, integrating OAuth, OTP authentication, and payment processing end to end.
- Independently, I've built AI Workflow Builder, a full-stack Next.js app with a visual node-execution canvas for automated workflows, powered by Google Gemini and custom backend services.
- Developed RAG-based chatbots and real-time voice latency AI platforms with high performance and responsive UIs.

My resume is attached. I'd welcome the chance to talk about how I can contribute to your team.

Best regards,
{my_name}
{phone} | {email}
linkedin.com/in/aaydube | github.com/aaydube`
  }
];
