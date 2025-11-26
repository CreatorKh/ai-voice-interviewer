// questionBank.ts

export type Stage =
  | "Background"
  | "Core"
  | "SQL"
  | "DeepDive"
  | "Case"
  | "Debug"
  | "WrapUp";

type Difficulty = 1 | 2 | 3 | 4 | 5;

type RoleKey =
  | "data_scientist"
  | "data_analyst"
  | "anti_fraud"
  | "backend"
  | "frontend"
  | "devops"
  | "ml_engineer"
  | "product_manager"
  | "sql_specialist" // DBA
  | "sql_analyst"    // For Analysts
  | "cybersecurity";

type QuestionEntry = {
  text: string;
  stage: Stage;
  difficulty: Difficulty;
};

export const QUESTION_BANK: Record<RoleKey, QuestionEntry[]> = {
  // ==== DATA SCIENTIST (оставил базовую версию, как было) ====
  data_scientist: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы с анализом данных и ролью Data Scientist в прошлом проекте.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Какой проект по анализу данных вы считаете наиболее успешным и почему?",
    },
    {
      stage: "Background",
      difficulty: 3,
      text: "Опишите типичный end-to-end проект Data Science, в котором вы участвовали, от постановки задачи до внедрения.",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Какие библиотеки Python для анализа данных вы используете чаще всего и в каких сценариях?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Объясните разницу между overfitting и underfitting на понятном примере.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы делите выборку на train/validation/test и почему это важно?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие метрики вы используете для оценки модели классификации и когда отдаёте предпочтение одной метрике над другой?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите, как вы боретесь с дисбалансом классов в задаче классификации.",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Расскажите о случае, когда модель показывала хорошие метрики offline, но провалилась в проде. Как вы нашли причину?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите ваш подход к feature engineering в одном из реальных проектов.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы организуете эксперименты в Data Science: логирование, сравнение моделей, reproducibility?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Расскажите о сложном кейсе, где пришлось сильно менять постановку задачи или бизнес-метрику в процессе проекта.",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что у вас есть данные транзакций пользователей. Как бы вы подошли к задаче предсказания оттока клиентов?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы построили систему A/B-тестирования для новой рекомендательной модели?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "У вас есть лог-данные веб-приложения. Как вы извлечёте полезные фичи для предсказания конверсии?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Модель внезапно стала давать сильно худшие результаты. Какие шаги вы предпримете, чтобы найти проблему?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Вы заметили data drift в проде. Как вы это диагностируете и что будете делать дальше?",
    },
    {
      stage: "Debug",
      difficulty: 5,
      text: "Как вы подходите к объяснимости модели (explainability) для бизнес-стейкхолдеров?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Чему вы хотите научиться в ближайший год как Data Scientist?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Какие компромиссы вы готовы делать между качеством модели и сложностью её поддержки в проде?",
    },
  ],

  // ==== DATA / PRODUCT ANALYST ====
  data_analyst: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы аналитиком: в каких командах и доменах вы работали?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Какой аналитический проект вы считаете наиболее значимым для бизнеса и почему?",
    },
    {
      stage: "Background",
      difficulty: 3,
      text: "Расскажите, как была организована ваша работа с продуктовой командой: кто ставил задачи, как вы согласовывали результаты?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Какими инструментами для построения отчётов и дэшбордов вы пользуетесь чаще всего?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите, как вы обычно формулируете гипотезу и проверяете её на данных.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Опишите SQL-запрос, который вы недавно писали для анализа поведения пользователей.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы определяете, какую метрику считать целевой для конкретного продукта или фичи?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите, как вы работаете с сессиями, событиями и юзер-id в продуктовой аналитике.",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Опишите кейс, когда ваши выводы по данным повлияли на roadmap продукта или приоритеты команды.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о сложном SQL/аналитическом запросе или пайплайне, который вы оптимизировали.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы подходите к сегментации пользователей и выбору признаков для сегментации?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Приведите пример, когда вам пришлось спорить с интуитивным мнением стейкхолдеров, опираясь на данные.",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что конверсия в ключевое действие упала на 20%. С чего вы начнёте разбор?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "У вас есть экспорт событий из продукта (просмотр, добавление в корзину, покупка). Как вы построите воронку?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы спроектировали дэшборд для CPO, который показывает здоровье продукта?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Вы видите скачок метрики, но подозреваете, что это артефакт данных. Как вы это проверите?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Опишите случай, когда вы обнаружили ошибку в трекинге событий или разметке данных.",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какую роль вы предпочитаете: больше исследовательскую или больше операционно-отчётную?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "В каких доменах вы хотите развиваться как аналитик в ближайшие годы?",
    },
  ],

  // ==== ANTI-FRAUD СПЕЦИАЛИСТ ====
  anti_fraud: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы в антифроде: с какими типами мошенничества вы сталкивались?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "В каких индустриях вы работали (банки, финтех, e-commerce, телеком и т.д.) и чем отличались паттерны мошенничества?",
    },
    {
      stage: "Background",
      difficulty: 3,
      text: "Опишите команду, в которой вы работали: были ли рядом аналитики, разработчики, ML-инженеры?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 2,
      text: "Какие основные типы мошенничества вы считаете критичными для онлайн-платежей?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите, как вы проектируете правила (rule-based) для антифрод-системы.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие источники данных вы обычно используете для оценки риска транзакции или клиента?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы балансируете между false positive и false negative в антифроде?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите о вашем опыте взаимодействия с KYC/AML системами и их влиянии на антифрод.",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Опишите сложный кейс мошенничества, который сначала было трудно обнаружить. Как вы его выявили?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите, как вы проектировали или улучшали скоринговую модель риска (rule-based или ML) в антифроде.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы оцениваете эффективность антифрод-системы на уровне бизнес-метрик (потери, chargeback, UX клиентов)?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как вы боролись с ситуацией, когда мошенники адаптировались к вашим правилам или моделям?",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что в системе выросло количество chargeback по картам определённого банка. Как вы будете расследовать ситуацию?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Вам нужно оперативно внедрить временный «жёсткий» набор правил против новой волны мошенничества. Как вы это сделаете, чтобы минимизировать удар по честным клиентам?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы спроектировали антифрод-проверку для новой функции «перевод по номеру телефона» в банке?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Вы замечаете, что резко выросло количество заблокированных честных пользователей. Как вы будете диагностировать проблему?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Расскажите о случае, когда ошибка в интеграции или данных привела к неверной оценке риска.",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Что для вас важнее в антифроде: минимизировать потери или сохранять максимально комфортный UX для клиента? Почему?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "В каких направлениях вы хотите развиваться: больше в сторону правил и процедур или в сторону ML и автоматизации?",
    },
  ],

  // ==== BACKEND (как было) ====
  backend: [
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте разработки серверной части приложений.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими языками и фреймворками для backend вы работали?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Опишите типичную архитектуру REST API, которую вы разрабатывали.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы проектируете структуру базы данных для нового сервиса?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие приёмы вы используете для обработки ошибок и логирования в backend-сервисах?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите, как вы реализуете аутентификацию и авторизацию в своих проектах.",
    },
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Опишите случай, когда вам пришлось рефакторить монолит на микросервисы.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы подходите к оптимизации медленных запросов в базу данных?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о вашем опыте использования очередей (RabbitMQ, Kafka и т.п.) в backend-архитектуре.",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как вы проектируете контракт между микросервисами, чтобы минимизировать coupling?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что вам нужно спроектировать API для системы бронирования. С чего вы начнёте?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы построили архитектуру сервиса для обработки большого объёма однотипных запросов с пиками нагрузки?",
    },
    {
      stage: "Debug",
      difficulty: 3,
      text: "Как вы ищете и устраняете баги, проявляющиеся только в продакшене?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Расскажите, как вы анализируете инцидент, связанный с падением latency-SLA.",
    },
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "В каких технологиях backend-стека вы хотите развиваться дальше?",
    },
  ],

  // ==== FRONTEND (как было, слегка) ====
  frontend: [
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы с frontend-разработкой.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы организуете состояние в приложении на React?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Объясните разницу между CSR, SSR и SSG и когда что использовать.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите случай, когда вам пришлось серьёзно оптимизировать производительность фронтенда.",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Как бы вы спроектировали интерфейс для сложного фильтра поиска с большим количеством параметров?",
    },
    {
      stage: "Debug",
      difficulty: 3,
      text: "Как вы отлавливаете и исправляете трудно-воспроизводимые баги в браузере?",
    },
  ],

  // ==== DEVOPS ====
  devops: [
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о своём опыте в области DevOps и SRE.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Какими инструментами CI/CD вы пользовались и как настраивали пайплайны?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы подходите к мониторингу и алертингу прод-сервисов?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите инцидент, который вы расследовали от начала до конца.",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Представьте, что трафик вырос в 5 раз. Какие шаги вы предпримете для масштабирования?",
    },
  ],

  // ==== ML ENGINEER — более прикладной ====
  ml_engineer: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте как ML-инженера: с какими типами моделей и задач вы работали?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "В каких командах вы работали: больше рядом с Data Scientists или больше с backend-разработчиками?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы обычно деплоите ML-модель в продакшен (REST API, batch, streaming)?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите, как вы организуете хранение артефактов моделей (версии, веса, конфиги).",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие технологии вы используете для построения фичевых пайплайнов (feature store, ETL, orchestration)?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы подходите к логированию и трассировке запросов к ML-сервису?",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Опишите end-to-end ML-систему, которую вы реализовали: данные → обучение → деплой → мониторинг.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы реализовывали мониторинг качества модели в проде (data drift, concept drift, метрики по таргету)?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о вашем опыте оптимизации latency и throughput ML-сервиса.",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Опишите случай, когда вам пришлось менять архитектуру ML-сервиса из-за роста нагрузки или изменения требований.",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что нужно внедрить модель антифрода в существующую платежную систему. Как вы спроектируете интеграцию?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы построили систему онлайн-персонализации (recommender) с учётом real-time сигналов?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Модель в проде внезапно стала хуже работать на части сегментов пользователей. Опишите последовательность ваших действий.",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Расскажите о кейсе, когда ошибка инфраструктуры или данных сильно сломала ML-потребление в проде.",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "В каких областях ML-инженерии вы чувствуете себя сильнее: деплой, фичи, мониторинг, MLOps-платформы?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Какой стек MLOps вы считаете оптимальным для команды, которая только начинает строить ML-продукты?",
    },
  ],

  // ==== PRODUCT MANAGER ====
  product_manager: [
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы продакт-менеджером.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы определяете приоритеты задач в бэклоге?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы формируете и проверяете продуктовые гипотезы?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что метрика удержания пользователей падает. Как вы будете разбираться с причиной?",
    },
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие продукты вас вдохновляют и почему?",
    },
  ],

  // ==== SQL SPECIALIST / DBA ====
  sql_specialist: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о своем опыте работы с реляционными базами данных (PostgreSQL, MySQL, Oracle).",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими объемами данных вам приходилось работать? Какую архитектуру БД вы поддерживали?",
    },
    
    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "В чем разница между DELETE и TRUNCATE?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Объясните разницу между Clustered и Non-Clustered индексами.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Что такое нормализация? До какой нормальной формы вы обычно доводите схему и почему?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как работает транзакция? Объясните уровни изоляции транзакций (Read Committed, Repeatable Read, Serializable).",
    },
    
    // SQL (Deep)
    {
      stage: "SQL",
      difficulty: 3,
      text: "Напишите (устно) запрос с использованием CTE, чтобы найти сотрудников, чья зарплата выше средней по их отделу.",
    },
    {
      stage: "SQL",
      difficulty: 3,
      text: "Как бы вы реализовали пагинацию (pagination) для таблицы с миллионами строк, чтобы это работало быстро?",
    },
    {
      stage: "SQL",
      difficulty: 4,
      text: "Как работают оконные функции RANK(), DENSE_RANK() и ROW_NUMBER()? В чем их отличие?",
    },
    {
      stage: "SQL",
      difficulty: 4,
      text: "У вас есть запрос, который делает Full Table Scan. Как вы будете его оптимизировать? (EXPLAIN ANALYZE, индексы, партиционирование).",
    },
    
    // DeepDive (Internals)
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как устроен B-Tree индекс? Почему для поиска по диапазону он эффективнее Hash-индекса?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Что такое MVCC (Multi-Version Concurrency Control) и зачем оно нужно в PostgreSQL/MySQL?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как работает WAL (Write-Ahead Logging)? Почему он гарантирует надежность данных при сбое?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Расскажите про шардинг (sharding) и репликацию. Какие стратегии шардирования вы знаете?",
    },
    
    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Спроектируйте схему БД для аналога Twitter: пользователи, твиты, фолловеры. Как оптимизировать ленту новостей?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Вам нужно мигрировать таблицу размером 10TB на новую схему без даунтайма. Как вы это сделаете?",
    },
    
    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Приложение начало получать Deadlock-и. Как вы будете искать причину и исправлять?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "База данных 'встала колом' (CPU 100%). Ваши действия по диагностике и реанимации?",
    },
    
    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие современные тренды в базах данных (NewSQL, NoSQL) вам интересны?",
    },
  ],
};

