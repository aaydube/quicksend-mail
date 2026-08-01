import { EmailTemplate, UserProfile } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'Your Name',
  email: 'your.email@example.com',
  phone: '+1 (555) 019-2831',
  portfolioUrl: 'https://yourportfolio.dev',
  linkedinUrl: 'https://linkedin.com/in/yourprofile',
  githubUrl: 'https://github.com/yourusername',
  resumeUrl: '',
  resumeFileName: 'Resume.pdf',
  yearsOfExperience: 'Software Engineer',
  primaryTechStack: 'Next.js, React, Node.js, TypeScript, Python'
};

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'software-dev-default',
    role: 'Software Developer',
    name: 'Software Developer Application',
    isDefault: true,
    subject: 'Applying for {role} | {my_name}',
    body: `{greeting},

I'm writing to express my strong interest in the {role} position at {company}. I have hands-on experience designing, developing, and deploying scalable software solutions and full-stack applications.

A summary of my core background & achievements:

- **Full-Stack Development**: Experienced in modern web technologies including React, Next.js, Node.js, and TypeScript to build production-grade web applications.
- **Backend & APIs**: Skilled in designing robust RESTful APIs, database architectures, and secure user authentication systems.
- **Problem Solving**: Passionate about writing clean, maintainable code, optimizing system performance, and shipping high-impact features.

My resume is attached for your review. I would appreciate the opportunity to discuss how my skills align with your engineering goals at {company}.

Best regards,
{my_name}
{phone} | {email}
{linkedin} | {github}`
  },
  {
    id: 'ai-engineer-default',
    role: 'AI Engineer',
    name: 'AI Engineer Application',
    isDefault: true,
    subject: 'Applying for {role} | {my_name}',
    body: `{greeting},

I'm writing to express my strong interest in the {role} position at {company}. I specialize in building AI-powered applications, LLM workflows, RAG pipelines, and integrating intelligent features into full-stack products.

A summary of my core background & achievements:

- **AI & LLM Systems**: Hands-on experience developing Retrieval-Augmented Generation (RAG) applications, prompt engineering, and guardrail implementations.
- **Full-Stack AI Integration**: Skilled in connecting AI models (such as Google Gemini and OpenAI APIs) with high-performance frontend interfaces and Node.js/Python backends.
- **Voice & Latency Optimization**: Experienced in building low-latency, real-time voice and conversational AI platforms.

My resume is attached for your review. I would welcome the opportunity to discuss how my AI expertise can drive key initiatives at {company}.

Best regards,
{my_name}
{phone} | {email}
{linkedin} | {github}`
  },
  {
    id: 'full-stack-default',
    role: 'Full Stack Developer',
    name: 'Full Stack Developer Application',
    isDefault: true,
    subject: 'Applying for {role} | {my_name}',
    body: `{greeting},

I'm writing to express my strong interest in the {role} position at {company}. I bring end-to-end expertise in engineering intuitive frontends, scalable backend services, and cloud integrations.

A summary of my core background & achievements:

- **Frontend Excellence**: Proficient in React, Next.js, and modern CSS to build responsive, accessible, and high-performance user interfaces.
- **Backend Architecture**: Experienced with Node.js, Express, databases, and third-party API integrations (OAuth, payment gateways, background jobs).
- **Product Delivery**: Proven track record of shipping full-stack products from initial architecture design to production deployment.

My resume is attached for your review. I would love the chance to connect and explore how I can contribute to the team at {company}.

Best regards,
{my_name}
{phone} | {email}
{linkedin} | {github}`
  },
  {
    id: 'custom-role-default',
    role: 'Custom',
    name: 'Custom Role Application',
    isDefault: true,
    subject: 'Applying for {role} | {my_name}',
    body: `{greeting},

I'm writing to express my strong interest in the {role} position at {company}. I bring strong domain knowledge, technical expertise, and a track record of driving key engineering initiatives.

A summary of my core background & achievements:

- **Core Skills & Technical Expertise**: Hands-on experience executing end-to-end projects, adhering to software engineering best practices, and building reliable systems.
- **Cross-Functional Collaboration**: Proven ability to collaborate with product managers, designers, and engineering teams to ship features on time.
- **Continuous Learning & Growth**: Quick learner dedicated to adopting modern tools, frameworks, and workflows to solve complex challenges.

My resume is attached for your review. I would appreciate the opportunity to discuss how my experience as a {role} aligns with your team's goals at {company}.

Best regards,
{my_name}
{phone} | {email}
{linkedin} | {github}`
  }
];
