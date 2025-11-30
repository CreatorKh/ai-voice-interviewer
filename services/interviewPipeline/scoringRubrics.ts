// scoringRubrics.ts - Критерии оценки ответов для точного скоринга

export interface ScoringCriteria {
  skill: string;
  weight: number; // 0-1, сумма всех весов = 1
  indicators: {
    excellent: string[];   // 80-100 баллов
    good: string[];        // 60-79 баллов
    average: string[];     // 40-59 баллов
    weak: string[];        // 20-39 баллов
    poor: string[];        // 0-19 баллов
  };
  redFlags: string[];      // Автоматическое снижение до 0-20
  bonusIndicators: string[]; // +10-20 баллов
}

export interface RoleRubric {
  role: string;
  skills: ScoringCriteria[];
  generalCriteria: {
    communication: ScoringCriteria;
    problemSolving: ScoringCriteria;
    technicalDepth: ScoringCriteria;
  };
}

// ============ УНИВЕРСАЛЬНЫЕ КРИТЕРИИ ============

export const UNIVERSAL_CRITERIA = {
  communication: {
    skill: "Communication",
    weight: 0.2,
    indicators: {
      excellent: [
        "Структурированный ответ с четким введением и заключением",
        "Использует профессиональную терминологию корректно",
        "Отвечает на вопрос напрямую, без уклонений",
        "Приводит конкретные примеры из опыта",
        "Объясняет сложные концепции просто"
      ],
      good: [
        "Логичная структура ответа",
        "Понятное изложение мыслей",
        "Приводит примеры",
        "Использует терминологию уместно"
      ],
      average: [
        "Ответ в целом понятен",
        "Есть некоторая структура",
        "Примеры общие или абстрактные"
      ],
      weak: [
        "Путается в объяснениях",
        "Ответ не структурирован",
        "Нет примеров",
        "Уклоняется от прямого ответа"
      ],
      poor: [
        "Не может сформулировать мысль",
        "Молчание или односложные ответы",
        "Полностью не по теме"
      ]
    },
    redFlags: [
      "Грубость или агрессия",
      "Отказ отвечать",
      "Бессвязная речь"
    ],
    bonusIndicators: [
      "Использует аналогии для объяснения",
      "Структурирует ответ: 'Во-первых... во-вторых...'",
      "Резюмирует в конце"
    ]
  },

  problemSolving: {
    skill: "Problem Solving",
    weight: 0.3,
    indicators: {
      excellent: [
        "Разбивает проблему на составные части",
        "Рассматривает несколько подходов",
        "Анализирует trade-offs",
        "Предлагает план действий с приоритетами",
        "Учитывает edge cases"
      ],
      good: [
        "Понимает суть проблемы",
        "Предлагает рабочее решение",
        "Объясняет логику решения"
      ],
      average: [
        "Предлагает одно решение без альтернатив",
        "Базовое понимание проблемы"
      ],
      weak: [
        "Не понимает суть проблемы",
        "Решение не работает или неполное"
      ],
      poor: [
        "Не может предложить никакого решения",
        "Отказывается думать над задачей"
      ]
    },
    redFlags: [
      "Говорит 'не знаю' без попытки подумать",
      "Копирует очевидно заученный ответ"
    ],
    bonusIndicators: [
      "Задает уточняющие вопросы",
      "Рассматривает масштабируемость",
      "Учитывает production constraints"
    ]
  },

  technicalDepth: {
    skill: "Technical Depth",
    weight: 0.5,
    indicators: {
      excellent: [
        "Глубокое понимание внутренней работы технологии",
        "Знает ограничения и trade-offs",
        "Приводит метрики и цифры из опыта",
        "Понимает best practices и почему они важны",
        "Может объяснить 'почему', а не только 'как'"
      ],
      good: [
        "Хорошее понимание технологии",
        "Знает основные концепции",
        "Практический опыт применения"
      ],
      average: [
        "Базовое понимание технологии",
        "Может описать что это и зачем",
        "Ограниченный практический опыт"
      ],
      weak: [
        "Поверхностное понимание",
        "Путает основные концепции",
        "Нет практического опыта"
      ],
      poor: [
        "Не понимает базовых концепций",
        "Не может объяснить термины",
        "Явные фактические ошибки"
      ]
    },
    redFlags: [
      "Грубые технические ошибки",
      "Путает базовые термины",
      "Утверждает опыт, который не может подтвердить"
    ],
    bonusIndicators: [
      "Упоминает реальные метрики (latency, throughput, accuracy)",
      "Знает последние версии и изменения",
      "Понимает internal workings"
    ]
  }
};

