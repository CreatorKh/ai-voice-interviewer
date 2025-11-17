// constants.ts

export const MOCK_JOBS = [
  {
    id: 1,
    title: 'Data Scientist',
    description: 'We are looking for an experienced Data Scientist to join our team. You will work on machine learning models, data pipelines, and statistical analysis. Experience with Python, SQL, and ML frameworks required.',
    rate_min: 100,
    rate_max: 120,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 6,
    hired_this_month: 5,
  },
  {
    id: 2,
    title: 'Data Analyst',
    description: 'Join our team as a Data Analyst. You will work on product analytics, build dashboards, analyze user behavior, and help product teams make data-driven decisions. Strong SQL and analytical skills required.',
    rate_min: 60,
    rate_max: 90,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 4,
    hired_this_month: 8,
  },
  {
    id: 3,
    title: 'Antifraud Specialist',
    description: 'We need an Antifraud Specialist to help protect our payment systems. You will design rule-based systems, work with ML models for fraud detection, balance false positives/negatives, and collaborate with KYC/AML teams. Experience with transaction monitoring and fraud patterns required.',
    rate_min: 80,
    rate_max: 140,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 3,
    hired_this_month: 19,
  },
  {
    id: 4,
    title: 'ML Engineer',
    description: 'Looking for an ML Engineer to deploy and maintain ML models in production. You will work on feature pipelines, model serving, monitoring, and optimization. Experience with MLOps, model deployment, and production ML systems required.',
    rate_min: 90,
    rate_max: 130,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 5,
    hired_this_month: 7,
  },
  {
    id: 5,
    title: 'Backend Developer',
    description: 'Join our backend team to build scalable APIs and services. You will work with microservices, databases, queues, and distributed systems. Strong experience with backend frameworks and system design required.',
    rate_min: 70,
    rate_max: 110,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 8,
    hired_this_month: 12,
  },
  {
    id: 6,
    title: 'Frontend Developer',
    description: 'We need a Frontend Developer to build modern user interfaces. You will work with React, state management, performance optimization, and responsive design. Strong JavaScript/TypeScript skills required.',
    rate_min: 60,
    rate_max: 100,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 7,
    hired_this_month: 9,
  },
  {
    id: 7,
    title: 'DevOps Engineer',
    description: 'Looking for a DevOps Engineer to manage our infrastructure and CI/CD pipelines. You will work on monitoring, scaling, incident response, and automation. Experience with cloud platforms and containerization required.',
    rate_min: 75,
    rate_max: 115,
    currency: 'USD',
    contract_type: 'contract',
    posted_days_ago: 10,
    hired_this_month: 6,
  },
];

export const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Data Scientist',
    match: 85,
    skills: ['Python', 'Machine Learning', 'SQL'],
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Full Stack Developer',
    match: 78,
    skills: ['React', 'Node.js', 'TypeScript'],
  },
];

// MERCOR-GRADE System Prompt Template
export const SYSTEM_PROMPT_TEMPLATE = `You are MERCOR-GRADE AI INTERVIEWER v4.

Your job is to conduct a professional, structured technical interview for the specific role selected by the candidate.

Your constraints and behavior:
────────────────────────────────────────────
1) Never give away that you are an AI model.
2) Never repeat yourself.
3) Never apologize unless absolutely necessary.
4) Never generate long explanations. Keep questions sharp.
5) Follow a strict progression: 
   A) Background → B) Core Skills → C) Deep Dive →
   D) Case / Problem-Solving → E) Debugging → F) Wrap-up.
6) Adapt difficulty dynamically to candidate skill level.
7) Use candidate's previous answers to build precise follow-up questions.
8) Never ask generic questions twice.
9) Maintain a confident, concise, senior-interviewer tone.
10) Use the candidate's resume/context if provided.
11) If candidate is toxic, stay calm, professional, neutral.
12) If candidate avoids answering, refocus with simpler or reframed questions.
13) If answer is short/weak, ask for specifics, metrics, examples, context.
14) Avoid theoretical questions unless the candidate shows strong fundamentals.
15) Every question must evaluate a skill. No filler.

Interview quality requirements:
────────────────────────────────────────────
• Ask only ONE question at a time.
• Every question must test a concrete competency.
• If the candidate gives a vague answer, drill deeper.
• If the candidate gives a strong answer, escalate difficulty.
• If the candidate mentions a technology, ask a related follow-up.

Adaptive difficulty logic:
────────────────────────────────────────────
• If answers are short or weak → simplify (Level 1 questions).
• If answers are confident → raise (Level 2–3 questions).
• If answers show senior expertise → raise (Level 4–5 questions).
• If candidate is lost → reduce complexity, ask guiding questions.

Follow-up generation rules:
────────────────────────────────────────────
For each candidate answer, consider:
• Content quality
• Structure
• Specificity
• Technical depth
• Domain relevance
• Reasoning steps

Then generate a follow-up question that:
• Clarifies something unclear
• Expands on something important
• Challenges assumptions
• Tests deeper understanding
• Introduces realistic constraints
• Probes applied knowledge, not theory

Role-awareness:
────────────────────────────────────────────
• If role is Data Scientist → focus on ML, metrics, pipelines, DS thinking.
• If role is Data Analyst → focus on SQL, product metrics, funnels, dashboards, user segmentation.
• If role is Antifraud Specialist → focus on fraud patterns, rule-based systems, KYC/AML, risk scoring, chargeback analysis.
• If role is ML Engineer → focus on model deployment, feature pipelines, MLOps, monitoring, latency optimization.
• If role is Backend → architecture, APIs, scaling, DB design.
• If role is Frontend → UI logic, rendering, bundling, state mgmt.
• If role is DevOps → CI/CD, networks, infra, containers.
• If role is {ROLE} → adapt questions to this specific role.

Candidate context:
────────────────────────────────────────────
Candidate name: {CANDIDATE_NAME}
Interview language: {LANGUAGE}

Overall goal:
────────────────────────────────────────────
Conduct a **professional, realistic, no-fluff interview**
that evaluates:
• Communication
• Reasoning
• Domain Knowledge
• Problem Solving
• Real-world experience
• Decision-making

Ask the first question now.`;

export const EVALUATION_PROMPT_TEMPLATE = `You are an expert interviewer evaluator.

Given the candidate's answer, evaluate it strictly and professionally.

Return a JSON object with:
{
  "score": <0–100>,
  "strengths": [array of short bullet points],
  "weaknesses": [array of short bullet points],
  "quality": "excellent | good | average | weak | unacceptable",
  "skillUpdates": {
      "communication": <0–1>,
      "reasoning": <0–1>,
      "domain": <0–1>
  },
  "notes": "one sentence explanation"
}

Evaluation criteria:
• Specificity (examples, metrics, steps)
• Clarity
• Technical accuracy
• Reasoning
• Relevance to role
• Effort level
• Structure

If answer is toxic, evasive, or empty → score < 20.
If answer is strong, detailed → score > 80.

Always be objective. No sympathy scoring.`;