// Маппинг из строки роли в ключ
export function getQuestionForRoleAndStage(
  role: string,
  stage: Stage,
  difficulty: Difficulty
): string | null {
  const key = roleToKey(role);
  if (!key) return null;

  const candidates = QUESTION_BANK[key].filter(
    (q) =>
      q.stage === stage &&
      Math.abs(q.difficulty - difficulty) <= 1 // допускаем +-1 уровень
  );

  if (!candidates.length) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx].text;
}

function roleToKey(role: string): RoleKey | null {
  const r = role.toLowerCase();

  if (r.includes("data scientist")) return "data_scientist";
  if (r.includes("data analyst") || r.includes("аналитик")) return "data_analyst";
  if (r.includes("anti") && r.includes("fraud")) return "anti_fraud";
  if ((r.includes("fraud") || r.includes("антифрод")) && !r.includes("ml"))
    return "anti_fraud";

  if (r.includes("ml") || r.includes("machine learning")) return "ml_engineer";
  if (r.includes("backend")) return "backend";
  if (r.includes("front")) return "frontend";
  if (r.includes("devops") || r.includes("sre")) return "devops";
  if (r.includes("product")) return "product_manager";
  if (r.includes("sql") && (r.includes("analyst") || r.includes("bi") || r.includes("reporting"))) return "sql_analyst";
  if (r.includes("sql") || r.includes("database") || r.includes("dba")) return "sql_specialist";
  if (r.includes("cyber") || r.includes("security") || r.includes("pentest")) return "cybersecurity";

  return null;
}
