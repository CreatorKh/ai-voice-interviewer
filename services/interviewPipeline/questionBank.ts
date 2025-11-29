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
  | "cybersecurity"
  | "ecommerce_seller" // E-commerce Seller Manager
  | "sales_manager"; // Sales / BDM

type QuestionEntry = {
  text: string;
  stage: Stage;
  difficulty: Difficulty;
  tags?: string[]; // Tags for specialization (e.g., "SOC", "DLP")
};

export const QUESTION_BANK: Record<RoleKey, QuestionEntry[]> = {
  // ==== DATA SCIENTIST (Junior/Middle/Senior) ====
  // Difficulty: 1-2 = Junior, 3 = Middle, 4-5 = Senior
  data_scientist: [
    // ========== BACKGROUND ==========
    // Junior
    { stage: "Background", difficulty: 1, text: "Расскажите о вашем опыте работы с данными и машинным обучением." },
    { stage: "Background", difficulty: 1, text: "Какое образование у вас? Какие курсы проходили?" },
    { stage: "Background", difficulty: 1, text: "Какие проекты по Data Science вы делали (учебные или рабочие)?" },
    { stage: "Background", difficulty: 2, text: "Какой проект по анализу данных вы считаете наиболее успешным?" },
    { stage: "Background", difficulty: 2, text: "С какими типами задач ML вы работали: классификация, регрессия, кластеризация?" },
    // Middle
    { stage: "Background", difficulty: 3, text: "Опишите типичный end-to-end проект Data Science, в котором участвовали." },
    { stage: "Background", difficulty: 3, text: "Как была организована команда Data Science в вашей компании?" },
    // Senior
    { stage: "Background", difficulty: 4, text: "Расскажите о вашем опыте внедрения ML-моделей в продакшен." },
    { stage: "Background", difficulty: 5, text: "Как вы выстраивали DS-процессы в команде или компании?" },

    // ========== CORE ==========
    // Junior
    { stage: "Core", difficulty: 1, text: "Какие библиотеки Python для анализа данных вы используете?" },
    { stage: "Core", difficulty: 1, text: "Что такое pandas DataFrame? Какие операции вы знаете?" },
    { stage: "Core", difficulty: 1, text: "Объясните разницу между supervised и unsupervised learning." },
    { stage: "Core", difficulty: 2, text: "Объясните разницу между overfitting и underfitting." },
    { stage: "Core", difficulty: 2, text: "Как вы делите выборку на train/validation/test?" },
    { stage: "Core", difficulty: 2, text: "Что такое cross-validation и зачем она нужна?" },
    { stage: "Core", difficulty: 2, text: "Объясните разницу между precision и recall." },
    // Middle
    { stage: "Core", difficulty: 3, text: "Какие метрики используете для классификации? Когда какую?" },
    { stage: "Core", difficulty: 3, text: "Как вы боретесь с дисбалансом классов?" },
    { stage: "Core", difficulty: 3, text: "Объясните как работает gradient boosting (XGBoost, LightGBM)." },
    { stage: "Core", difficulty: 3, text: "Что такое regularization? Зачем нужны L1 и L2?" },
    { stage: "Core", difficulty: 3, text: "Как вы обрабатываете пропуски в данных?" },
    // Senior
    { stage: "Core", difficulty: 4, text: "Как вы подходите к feature selection?" },
    { stage: "Core", difficulty: 4, text: "Расскажите о вашем опыте с deep learning." },
    { stage: "Core", difficulty: 5, text: "Как вы проектируете ML-системы для высоких нагрузок?" },

    // ========== DEEP DIVE ==========
    // Middle
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о случае, когда модель провалилась в проде. Как нашли причину?" },
    { stage: "DeepDive", difficulty: 3, text: "Как вы проводите EDA (exploratory data analysis)?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о вашем подходе к feature engineering." },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Опишите ваш подход к feature engineering в реальном проекте." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы организуете эксперименты: логирование, сравнение моделей?" },
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о вашем опыте с AutoML." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы работаете с временными рядами?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о сложном кейсе, где меняли постановку задачи в процессе." },
    { stage: "DeepDive", difficulty: 5, text: "Как вы строите reproducible ML pipelines?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о вашем опыте с NLP или Computer Vision." },

    // ========== CASE ==========
    // Junior
    { stage: "Case", difficulty: 2, text: "Как бы вы подошли к задаче предсказания цены квартиры?" },
    { stage: "Case", difficulty: 2, text: "Какую модель выберете для бинарной классификации и почему?" },
    // Middle
    { stage: "Case", difficulty: 3, text: "Как бы вы подошли к задаче предсказания оттока клиентов?" },
    { stage: "Case", difficulty: 3, text: "Как бы вы построили рекомендательную систему?" },
    { stage: "Case", difficulty: 3, text: "У вас 1000 фичей. Как выберете наиболее важные?" },
    // Senior
    { stage: "Case", difficulty: 4, text: "Как бы вы построили систему A/B-тестирования для ML-модели?" },
    { stage: "Case", difficulty: 4, text: "Как извлечь фичи из лог-данных для предсказания конверсии?" },
    { stage: "Case", difficulty: 4, text: "Как бы вы спроектировали fraud detection систему?" },
    { stage: "Case", difficulty: 5, text: "Как бы вы построили real-time ML inference pipeline?" },
    { stage: "Case", difficulty: 5, text: "Как организовать continuous training для модели?" },

    // ========== DEBUG ==========
    // Junior
    { stage: "Debug", difficulty: 2, text: "Модель показывает 99% accuracy. Это хорошо или плохо? Почему?" },
    // Middle
    { stage: "Debug", difficulty: 3, text: "Модель внезапно стала хуже работать. Какие шаги предпримете?" },
    { stage: "Debug", difficulty: 3, text: "Модель хорошо работает на train, плохо на test. Что делать?" },
    // Senior
    { stage: "Debug", difficulty: 4, text: "Вы заметили data drift в проде. Как диагностируете?" },
    { stage: "Debug", difficulty: 4, text: "Модель деградирует со временем. Как настроите мониторинг?" },
    { stage: "Debug", difficulty: 5, text: "Как подходите к explainability модели для бизнеса?" },

    // ========== WRAPUP ==========
    { stage: "WrapUp", difficulty: 1, text: "Какие направления в Data Science вам интересны?" },
    { stage: "WrapUp", difficulty: 2, text: "Чему хотите научиться в ближайший год?" },
    { stage: "WrapUp", difficulty: 3, text: "Какие компромиссы готовы делать между качеством и сложностью модели?" },
    { stage: "WrapUp", difficulty: 4, text: "Какие тренды в ML вы считаете важными?" },
  ],

  // ==== DATA / PRODUCT ANALYST (Junior/Middle/Senior) ====
  // Difficulty: 1-2 = Junior, 3 = Middle, 4-5 = Senior
  data_analyst: [
    // ========== BACKGROUND ==========
    // Junior
    { stage: "Background", difficulty: 1, text: "Расскажите о вашем опыте работы с данными." },
    { stage: "Background", difficulty: 1, text: "Какие инструменты аналитики вы использовали?" },
    { stage: "Background", difficulty: 1, text: "Что привлекает вас в аналитике данных?" },
    { stage: "Background", difficulty: 2, text: "В каких командах и доменах вы работали аналитиком?" },
    { stage: "Background", difficulty: 2, text: "Какой аналитический проект вы считаете наиболее значимым?" },
    // Middle
    { stage: "Background", difficulty: 3, text: "Как была организована ваша работа с продуктовой командой?" },
    { stage: "Background", difficulty: 3, text: "Какие метрики вы отслеживали и почему именно их?" },
    // Senior
    { stage: "Background", difficulty: 4, text: "Расскажите о вашем опыте построения аналитической культуры в команде." },
    { stage: "Background", difficulty: 5, text: "Как вы выстраивали data governance и качество данных?" },

    // ========== CORE ==========
    // Junior
    { stage: "Core", difficulty: 1, text: "Какими инструментами для отчётов и дэшбордов вы пользуетесь?" },
    { stage: "Core", difficulty: 1, text: "Что такое конверсия и как её считать?" },
    { stage: "Core", difficulty: 1, text: "Объясните разницу между метрикой и KPI." },
    { stage: "Core", difficulty: 2, text: "Как вы формулируете гипотезу и проверяете её на данных?" },
    { stage: "Core", difficulty: 2, text: "Опишите SQL-запрос для анализа поведения пользователей." },
    { stage: "Core", difficulty: 2, text: "Что такое retention и как его считать?" },
    { stage: "Core", difficulty: 2, text: "Как вы работаете с воронками продаж?" },
    // Middle
    { stage: "Core", difficulty: 3, text: "Как определяете целевую метрику для продукта или фичи?" },
    { stage: "Core", difficulty: 3, text: "Как работаете с сессиями, событиями и user_id?" },
    { stage: "Core", difficulty: 3, text: "Расскажите о вашем подходе к A/B тестированию." },
    { stage: "Core", difficulty: 3, text: "Как вы считаете статистическую значимость?" },
    { stage: "Core", difficulty: 3, text: "Что такое когортный анализ и когда его использовать?" },
    // Senior
    { stage: "Core", difficulty: 4, text: "Как вы проектируете систему метрик для нового продукта?" },
    { stage: "Core", difficulty: 4, text: "Расскажите о вашем опыте с attribution modeling." },
    { stage: "Core", difficulty: 5, text: "Как вы строите predictive analytics для бизнес-метрик?" },

    // ========== DEEP DIVE ==========
    // Middle
    { stage: "DeepDive", difficulty: 3, text: "Опишите кейс, когда ваши выводы повлияли на roadmap продукта." },
    { stage: "DeepDive", difficulty: 3, text: "Как вы анализируете причины падения метрики?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о сложном дашборде, который вы создавали." },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о сложном SQL-запросе, который вы оптимизировали." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы подходите к сегментации пользователей?" },
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о вашем опыте с causal inference." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы работаете с несколькими источниками данных?" },
    { stage: "DeepDive", difficulty: 5, text: "Приведите пример спора со стейкхолдерами на основе данных." },
    { stage: "DeepDive", difficulty: 5, text: "Как вы строите self-service аналитику для команды?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о вашем опыте с experimentation platform." },

    // ========== CASE ==========
    // Junior
    { stage: "Case", difficulty: 2, text: "Как бы вы посчитали конверсию по воронке регистрации?" },
    { stage: "Case", difficulty: 2, text: "Менеджер просит отчёт по продажам за месяц. Что включите?" },
    // Middle
    { stage: "Case", difficulty: 3, text: "Конверсия упала на 20%. С чего начнёте разбор?" },
    { stage: "Case", difficulty: 3, text: "Как построите воронку: просмотр → корзина → покупка?" },
    { stage: "Case", difficulty: 3, text: "Как бы вы оценили эффект от новой фичи?" },
    { stage: "Case", difficulty: 3, text: "Продакт просит посчитать LTV. Как подойдёте?" },
    // Senior
    { stage: "Case", difficulty: 4, text: "Как спроектировать дэшборд для CPO о здоровье продукта?" },
    { stage: "Case", difficulty: 4, text: "Как бы вы построили систему раннего предупреждения о проблемах?" },
    { stage: "Case", difficulty: 4, text: "A/B тест показал противоречивые результаты. Как разберётесь?" },
    { stage: "Case", difficulty: 5, text: "Как бы вы организовали data democratization в компании?" },
    { stage: "Case", difficulty: 5, text: "Нужно оценить ROI от аналитической команды. Как подойдёте?" },

    // ========== DEBUG ==========
    // Junior
    { stage: "Debug", difficulty: 2, text: "Цифры в отчёте не сходятся. Как будете искать ошибку?" },
    // Middle
    { stage: "Debug", difficulty: 3, text: "Видите скачок метрики, но подозреваете артефакт данных. Как проверите?" },
    { stage: "Debug", difficulty: 3, text: "Дашборд показывает странные значения. Ваши действия?" },
    // Senior
    { stage: "Debug", difficulty: 4, text: "Обнаружили ошибку в трекинге событий. Как исправите и оцените ущерб?" },
    { stage: "Debug", difficulty: 4, text: "Данные из разных источников противоречат друг другу. Как разберётесь?" },
    { stage: "Debug", difficulty: 5, text: "После миграции данных метрики изменились. Как валидируете?" },

    // ========== WRAPUP ==========
    { stage: "WrapUp", difficulty: 1, text: "Что вам больше всего нравится в аналитике?" },
    { stage: "WrapUp", difficulty: 2, text: "Какую роль предпочитаете: исследовательскую или операционную?" },
    { stage: "WrapUp", difficulty: 3, text: "В каких доменах хотите развиваться как аналитик?" },
    { stage: "WrapUp", difficulty: 4, text: "Какие тренды в аналитике данных вы считаете важными?" },
  ],

  // ==== ANTI-FRAUD СПЕЦИАЛИСТ (Junior/Middle/Senior) ====
  // Difficulty: 1-2 = Junior, 3 = Middle, 4-5 = Senior
  anti_fraud: [
    // ========== BACKGROUND ==========
    // Junior
    { stage: "Background", difficulty: 1, text: "Расскажите о вашем опыте работы в антифроде или смежных областях." },
    { stage: "Background", difficulty: 1, text: "Что привлекло вас в сферу борьбы с мошенничеством?" },
    { stage: "Background", difficulty: 1, text: "С какими типами мошенничества вы знакомы теоретически или практически?" },
    { stage: "Background", difficulty: 2, text: "В каких индустриях вы работали (банки, финтех, e-commerce, телеком)?" },
    { stage: "Background", difficulty: 2, text: "Какие инструменты и системы антифрода вы использовали?" },
    // Middle
    { stage: "Background", difficulty: 3, text: "Опишите команду, в которой вы работали: аналитики, разработчики, ML-инженеры?" },
    { stage: "Background", difficulty: 3, text: "Какой был ваш вклад в снижение уровня мошенничества в компании?" },
    // Senior
    { stage: "Background", difficulty: 4, text: "Расскажите о вашем опыте построения антифрод-команды или процессов с нуля." },
    { stage: "Background", difficulty: 5, text: "Как вы выстраивали взаимодействие антифрода с другими подразделениями (продукт, юристы, комплаенс)?" },

    // ========== CORE ==========
    // Junior
    { stage: "Core", difficulty: 1, text: "Какие основные типы мошенничества существуют в онлайн-платежах?" },
    { stage: "Core", difficulty: 1, text: "Что такое chargeback и почему он важен для антифрода?" },
    { stage: "Core", difficulty: 1, text: "Объясните разницу между fraud и friendly fraud." },
    { stage: "Core", difficulty: 2, text: "Какие данные о транзакции важны для оценки риска?" },
    { stage: "Core", difficulty: 2, text: "Что такое device fingerprinting и как он используется?" },
    { stage: "Core", difficulty: 2, text: "Расскажите о базовых правилах (rules) в антифрод-системе." },
    { stage: "Core", difficulty: 2, text: "Что такое velocity checks и приведите примеры." },
    // Middle
    { stage: "Core", difficulty: 3, text: "Как вы проектируете правила (rule-based) для антифрод-системы?" },
    { stage: "Core", difficulty: 3, text: "Какие источники данных вы используете для оценки риска?" },
    { stage: "Core", difficulty: 3, text: "Как вы балансируете между false positive и false negative?" },
    { stage: "Core", difficulty: 3, text: "Расскажите о KYC/AML и их связи с антифродом." },
    { stage: "Core", difficulty: 3, text: "Как работает 3D Secure и какие есть ограничения?" },
    { stage: "Core", difficulty: 3, text: "Что такое risk scoring и как он рассчитывается?" },
    // Senior
    { stage: "Core", difficulty: 4, text: "Как вы проектируете многоуровневую систему защиты от мошенничества?" },
    { stage: "Core", difficulty: 4, text: "Расскажите о вашем опыте с ML-моделями в антифроде." },
    { stage: "Core", difficulty: 5, text: "Как вы интегрируете антифрод в real-time processing pipeline?" },

    // ========== DEEP DIVE ==========
    // Middle
    { stage: "DeepDive", difficulty: 3, text: "Опишите сложный кейс мошенничества, который было трудно обнаружить." },
    { stage: "DeepDive", difficulty: 3, text: "Как вы анализируете паттерны мошенничества?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о вашем опыте расследования инцидентов." },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Как вы проектировали или улучшали скоринговую модель риска?" },
    { stage: "DeepDive", difficulty: 4, text: "Как вы оцениваете эффективность антифрод-системы на уровне бизнес-метрик?" },
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о вашем опыте работы с graph analytics для выявления fraud rings." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы настраиваете мониторинг и алерты для антифрод-системы?" },
    { stage: "DeepDive", difficulty: 5, text: "Как вы боролись с адаптацией мошенников к вашим правилам?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о вашем опыте с consortium data и информационным обменом." },
    { stage: "DeepDive", difficulty: 5, text: "Как вы строите fraud prevention strategy на уровне компании?" },

    // ========== CASE ==========
    // Junior
    { stage: "Case", difficulty: 2, text: "Пользователь жалуется на блокировку платежа. Как вы будете разбираться?" },
    { stage: "Case", difficulty: 2, text: "Вы видите транзакцию с нового устройства на крупную сумму. Какие проверки сделаете?" },
    // Middle
    { stage: "Case", difficulty: 3, text: "Выросло количество chargeback по картам определённого банка. Как расследуете?" },
    { stage: "Case", difficulty: 3, text: "Нужно внедрить временные правила против новой волны фрода. Как минимизируете FP?" },
    { stage: "Case", difficulty: 3, text: "Как бы вы настроили антифрод для P2P переводов?" },
    { stage: "Case", difficulty: 3, text: "Мошенники начали использовать VPN. Как адаптируете правила?" },
    // Senior
    { stage: "Case", difficulty: 4, text: "Как спроектировать антифрод для функции 'перевод по номеру телефона'?" },
    { stage: "Case", difficulty: 4, text: "Как бы вы построили систему для выявления account takeover?" },
    { stage: "Case", difficulty: 4, text: "Запускается новый продукт. Как спроектируете антифрод с нуля?" },
    { stage: "Case", difficulty: 5, text: "Как бы вы организовали real-time fraud detection для 10M+ транзакций в день?" },
    { stage: "Case", difficulty: 5, text: "Конкурент переманивает ваших fraud-аналитиков. Как сохраните knowledge?" },

    // ========== DEBUG ==========
    // Junior
    { stage: "Debug", difficulty: 2, text: "Правило блокирует слишком много транзакций. Как найдёте причину?" },
    // Middle
    { stage: "Debug", difficulty: 3, text: "Резко выросло количество заблокированных честных пользователей. Ваши действия?" },
    { stage: "Debug", difficulty: 3, text: "Модель начала пропускать фрод. Как диагностируете?" },
    // Senior
    { stage: "Debug", difficulty: 4, text: "Ошибка в интеграции привела к неверной оценке риска. Как расследуете?" },
    { stage: "Debug", difficulty: 4, text: "После обновления модели выросли потери. Как откатите и проанализируете?" },
    { stage: "Debug", difficulty: 5, text: "Обнаружен внутренний fraud. Как будете расследовать?" },

    // ========== WRAPUP ==========
    { stage: "WrapUp", difficulty: 1, text: "Что вас больше всего интересует в антифроде?" },
    { stage: "WrapUp", difficulty: 2, text: "Что важнее: минимизировать потери или сохранить UX клиента?" },
    { stage: "WrapUp", difficulty: 3, text: "В каком направлении хотите развиваться: rules, ML или management?" },
    { stage: "WrapUp", difficulty: 4, text: "Какие тренды в антифроде вы считаете наиболее важными?" },
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

  // ==== FRONTEND ====
  frontend: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы с frontend-разработкой.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими фреймворками вы работали (React, Vue, Angular)? Какой предпочитаете и почему?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Расскажите о самом сложном UI-проекте, который вы делали.",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Объясните разницу между let, const и var в JavaScript.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы организуете состояние в приложении на React? Redux, MobX, Zustand или что-то другое?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Что такое Virtual DOM и как он работает в React?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Объясните разницу между CSR, SSR и SSG. Когда что использовать?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как работают хуки в React? Расскажите про useEffect и его зависимости.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы подходите к типизации в TypeScript? Когда используете any и почему это плохо?",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Как вы организуете структуру компонентов в большом проекте?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите случай, когда вам пришлось серьёзно оптимизировать производительность фронтенда.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы работаете с memo, useMemo и useCallback? Когда их использовать, а когда нет?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Расскажите о вашем опыте с микрофронтендами или модульной архитектурой.",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Как бы вы спроектировали интерфейс для сложного фильтра поиска с большим количеством параметров?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Вам нужно реализовать бесконечный скролл с загрузкой данных. Как вы это сделаете?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы организовали работу с формами в большом приложении (валидация, состояние, отправка)?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Как вы отлавливаете и исправляете трудно-воспроизводимые баги в браузере?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Приложение тормозит при рендере большого списка. Как вы будете искать и решать проблему?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие тренды во frontend вам интересны? Что хотите изучить?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Как вы относитесь к дизайн-системам и компонентным библиотекам?",
    },
  ],

  // ==== DEVOPS / SRE ====
  devops: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о своём опыте в области DevOps и SRE.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими облачными провайдерами вы работали (AWS, GCP, Azure)?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Опишите инфраструктуру, которую вы поддерживали: сколько серверов, какие сервисы?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Что такое Docker? Как вы используете контейнеры в работе?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Какими инструментами CI/CD вы пользовались? Как настраивали пайплайны?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите о вашем опыте с Kubernetes. Как организуете деплой?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы подходите к мониторингу и алертингу прод-сервисов? Какие инструменты используете?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы организуете логирование в распределённой системе?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите о вашем подходе к Infrastructure as Code (Terraform, Ansible, Pulumi).",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Как вы настраиваете автоскейлинг для сервисов? Какие метрики используете?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите инцидент, который вы расследовали от начала до конца. Как нашли причину?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы организуете blue-green или canary деплой?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Расскажите о вашем опыте с service mesh (Istio, Linkerd). Когда это нужно?",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Сервис начал отвечать медленнее. Как вы будете диагностировать проблему?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Представьте, что трафик вырос в 5 раз. Какие шаги вы предпримете для масштабирования?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы организовали disaster recovery для критичного сервиса?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Pod в Kubernetes постоянно рестартится. Как вы будете искать причину?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Деплой прошёл, но часть пользователей получает ошибки. Ваши действия?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие практики DevOps вы считаете наиболее важными?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Как вы относитесь к GitOps и Platform Engineering?",
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
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы продакт-менеджером.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "В каких доменах вы работали? B2B или B2C продукты?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Расскажите о продукте, которым вы больше всего гордитесь. Какие результаты достигли?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Как вы собираете и анализируете требования от стейкхолдеров?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы определяете приоритеты задач в бэклоге? Какие фреймворки используете?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы работаете с метриками продукта? Какие KPI отслеживаете?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы формируете и проверяете продуктовые гипотезы?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите о вашем подходе к A/B тестированию.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы взаимодействуете с командой разработки? Как пишете user stories?",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Расскажите о случае, когда вам пришлось отказаться от фичи, на которую уже потратили ресурсы.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы проводите customer development? Приведите пример инсайта из интервью.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите ситуацию, когда данные противоречили интуиции стейкхолдеров. Как вы действовали?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как вы строите продуктовую стратегию на год? Какие инструменты используете?",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что метрика удержания пользователей падает. Как вы будете разбираться с причиной?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "У вас есть 10 запросов от разных стейкхолдеров. Как вы решите, что делать первым?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Вам нужно запустить MVP за 2 месяца. Как вы определите минимальный scope?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Конкурент выпустил похожую фичу. Как вы отреагируете?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Фича запущена, но пользователи не используют её. Как вы будете разбираться?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "После релиза выросло количество обращений в поддержку. Ваши действия?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие продукты вас вдохновляют и почему?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Как вы развиваете свои навыки продакт-менеджера? Какие книги рекомендуете?",
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

  // ==== SQL ANALYST (for Analysts, BI, Reporting) ====
  sql_analyst: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы с SQL в аналитических задачах.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими СУБД вы работали? PostgreSQL, MySQL, ClickHouse, BigQuery?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Какие BI-инструменты вы использовали для визуализации данных?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Объясните разницу между INNER JOIN, LEFT JOIN и FULL OUTER JOIN.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как работает GROUP BY? Когда использовать HAVING вместо WHERE?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Напишите запрос для расчета конверсии по воронке: просмотр → добавление в корзину → покупка.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы используете оконные функции для расчета накопительных метрик (running total, moving average)?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Объясните разницу между ROW_NUMBER(), RANK() и DENSE_RANK().",
    },

    // SQL (Deep)
    {
      stage: "SQL",
      difficulty: 3,
      text: "Напишите запрос для когортного анализа: retention пользователей по месяцу регистрации.",
    },
    {
      stage: "SQL",
      difficulty: 3,
      text: "Как посчитать LTV пользователя с помощью SQL? Опишите подход.",
    },
    {
      stage: "SQL",
      difficulty: 4,
      text: "Как бы вы написали запрос для поиска цепочек событий пользователя (sessionization)?",
    },
    {
      stage: "SQL",
      difficulty: 4,
      text: "Напишите запрос для определения первой и последней покупки каждого пользователя с использованием LAG/LEAD.",
    },
    {
      stage: "SQL",
      difficulty: 5,
      text: "Как бы вы реализовали расчет RFM-сегментации в SQL?",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Как вы подходите к оптимизации медленных аналитических запросов?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о сложном аналитическом запросе, который вы оптимизировали. Что было узким местом?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы работаете с большими данными в SQL? Партиционирование, материализованные представления?",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Вам нужно построить отчет по unit-экономике продукта. Какие метрики включите и как их посчитаете?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Как бы вы построили дашборд для отслеживания здоровья продукта?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Продакт просит посчитать влияние новой фичи на retention. Как вы это сделаете?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Ваш отчет показывает странные цифры. Как вы будете проверять данные?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Метрика в дашборде не совпадает с данными в другом источнике. Как найдёте причину?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие инструменты помимо SQL вы используете для анализа данных?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Как вы относитесь к Python/R для аналитики? Когда SQL недостаточно?",
    },
  ],

  // ==== CYBERSECURITY ANALYST (Junior/Middle/Senior) ====
  // Difficulty: 1-2 = Junior, 3 = Middle, 4-5 = Senior
  // EXPANDED: 80+ questions to prevent repetition
  cybersecurity: [
    // ========== BACKGROUND (15 questions) ==========
    // Junior
    { stage: "Background", difficulty: 1, text: "Расскажите о вашем опыте в области информационной безопасности." },
    { stage: "Background", difficulty: 1, text: "Что привлекло вас в кибербезопасность?" },
    { stage: "Background", difficulty: 1, text: "Какие курсы или сертификации вы проходили?" },
    { stage: "Background", difficulty: 1, text: "Как вы начали изучать информационную безопасность?" },
    { stage: "Background", difficulty: 1, text: "Какие CTF-соревнования вы проходили? Какие задачи решали?" },
    { stage: "Background", difficulty: 2, text: "В каких направлениях ИБ вы работали: пентест, SOC, compliance, AppSec?" },
    { stage: "Background", difficulty: 2, text: "Какие инструменты безопасности вы использовали?" },
    { stage: "Background", difficulty: 2, text: "Расскажите о вашем домашнем лабораторном стенде для практики ИБ." },
    { stage: "Background", difficulty: 2, text: "С какими операционными системами вы работали в контексте безопасности?" },
    // Middle
    { stage: "Background", difficulty: 3, text: "Расскажите о самом интересном инциденте, который вы расследовали." },
    { stage: "Background", difficulty: 3, text: "Как была организована команда ИБ в вашей компании?" },
    { stage: "Background", difficulty: 3, text: "Какой был ваш самый сложный проект в области безопасности?" },
    // Senior
    { stage: "Background", difficulty: 4, text: "Расскажите о вашем опыте построения security-процессов с нуля." },
    { stage: "Background", difficulty: 4, text: "Как вы взаимодействовали с руководством по вопросам ИБ-бюджета?" },
    { stage: "Background", difficulty: 5, text: "Как вы выстраивали security culture в организации?" },

    // ========== CORE (30 questions) ==========
    // Junior
    { stage: "Core", difficulty: 1, text: "Объясните разницу между аутентификацией и авторизацией." },
    { stage: "Core", difficulty: 1, text: "Что такое firewall и как он работает?" },
    { stage: "Core", difficulty: 1, text: "Что такое VPN и зачем он нужен?" },
    { stage: "Core", difficulty: 1, text: "Объясните модель CIA (Confidentiality, Integrity, Availability)." },
    { stage: "Core", difficulty: 1, text: "Что такое malware? Какие виды вредоносного ПО вы знаете?" },
    { stage: "Core", difficulty: 1, text: "Что такое хэширование? Чем отличается от шифрования?" },
    { stage: "Core", difficulty: 1, text: "Объясните разницу между симметричным и асимметричным шифрованием." },
    { stage: "Core", difficulty: 1, text: "Что такое порт? Какие порты используют популярные сервисы?" },
    { stage: "Core", difficulty: 2, text: "Какие основные типы кибератак вы знаете? Приведите примеры." },
    { stage: "Core", difficulty: 2, text: "Что такое SQL-инъекция и как от неё защититься?" },
    { stage: "Core", difficulty: 2, text: "Что такое фишинг? Какие виды бывают?" },
    { stage: "Core", difficulty: 2, text: "Как работает двухфакторная аутентификация?" },
    { stage: "Core", difficulty: 2, text: "Что такое DDoS-атака? Как от неё защищаться?" },
    { stage: "Core", difficulty: 2, text: "Что такое брутфорс-атака? Как её предотвратить?" },
    { stage: "Core", difficulty: 2, text: "Объясните принцип наименьших привилегий (Least Privilege)." },
    { stage: "Core", difficulty: 2, text: "Что такое IDS и IPS? В чём разница?" },
    // Middle
    { stage: "Core", difficulty: 3, text: "Как работает SSL/TLS? Объясните процесс handshake." },
    { stage: "Core", difficulty: 3, text: "Что такое XSS и CSRF? Как от них защищаться?" },
    { stage: "Core", difficulty: 3, text: "Как работает JWT? Какие есть уязвимости?" },
    { stage: "Core", difficulty: 3, text: "Что такое OWASP Top 10? Перечислите основные уязвимости." },
    { stage: "Core", difficulty: 3, text: "Как работает SIEM-система?" },
    { stage: "Core", difficulty: 3, text: "Что такое Zero Trust архитектура?" },
    { stage: "Core", difficulty: 3, text: "Объясните разницу между vulnerability и exploit." },
    { stage: "Core", difficulty: 3, text: "Что такое SSRF? Приведите примеры эксплуатации." },
    { stage: "Core", difficulty: 3, text: "Как работает Kerberos-аутентификация?" },
    { stage: "Core", difficulty: 3, text: "Что такое LDAP injection?" },
    // Senior
    { stage: "Core", difficulty: 4, text: "Как вы проектируете security architecture для микросервисов?" },
    { stage: "Core", difficulty: 4, text: "Расскажите о вашем опыте с PKI и certificate management." },
    { stage: "Core", difficulty: 4, text: "Как работает OAuth 2.0 и OpenID Connect? Какие уязвимости?" },
    { stage: "Core", difficulty: 5, text: "Как вы организуете security для multi-cloud environment?" },

    // ========== DEEP DIVE (20 questions) ==========
    // Junior
    { stage: "DeepDive", difficulty: 2, text: "Какие инструменты сканирования уязвимостей вы знаете?" },
    { stage: "DeepDive", difficulty: 2, text: "Как вы анализируете сетевой трафик? Какие инструменты используете?" },
    // Middle
    { stage: "DeepDive", difficulty: 3, text: "Как вы проводите анализ уязвимостей? Какие инструменты используете?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о вашем опыте работы с SIEM (Splunk, ELK, QRadar)." },
    { stage: "DeepDive", difficulty: 3, text: "Как вы настраиваете мониторинг безопасности?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о вашем опыте с Nmap, Wireshark, Burp Suite." },
    { stage: "DeepDive", difficulty: 3, text: "Как вы проводите анализ логов? На что обращаете внимание?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о вашем опыте с endpoint security решениями." },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о случае, когда вы обнаружили и устранили уязвимость." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы организуете Incident Response процесс?" },
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о вашем опыте с penetration testing." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы проводите security code review?" },
    { stage: "DeepDive", difficulty: 4, text: "Расскажите о вашем опыте с forensics и анализом инцидентов." },
    { stage: "DeepDive", difficulty: 4, text: "Как вы настраиваете hardening серверов?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о вашем опыте с threat modeling. Какие фреймворки?" },
    { stage: "DeepDive", difficulty: 5, text: "Как вы интегрируете безопасность в CI/CD (DevSecOps)?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о вашем опыте с red team / blue team exercises." },
    { stage: "DeepDive", difficulty: 5, text: "Как вы строите threat intelligence программу?" },
    { stage: "DeepDive", difficulty: 5, text: "Расскажите о вашем опыте с SOAR-платформами." },
    { stage: "DeepDive", difficulty: 5, text: "Как вы организуете vulnerability management программу?" },

    // ========== CASE (20 questions) ==========
    // Junior
    { stage: "Case", difficulty: 1, text: "Коллега просит ваш пароль для срочной задачи. Ваши действия?" },
    { stage: "Case", difficulty: 2, text: "Пользователь сообщает о подозрительном email. Ваши действия?" },
    { stage: "Case", difficulty: 2, text: "Как бы вы объяснили важность паролей обычному сотруднику?" },
    { stage: "Case", difficulty: 2, text: "Сотрудник нашёл флешку на парковке. Что вы ему посоветуете?" },
    { stage: "Case", difficulty: 2, text: "Как бы вы провели базовый security awareness тренинг?" },
    // Middle
    { stage: "Case", difficulty: 3, text: "Вы обнаружили подозрительную активность в логах. Ваши действия?" },
    { stage: "Case", difficulty: 3, text: "Как бы вы настроили WAF для защиты веб-приложения?" },
    { stage: "Case", difficulty: 3, text: "Сотрудник потерял ноутбук с корпоративными данными. Ваши действия?" },
    { stage: "Case", difficulty: 3, text: "Как бы вы организовали сегментацию корпоративной сети?" },
    { stage: "Case", difficulty: 3, text: "Разработчики хотят отключить HTTPS для тестирования. Ваша реакция?" },
    { stage: "Case", difficulty: 3, text: "Как бы вы настроили безопасный удалённый доступ для сотрудников?" },
    // Senior
    { stage: "Case", difficulty: 4, text: "Как организовать защиту от OWASP Top 10?" },
    { stage: "Case", difficulty: 4, text: "Компания подверглась фишинговой атаке. Как расследуете?" },
    { stage: "Case", difficulty: 4, text: "Как бы вы организовали bug bounty программу?" },
    { stage: "Case", difficulty: 4, text: "Как бы вы провели security assessment для M&A сделки?" },
    { stage: "Case", difficulty: 5, text: "Как спроектировать IDS/IPS для корпоративной сети?" },
    { stage: "Case", difficulty: 5, text: "Как бы вы организовали security для IoT устройств?" },
    { stage: "Case", difficulty: 5, text: "Как подготовить компанию к SOC 2 аудиту?" },
    { stage: "Case", difficulty: 5, text: "Как бы вы построили Security Operations Center с нуля?" },
    { stage: "Case", difficulty: 5, text: "Как организовать защиту от ransomware на уровне enterprise?" },

    // ========== DEBUG (12 questions) ==========
    // Junior
    { stage: "Debug", difficulty: 1, text: "Пользователь не может зайти в аккаунт. С чего начнёте диагностику?" },
    { stage: "Debug", difficulty: 2, text: "Антивирус заблокировал легитимную программу. Как разберётесь?" },
    { stage: "Debug", difficulty: 2, text: "Сайт компании недоступен. Как определить, это DDoS или сбой?" },
    // Middle
    { stage: "Debug", difficulty: 3, text: "Пользователи жалуются на странное поведение аккаунтов. Как расследуете?" },
    { stage: "Debug", difficulty: 3, text: "SIEM генерирует много ложных срабатываний. Как оптимизируете?" },
    { stage: "Debug", difficulty: 3, text: "VPN работает нестабильно. Как будете диагностировать?" },
    { stage: "Debug", difficulty: 3, text: "Обнаружен несанкционированный сервер в сети. Ваши действия?" },
    // Senior
    { stage: "Debug", difficulty: 4, text: "В системе обнаружен malware. Опишите процесс анализа и устранения." },
    { stage: "Debug", difficulty: 4, text: "Подозреваете утечку данных. Как будете расследовать?" },
    { stage: "Debug", difficulty: 4, text: "Обнаружена криптомайнер на серверах. Как найдёте источник?" },
    { stage: "Debug", difficulty: 5, text: "Обнаружен APT (Advanced Persistent Threat). Ваши действия?" },
    { stage: "Debug", difficulty: 5, text: "Подозреваете инсайдерскую угрозу. Как будете расследовать?" },

    // ========== WRAPUP (8 questions) ==========
    { stage: "WrapUp", difficulty: 1, text: "Какие сертификации в ИБ вас интересуют?" },
    { stage: "WrapUp", difficulty: 1, text: "Какие ресурсы вы используете для обучения ИБ?" },
    { stage: "WrapUp", difficulty: 2, text: "Какие сертификации у вас есть или планируете получить?" },
    { stage: "WrapUp", difficulty: 2, text: "Как вы относитесь к этичному хакингу?" },
    { stage: "WrapUp", difficulty: 3, text: "Как вы следите за новыми угрозами? Какие ресурсы используете?" },
    { stage: "WrapUp", difficulty: 3, text: "Какие конференции по ИБ вы посещали или хотели бы посетить?" },
    { stage: "WrapUp", difficulty: 4, text: "Какие тренды в кибербезопасности вы считаете важными?" },
    { stage: "WrapUp", difficulty: 5, text: "Как вы видите развитие ИБ в контексте AI и ML?" },

    // ========== SOC (Security Operations Center) SPECIALIZATION ==========
    // Junior
    { stage: "Core", difficulty: 2, text: "Что такое SOC? Каковы его основные функции?", tags: ["SOC"] },
    { stage: "Core", difficulty: 2, text: "Что такое лог? Какие типы логов вы знаете?", tags: ["SOC"] },
    { stage: "DeepDive", difficulty: 2, text: "Как вы анализируете алерт от антивируса?", tags: ["SOC"] },
    // Middle
    { stage: "Core", difficulty: 3, text: "Опишите жизненный цикл инцидента (Incident Lifecycle) по NIST или SANS.", tags: ["SOC"] },
    { stage: "DeepDive", difficulty: 3, text: "Как вы настраиваете правила корреляции в SIEM?", tags: ["SOC"] },
    { stage: "Case", difficulty: 3, text: "SIEM показывает множественные неудачные попытки входа. Ваши действия?", tags: ["SOC"] },
    { stage: "Debug", difficulty: 3, text: "SIEM перестал получать логи с критического сервера. Как будете чинить?", tags: ["SOC"] },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Как вы автоматизируете реагирование на инциденты (SOAR)?", tags: ["SOC"] },
    { stage: "Case", difficulty: 5, text: "Как бы вы построили SOC с нуля в компании на 5000 человек?", tags: ["SOC"] },

    // ========== DLP (Data Loss Prevention) SPECIALIZATION ==========
    // Junior
    { stage: "Core", difficulty: 2, text: "Что такое DLP-система? От чего она защищает?", tags: ["DLP"] },
    { stage: "Core", difficulty: 2, text: "Что такое персональные данные (PII)?", tags: ["DLP"] },
    // Middle
    { stage: "Core", difficulty: 3, text: "Какие методы обнаружения утечек (fingerprinting, regex) вы знаете?", tags: ["DLP"] },
    { stage: "DeepDive", difficulty: 3, text: "Как настроить DLP-политику для защиты финансовых отчетов?", tags: ["DLP"] },
    { stage: "Case", difficulty: 3, text: "Сотрудник пытается отправить базу клиентов на личную почту. Ваши действия?", tags: ["DLP"] },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Как вы балансируете между безопасностью и приватностью сотрудников при внедрении DLP?", tags: ["DLP"] },
    { stage: "Case", difficulty: 5, text: "Как внедрить DLP в облачной среде (Office 365, G Suite)?", tags: ["DLP"] },

    // ========== NETWORK SECURITY SPECIALIZATION ==========
    // Junior
    { stage: "Core", difficulty: 2, text: "Что такое DMZ? Зачем она нужна?", tags: ["Network"] },
    { stage: "Core", difficulty: 2, text: "В чем разница между TCP и UDP?", tags: ["Network"] },
    { stage: "Core", difficulty: 2, text: "Что такое NAT?", tags: ["Network"] },
    // Middle
    { stage: "Core", difficulty: 3, text: "Как работает IPSec VPN?", tags: ["Network"] },
    { stage: "DeepDive", difficulty: 3, text: "Как вы анализируете PCAP-файл в Wireshark? Что ищете?", tags: ["Network"] },
    { stage: "Case", difficulty: 3, text: "Обнаружен исходящий трафик на подозрительный IP. Ваши действия?", tags: ["Network"] },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Как спроектировать защищенную сетевую архитектуру для гибридного облака?", tags: ["Network"] },
    { stage: "Case", difficulty: 5, text: "Как защититься от BGP hijacking?", tags: ["Network"] },

    // ========== APPSEC (Application Security) SPECIALIZATION ==========
    // Junior
    { stage: "Core", difficulty: 2, text: "Что такое input validation? Почему это важно?", tags: ["AppSec"] },
    { stage: "Core", difficulty: 2, text: "Что такое HTTPS и зачем он нужен для веб-приложений?", tags: ["AppSec"] },
    // Middle
    { stage: "Core", difficulty: 3, text: "Объясните уязвимость SQL Injection и как её предотвратить (Prepared Statements).", tags: ["AppSec"] },
    { stage: "DeepDive", difficulty: 3, text: "Как работает инструмент SAST (Static Application Security Testing)?", tags: ["AppSec"] },
    { stage: "Case", difficulty: 3, text: "Разработчик хочет использовать библиотеку с известной уязвимостью. Ваши действия?", tags: ["AppSec"] },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Как внедрить DevSecOps в существующий CI/CD пайплайн?", tags: ["AppSec"] },
    { stage: "Case", difficulty: 5, text: "Как спроектировать безопасную архитектуру для микросервисного приложения?", tags: ["AppSec"] },

    // ========== GRC (Governance, Risk, Compliance) SPECIALIZATION ==========
    // Junior
    { stage: "Core", difficulty: 2, text: "Что такое политика безопасности?" },
    { stage: "Core", difficulty: 2, text: "Зачем нужны стандарты безопасности (ISO 27001, PCI DSS)?" },
    // Middle
    { stage: "Core", difficulty: 3, text: "Как вы проводите оценку рисков (Risk Assessment)?" },
    { stage: "DeepDive", difficulty: 3, text: "Расскажите о требованиях PCI DSS к хранению данных карт." },
    { stage: "Case", difficulty: 3, text: "Компания не проходит внешний аудит. Ваши первые шаги?" },
    // Senior
    { stage: "DeepDive", difficulty: 4, text: "Как выстроить процесс управления соответствием (Compliance Management)?" },
    { stage: "Case", difficulty: 5, text: "Как подготовить компанию к сертификации по ISO 27001?" },
  ],

  // ==== E-COMMERCE SELLER MANAGER ====
  ecommerce_seller: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы с маркетплейсами (Wildberries, Ozon, Amazon, и др.).",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими категориями товаров вы работали? Какой был средний оборот?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Опишите вашу роль в работе с селлерами: привлечение, развитие, поддержка?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 1,
      text: "Какие ключевые метрики вы отслеживаете для оценки успешности селлера?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы помогаете селлерам оптимизировать карточки товаров для увеличения конверсии?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите о процессе онбординга нового селлера на платформу.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы работаете с ценообразованием и помогаете селлерам оставаться конкурентоспособными?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие инструменты аналитики вы используете для анализа продаж селлеров?",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Опишите случай, когда вы помогли селлеру значительно увеличить продажи. Что конкретно вы сделали?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы работаете с сезонностью и планированием акций для селлеров?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о вашем опыте работы с рекламными инструментами маркетплейсов (продвижение, баннеры, участие в акциях).",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как вы выстраиваете долгосрочные отношения с ключевыми селлерами? Приведите пример успешного партнёрства.",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Селлер жалуется на низкие продажи несмотря на хороший товар. С чего вы начнёте анализ?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Как бы вы организовали привлечение новых селлеров в определённую категорию товаров?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "У селлера проблемы с логистикой и возвратами. Как вы будете решать эту ситуацию?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Вам нужно увеличить GMV категории на 30% за квартал. Какой план действий вы предложите?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Продажи селлера резко упали после изменения алгоритма ранжирования. Как вы поможете ему адаптироваться?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Селлер получил много негативных отзывов. Как вы будете работать над восстановлением репутации?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие тренды в e-commerce вы считаете наиболее важными в ближайшие годы?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Как вы видите развитие своей карьеры в сфере e-commerce и работы с селлерами?",
    },
    
    // === SALES SKILLS (E-commerce + Sales Focus) ===
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите о вашем самом крупном закрытии сделки с селлером. Как вы его убедили?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы работаете с возражениями селлеров? Приведите конкретный пример.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите вашу воронку продаж: от первого контакта до подписания контракта. Какие конверсии на каждом этапе?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Селлер говорит: 'Ваши комиссии слишком высокие, конкуренты дешевле'. Как вы ответите?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Вам нужно привлечь 50 новых селлеров за месяц. Какой план действий вы предложите?",
    },
  ],

  // ==== SALES MANAGER / BDM ====
  sales_manager: [
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте в продажах. В каких сферах вы работали?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Какой был ваш средний чек и объём продаж за месяц/квартал?",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "B2B или B2C продажи? В чём для вас ключевая разница?",
    },

    // Core - Sales Skills
    {
      stage: "Core",
      difficulty: 1,
      text: "Какие этапы продажи вы выделяете? Расскажите о вашем подходе.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы квалифицируете лидов? Какие критерии используете?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Расскажите о техниках работы с возражениями, которые вы используете.",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы выстраиваете долгосрочные отношения с клиентами после закрытия сделки?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие CRM-системы вы использовали? Как организуете работу с воронкой?",
    },

    // DeepDive - Sales Mastery
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Расскажите о самой сложной сделке, которую вы закрыли. Что было ключевым фактором успеха?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы работаете с 'холодными' клиентами? Опишите ваш процесс от первого контакта до встречи.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о случае, когда клиент отказался в последний момент. Как вы это обработали?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как вы анализируете причины потерянных сделок? Приведите пример выводов и изменений в подходе.",
    },

    // Case - Sales Scenarios
    {
      stage: "Case",
      difficulty: 3,
      text: "Клиент говорит: 'Мне нужно подумать'. Ваши действия?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Клиент сравнивает вас с конкурентом и говорит, что у них дешевле. Как ответите?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Вам нужно выполнить план продаж, но осталось 2 недели и вы на 60%. Какие действия предпримете?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Клиент просит скидку 30%, но ваш максимум — 10%. Как проведёте переговоры?",
    },
    {
      stage: "Case",
      difficulty: 5,
      text: "У вас есть крупный клиент, который приносит 40% выручки, но постоянно требует особых условий. Как балансируете?",
    },

    // Debug - Problem Solving
    {
      stage: "Debug",
      difficulty: 3,
      text: "Ваши конверсии из лидов в сделки упали на 30%. Как будете анализировать проблему?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Клиент жалуется на качество после покупки и грозит отзывом. Ваши действия?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Что мотивирует вас в продажах? Почему выбрали эту сферу?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "Как вы развиваете свои навыки продаж? Какие книги/курсы рекомендуете?",
    },
  ],
};