// ============ РОЛЬ-СПЕЦИФИЧНЫЕ КРИТЕРИИ ============

export const ROLE_RUBRICS: Record<string, RoleRubric> = {
  data_analyst: {
    role: "Data Analyst",
    skills: [
      {
        skill: "SQL Proficiency",
        weight: 0.3,
        indicators: {
          excellent: [
            "Сложные запросы с CTE, оконными функциями, подзапросами",
            "Понимает оптимизацию запросов (индексы, EXPLAIN)",
            "Работает с большими данными эффективно",
            "Знает различия между СУБД"
          ],
          good: [
            "JOIN-ы, GROUP BY, агрегации уверенно",
            "Может написать запрос для воронки/когорт"
          ],
          average: [
            "Базовые SELECT, WHERE, GROUP BY",
            "Простые JOIN-ы"
          ],
          weak: [
            "Путает типы JOIN",
            "Не понимает агрегации"
          ],
          poor: [
            "Не может написать базовый SELECT"
          ]
        },
        redFlags: ["Не знает разницу между WHERE и HAVING"],
        bonusIndicators: ["Знает partitioning, materialized views"]
      },
      {
        skill: "Analytics & Metrics",
        weight: 0.3,
        indicators: {
          excellent: [
            "Понимает unit-экономику, LTV, CAC, retention",
            "Может спроектировать систему метрик",
            "A/B тестирование с статистической грамотностью",
            "Когортный анализ, воронки, сегментация"
          ],
          good: [
            "Знает основные метрики продукта",
            "Понимает A/B тестирование",
            "Может построить воронку"
          ],
          average: [
            "Базовые метрики (конверсия, retention)",
            "Простые отчеты"
          ],
          weak: [
            "Путает метрики",
            "Не понимает как считать retention"
          ],
          poor: [
            "Не знает базовых метрик"
          ]
        },
        redFlags: ["Не понимает что такое конверсия"],
        bonusIndicators: ["Знает causal inference", "Attribution modeling"]
      },
      {
        skill: "Data Storytelling",
        weight: 0.2,
        indicators: {
          excellent: [
            "Формулирует инсайты понятно для бизнеса",
            "Предлагает actionable рекомендации",
            "Визуализирует данные эффективно"
          ],
          good: [
            "Может объяснить выводы",
            "Структурирует отчеты"
          ],
          average: [
            "Описывает данные, но без инсайтов"
          ],
          weak: [
            "Не может сформулировать выводы"
          ],
          poor: [
            "Данные без интерпретации"
          ]
        },
        redFlags: [],
        bonusIndicators: ["Приводит примеры влияния на бизнес-решения"]
      }
    ],
    generalCriteria: UNIVERSAL_CRITERIA as any
  },

  anti_fraud: {
    role: "Anti-Fraud Specialist",
    skills: [
      {
        skill: "Fraud Domain Knowledge",
        weight: 0.35,
        indicators: {
          excellent: [
            "Знает типы фрода: ATO, carding, friendly fraud, synthetic identity",
            "Понимает fraud lifecycle и attack vectors",
            "Знает 3DS, KYC/AML требования",
            "Опыт с graph analytics для fraud rings"
          ],
          good: [
            "Знает основные типы фрода",
            "Понимает chargeback процесс",
            "Работал с device fingerprinting"
          ],
          average: [
            "Базовое понимание фрода",
            "Знает что такое chargeback"
          ],
          weak: [
            "Поверхностное понимание",
            "Путает типы фрода"
          ],
          poor: [
            "Не понимает что такое фрод"
          ]
        },
        redFlags: ["Не знает что такое chargeback"],
        bonusIndicators: ["Опыт с consortium data", "Знает regulatory requirements"]
      },
      {
        skill: "Rule Engineering",
        weight: 0.25,
        indicators: {
          excellent: [
            "Проектирует multi-layer правила",
            "Балансирует FP/FN с бизнес-метриками",
            "Velocity checks, device checks, behavioral rules",
            "A/B тестирует правила"
          ],
          good: [
            "Может написать эффективные правила",
            "Понимает false positive impact"
          ],
          average: [
            "Простые правила на основе порогов"
          ],
          weak: [
            "Не может спроектировать правила"
          ],
          poor: [
            "Не понимает концепцию rules"
          ]
        },
        redFlags: [],
        bonusIndicators: ["ML-augmented rules"]
      },
      {
        skill: "Investigation Skills",
        weight: 0.2,
        indicators: {
          excellent: [
            "Структурированный подход к расследованию",
            "Использует SQL/tools для анализа паттернов",
            "Документирует findings",
            "Предлагает preventive measures"
          ],
          good: [
            "Может провести расследование",
            "Находит root cause"
          ],
          average: [
            "Базовый анализ инцидентов"
          ],
          weak: [
            "Не знает с чего начать"
          ],
          poor: [
            "Не может анализировать"
          ]
        },
        redFlags: [],
        bonusIndicators: ["Опыт с forensics"]
      }
    ],
    generalCriteria: UNIVERSAL_CRITERIA as any
  },

  data_scientist: {
    role: "Data Scientist",
    skills: [
      {
        skill: "ML Fundamentals",
        weight: 0.35,
        indicators: {
          excellent: [
            "Понимает bias-variance tradeoff глубоко",
            "Знает внутренности алгоритмов (gradient boosting, neural nets)",
            "Feature engineering на высоком уровне",
            "Cross-validation, hyperparameter tuning продвинутые"
          ],
          good: [
            "Понимает overfitting/underfitting",
            "Знает основные алгоритмы",
            "Правильно выбирает метрики"
          ],
          average: [
            "Базовое понимание ML",
            "Может обучить модель"
          ],
          weak: [
            "Путает алгоритмы",
            "Не понимает метрики"
          ],
          poor: [
            "Не знает ML basics"
          ]
        },
        redFlags: ["Не знает разницу между classification и regression"],
        bonusIndicators: ["Deep learning опыт", "NLP/CV специализация"]
      },
      {
        skill: "Python/Tools",
        weight: 0.25,
        indicators: {
          excellent: [
            "pandas, numpy, scikit-learn на продвинутом уровне",
            "Знает XGBoost, LightGBM internals",
            "PyTorch/TensorFlow опыт",
            "MLOps tools: MLflow, Kubeflow"
          ],
          good: [
            "Уверенно работает с pandas",
            "Использует scikit-learn эффективно"
          ],
          average: [
            "Базовый pandas",
            "Простые модели"
          ],
          weak: [
            "Слабое владение инструментами"
          ],
          poor: [
            "Не знает базовые библиотеки"
          ]
        },
        redFlags: [],
        bonusIndicators: ["Production ML pipelines"]
      },
      {
        skill: "Experimentation",
        weight: 0.2,
        indicators: {
          excellent: [
            "A/B testing с учетом power analysis",
            "Понимает causality vs correlation",
            "Reproducible experiments",
            "Logging и tracking экспериментов"
          ],
          good: [
            "Понимает A/B тестирование",
            "Может спланировать эксперимент"
          ],
          average: [
            "Базовое понимание экспериментов"
          ],
          weak: [
            "Не понимает как тестировать"
          ],
          poor: [
            "Нет понимания experimentation"
          ]
        },
        redFlags: [],
        bonusIndicators: ["Causal inference опыт"]
      }
    ],
    generalCriteria: UNIVERSAL_CRITERIA as any
  },

  cybersecurity: {
    role: "Cybersecurity Specialist",
    skills: [
      {
        skill: "Security Fundamentals",
        weight: 0.3,
        indicators: {
          excellent: [
            "CIA triad, defense in depth глубоко",
            "OWASP Top 10 детально",
            "Криптография: TLS, PKI, hashing",
            "Authentication: OAuth, SAML, MFA"
          ],
          good: [
            "Знает основные уязвимости",
            "Понимает аутентификацию/авторизацию"
          ],
          average: [
            "Базовое понимание безопасности"
          ],
          weak: [
            "Поверхностные знания"
          ],
          poor: [
            "Не понимает basics"
          ]
        },
        redFlags: ["Не знает что такое XSS или SQL injection"],
        bonusIndicators: ["CVE analysis опыт", "Bug bounty участие"]
      },
      {
        skill: "Tools & Techniques",
        weight: 0.25,
        indicators: {
          excellent: [
            "SIEM: Splunk, ELK глубоко",
            "Penetration testing tools: Burp, Nmap, Metasploit",
            "Forensics tools",
            "Threat intelligence platforms"
          ],
          good: [
            "Работает с основными tools",
            "Может анализировать логи"
          ],
          average: [
            "Базовое использование tools"
          ],
          weak: [
            "Не знает инструменты"
          ],
          poor: [
            "Никакого опыта с tools"
          ]
        },
        redFlags: [],
        bonusIndicators: ["Custom tool development"]
      },
      {
        skill: "Incident Response",
        weight: 0.25,
        indicators: {
          excellent: [
            "NIST/SANS incident lifecycle",
            "Containment, eradication, recovery",
            "Post-mortem documentation",
            "SOAR automation"
          ],
          good: [
            "Понимает IR процесс",
            "Может провести расследование"
          ],
          average: [
            "Базовое понимание IR"
          ],
          weak: [
            "Не знает IR процесс"
          ],
          poor: [
            "Нет понимания"
          ]
        },
        redFlags: [],
        bonusIndicators: ["Red team/Blue team опыт"]
      }
    ],
    generalCriteria: UNIVERSAL_CRITERIA as any
  }
};

