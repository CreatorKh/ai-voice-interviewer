
import type { Transaction, CandidateProfile, Job } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn_1', name: 'John Doe', email: 'john.doe@example.com', amount: 250.00, status: 'Approved', date: '2024-07-29' },
  { id: 'txn_2', name: 'Jane Smith', email: 'jane.smith@example.com', amount: 150.75, status: 'Approved', date: '2024-07-29' },
  { id: 'txn_3', name: 'Robert Brown', email: 'robert.brown@example.com', amount: 500.00, status: 'Declined', date: '2024-07-28' },
  { id: 'txn_4', name: 'Emily White', email: 'emily.white@example.com', amount: 75.50, status: 'Pending', date: '2024-07-28' },
  { id: 'txn_5', name: 'Michael Green', email: 'michael.green@example.com', amount: 320.00, status: 'Approved', date: '2024-07-27' },
  { id: 'txn_6', name: 'Jessica Blue', email: 'jessica.blue@example.com', amount: 99.99, status: 'Approved', date: '2024-07-27' },
  { id: 'txn_7', name: 'David Black', email: 'david.black@example.com', amount: 1200.00, status: 'Pending', date: '2024-07-26' },
  { id: 'txn_8', name: 'Sarah Pink', email: 'sarah.pink@example.com', amount: 45.00, status: 'Approved', date: '2024-07-26' },
];

// FIX: Add missing constant exports
export const SYSTEM_PROMPT_TEMPLATE = `You are Zarina, a friendly and professional interviewer from Wind AI. Your goal is to conduct an effective and engaging technical interview with {CANDIDATE_NAME} for the {ROLE} position. The interview will be conducted in {LANGUAGE}.

Follow these steps:
1.  **Welcome and Introduction:** Start by warmly welcoming the candidate. Introduce yourself briefly and state the purpose of the interview: to assess their technical skills and experience for the {ROLE} role.
2.  **Begin Questioning:** Transition smoothly into the technical questions. Ask a mix of conceptual and practical questions relevant to the role.
3.  **Conversational Flow:** Maintain a conversational, not interrogational, tone. Listen to their answers carefully. You can ask follow-up questions to probe deeper into their knowledge.
4.  **Keep it Concise:** Keep your questions and responses relatively brief to keep the interview moving.
5.  **Conclusion:** After a few questions, thank the candidate for their time and explain the next steps in the hiring process.

Do not reveal that you are an AI. Begin the interview now.`;

export const MOCK_CANDIDATES: CandidateProfile[] = [
    {
        id: 1,
        name: 'Alice Johnson',
        role: 'Senior Fraud Analyst',
        match: 92,
        skills: ['KYC/AML', 'SQL', 'Risk Assessment', 'Data Analysis'],
    },
    {
        id: 2,
        name: 'Bob Williams',
        role: 'Data Scientist, Anti-Fraud',
        match: 88,
        skills: ['Python', 'Machine Learning', 'Tableau', 'Statistical Modeling'],
    },
    {
        id: 3,
        name: 'Charlie Brown',
        role: 'Junior Compliance Officer',
        match: 75,
        skills: ['Regulatory Research', 'Due Diligence', 'Policy Writing'],
    },
];

export const JOBS: Job[] = [
  { id: 1, title: 'Data Scientist', contract_type: 'Full-time', description: 'We are looking for a data scientist to help us build out our fraud detection models. You will be working with a team of engineers and product managers to build and deploy models that will be used by millions of users.', rate_min: 100, rate_max: 120, currency: 'USD', hired_this_month: 5, posted_days_ago: 3 },
  { id: 2, title: 'Software Engineer, Backend', contract_type: 'Full-time', description: 'We are looking for a backend engineer to help us build out our core infrastructure. You will be working with a team of engineers and product managers to build and deploy services that will be used by millions of users.', rate_min: 80, rate_max: 100, currency: 'USD', hired_this_month: 2, posted_days_ago: 7 },
  { id: 3, title: 'Frontend Engineer', contract_type: 'Part-time', description: 'We are looking for a frontend engineer to help us build out our core infrastructure. You will be working with a team of engineers and product managers to build and deploy services that will be used by millions of users.', rate_min: 60, rate_max: 80, currency: 'USD', hired_this_month: 1, posted_days_ago: 14 },
  { id: 4, title: 'Financial Forecaster', contract_type: 'Full-time', description: 'Analyzing financial data, developing forecasting models, and providing insights to support strategic decision-making.', rate_min: 105, rate_max: 140, currency: 'USD', hired_this_month: 8, posted_days_ago: 2 },
  { id: 5, title: 'Anti-Fraud Specialist', contract_type: 'Contract', description: 'Monitor transactions, investigate suspicious activities, and implement fraud prevention strategies.', rate_min: 70, rate_max: 95, currency: 'USD', hired_this_month: 12, posted_days_ago: 5 },
  { id: 6, title: 'Compliance Officer', contract_type: 'Full-time', description: 'Ensure the company adheres to legal standards and in-house policies. Responsible for enforcing regulations in all aspects and levels of business.', rate_min: 90, rate_max: 110, currency: 'USD', hired_this_month: 3, posted_days_ago: 20 },
  { id: 7, title: 'AI Ethics Researcher', contract_type: 'Part-time', description: 'Investigate the ethical implications of AI systems, develop guidelines, and contribute to responsible AI development.', rate_min: 50, rate_max: 75, currency: 'USD', hired_this_month: 0, posted_days_ago: 30 },
  { id: 8, title: 'Risk Analyst', contract_type: 'Contract', description: 'Identify and analyze potential risks to the organization\'s assets, earning capacity, or success.', rate_min: 65, rate_max: 85, currency: 'USD', hired_this_month: 6, posted_days_ago: 10 },
  { id: 9, title: 'Cybersecurity Analyst', contract_type: 'Full-time', description: 'Protect company hardware, software, and networks from cybercriminals. Monitor networks for security breaches.', rate_min: 95, rate_max: 130, currency: 'USD', hired_this_month: 4, posted_days_ago: 12 },
  { id: 10, title: 'SQL Specialist / DBA', contract_type: 'Contract', description: 'Deep expertise in SQL, database optimization, schema design, and performance tuning. PostgreSQL/MySQL focus.', rate_min: 90, rate_max: 150, currency: 'USD', hired_this_month: 2, posted_days_ago: 1 },
  { id: 11, title: 'Analytics Engineer (SQL Focused)', contract_type: 'Full-time', description: 'Bridge the gap between data engineering and data analysis. Strong SQL, DBT, and data modeling skills required.', rate_min: 110, rate_max: 160, currency: 'USD', hired_this_month: 6, posted_days_ago: 3 },
];