// Маппинг из строки роли в ключ
export function getQuestionForRoleAndStage(
  role: string,
  stage: Stage,
  difficulty: Difficulty,
  specialization?: string // Optional specialization (e.g. "SOC")
): string | null {
  const key = roleToKey(role);
  if (!key) return null;

  let candidates = QUESTION_BANK[key].filter(
    (q) =>
      q.stage === stage &&
      Math.abs(q.difficulty - difficulty) <= 1 // допускаем +-1 уровень
  );

  // Если выбрана специализация, фильтруем или приоритизируем
  if (specialization && candidates.length > 0) {
    // Ищем тег, соответствующий специализации (например, "SOC" в "SOC (Security Operations)")
    // Упростим: ищем вхождение строки специализации в тегах вопроса
    const specKeyword = specialization.split(' ')[0].toUpperCase(); // "SOC", "DLP"
    
    const specializedCandidates = candidates.filter(q => 
      q.tags && q.tags.some(t => t.toUpperCase().includes(specKeyword))
    );

    // Если есть специализированные вопросы для этого этапа, используем их с высокой вероятностью (80%)
    if (specializedCandidates.length > 0 && Math.random() < 0.8) {
        candidates = specializedCandidates;
    }
  }

  if (!candidates.length) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx].text;
}

function roleToKey(role: string): RoleKey | null {
  const r = role.toLowerCase();

  // Data roles
  if (r.includes("data scientist")) return "data_scientist";
  if (r.includes("data analyst") || r.includes("аналитик") || r.includes("analytics engineer")) return "data_analyst";
  
  // Anti-fraud / Risk / Compliance (all use anti_fraud questions)
  if (r.includes("anti") && r.includes("fraud")) return "anti_fraud";
  if ((r.includes("fraud") || r.includes("антифрод")) && !r.includes("ml")) return "anti_fraud";
  if (r.includes("risk") || r.includes("compliance") || r.includes("комплаенс")) return "anti_fraud";
  
  // Finance / Forecasting (use data_analyst questions)
  if (r.includes("financial") || r.includes("forecaster") || r.includes("finance")) return "data_analyst";

  // ML / AI
  if (r.includes("ml") || r.includes("machine learning") || r.includes("ai") || r.includes("ethics")) return "ml_engineer";
  
  // Engineering
  if (r.includes("backend") || r.includes("software engineer")) return "backend";
  if (r.includes("front")) return "frontend";
  if (r.includes("devops") || r.includes("sre")) return "devops";
  
  // Product
  if (r.includes("product")) return "product_manager";
  
  // SQL / Database
  if (r.includes("sql") && (r.includes("analyst") || r.includes("bi") || r.includes("reporting") || r.includes("analytics"))) return "sql_analyst";
  if (r.includes("sql") || r.includes("database") || r.includes("dba")) return "sql_specialist";
  
  // Security
  if (r.includes("cyber") || r.includes("security") || r.includes("pentest")) return "cybersecurity";
  
  // E-commerce / Sales
  if (r.includes("seller") || r.includes("селлер") || r.includes("e-commerce") || r.includes("ecommerce") || r.includes("marketplace")) return "ecommerce_seller";
  if (r.includes("sales") || r.includes("продаж") || r.includes("bdm") || r.includes("business development") || r.includes("account manager") || r.includes("менеджер по продажам")) return "sales_manager";

  return null;
}