// ============ ФУНКЦИИ ОЦЕНКИ ============

export function getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'weak' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'weak';
  return 'poor';
}

export function getRubricForRole(role: string): RoleRubric | null {
  const r = role.toLowerCase();
  
  if (r.includes("data analyst") || r.includes("аналитик")) {
    return ROLE_RUBRICS.data_analyst;
  }
  if (r.includes("anti") && r.includes("fraud") || r.includes("антифрод")) {
    return ROLE_RUBRICS.anti_fraud;
  }
  if (r.includes("data scientist")) {
    return ROLE_RUBRICS.data_scientist;
  }
  if (r.includes("cyber") || r.includes("security")) {
    return ROLE_RUBRICS.cybersecurity;
  }
  
  return null;
}

export function generateScoringPrompt(role: string): string {
  const rubric = getRubricForRole(role);
  
  if (!rubric) {
    return `Evaluate the candidate's answer based on:
1. Technical accuracy and depth
2. Communication clarity
3. Problem-solving approach
4. Practical experience evidence`;
  }
  
  const skillsDescription = rubric.skills.map(s => 
    `- ${s.skill} (${Math.round(s.weight * 100)}% weight): Look for ${s.indicators.excellent.slice(0, 2).join(', ')}`
  ).join('\n');
  
  const redFlags = rubric.skills.flatMap(s => s.redFlags).filter(Boolean);
  const bonuses = rubric.skills.flatMap(s => s.bonusIndicators).filter(Boolean);
  
  return `
Role: ${rubric.role}

SCORING CRITERIA:
${skillsDescription}

RED FLAGS (auto-fail or heavy penalty):
${redFlags.map(f => `- ${f}`).join('\n')}

BONUS INDICATORS (+10-20 points):
${bonuses.slice(0, 5).map(b => `- ${b}`).join('\n')}

SCORING GUIDELINES:
- 80-100: Excellent - Senior-level answer with depth, examples, trade-offs
- 60-79: Good - Solid answer with practical knowledge
- 40-59: Average - Basic understanding, limited depth
- 20-39: Weak - Gaps in knowledge, unclear explanations
- 0-19: Poor - Fundamental misunderstanding or no answer

Be STRICT but FAIR. Penalize:
- Vague answers without specifics
- Obvious rehearsed answers without depth
- Inability to explain "why" not just "what"
- Claiming experience they can't demonstrate

Reward:
- Specific metrics and numbers from real projects
- Trade-off analysis
- Honest "I don't know" followed by logical reasoning
- Clear structured thinking`;
}

