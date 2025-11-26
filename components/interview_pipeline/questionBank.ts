
import { Stage } from "./pipeline";

type Difficulty = 1 | 2 | 3 | 4 | 5;

type RoleKey =
  | "data_scientist"
  | "backend"
  | "frontend"
  | "devops"
  | "ml_engineer"
  | "product_manager"
  | "fraud_analyst";

type QuestionEntry = {
  text: string;
  stage: Stage;
  difficulty: Difficulty;
};

export const QUESTION_BANK: Record<RoleKey, QuestionEntry[]> = {
  data_scientist: [
    // Introduction
    {
      stage: "Introduction",
      difficulty: 1,
      text: "Здравствуйте! Меня зовут Зарина, я ваш AI-интервьюер из Wind AI. Хотелось бы узнать больше о вашем опыте. Для начала, расскажите немного о себе и вашем опыте в Data Science?",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Привет! Меня зовут Зарина. Добро пожаловать на интервью в Wind AI. Я здесь, чтобы оценить ваши технические навыки. Можете кратко описать ваш профессиональный путь в Data Science?",
    },

    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте анализа данных и вашей роли как Data Scientist в прошлых проектах.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "Какой проект по анализу данных вы считаете своим самым успешным и почему?",
    },
    {
      stage: "Background",
      difficulty: 3,
      text: "Опишите типичный end-to-end проект Data Science, в котором вы участвовали, от постановки задачи до деплоя.",
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
      text: "Объясните разницу между переобучением (overfitting) и недообучением (underfitting) на понятном примере.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы разбиваете датасет на обучающую, валидационную и тестовую выборки и почему это важно?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие метрики вы используете для оценки модели классификации и когда вы предпочитаете одну метрику другой?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите, как вы работаете с дисбалансом классов в задаче классификации.",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Расскажите о случае, когда модель показывала хорошие оффлайн-метрики, но провалилась в продакшене. Как вы нашли причину?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите ваш подход к feature engineering в одном из ваших реальных проектов.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы организуете эксперименты в Data Science: логирование, сравнение моделей, воспроизводимость?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Расскажите о сложном кейсе, когда вам пришлось значительно менять постановку задачи или бизнес-метрику в ходе проекта.",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что у вас есть данные о транзакциях пользователей. Как бы вы подошли к задаче предсказания оттока клиентов?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы спроектировали систему A/B тестирования для новой рекомендательной модели?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "У вас есть логи веб-приложения. Как бы вы извлекли полезные признаки для предсказания конверсии?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Модель внезапно начала выдавать гораздо худшие результаты. Какие шаги вы предпримете, чтобы найти проблему?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Вы заметили дрифт данных в продакшене. Как вы это диагностируете и что будете делать дальше?",
    },
    {
      stage: "Debug",
      difficulty: 5,
      text: "Как вы подходите к объяснимости моделей (model explainability) для бизнес-стейкхолдеров?",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Чему вы хотите научиться в следующем году как Data Scientist?",
    },
    {
      stage: "WrapUp",
      difficulty: 3,
      text: "На какие компромиссы вы готовы пойти между качеством модели и сложностью её поддержки в продакшене?",
    },
  ],

  backend: [
    // Introduction
    {
        stage: "Introduction",
        difficulty: 1,
        text: "Здравствуйте! Меня зовут Зарина, я буду проводить интервью на позицию Backend Developer в Wind AI. Можете начать с рассказа о себе и вашем опыте работы с бэкенд-системами?",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Привет! Меня зовут Зарина, я ваш AI-интервьюер из Wind AI. Рада познакомиться. Пожалуйста, представьтесь и расскажите о ваших ключевых проектах в бэкенд-разработке.",
    },
    // Background
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте разработки серверных приложений.",
    },
    {
      stage: "Background",
      difficulty: 2,
      text: "С какими языками и фреймворками для бэкенда вы работали?",
    },

    // Core
    {
      stage: "Core",
      difficulty: 2,
      text: "Опишите типичную архитектуру REST API, которую вы разрабатывали.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы проектируете схему базы данных для нового сервиса?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Какие техники вы используете для обработки ошибок и логирования в бэкенд-сервисах?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите, как вы реализуете аутентификацию и авторизацию в ваших проектах.",
    },

    // DeepDive
    {
      stage: "DeepDive",
      difficulty: 3,
      text: "Опишите случай, когда вам пришлось рефакторить монолит в микросервисы.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как вы подходите к оптимизации медленных запросов к базе данных?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Расскажите о вашем опыте использования очередей (RabbitMQ, Kafka и т.д.) в бэкенд-архитектуре.",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как вы проектируете контракт между микросервисами, чтобы минимизировать связанность?",
    },

    // Case
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что вам нужно спроектировать API для системы бронирования. С чего бы вы начали?",
    },
    {
      stage: "Case",
      difficulty: 4,
      text: "Как бы вы построили архитектуру сервиса для обработки большого объема однотипных запросов с пиковыми нагрузками?",
    },

    // Debug
    {
      stage: "Debug",
      difficulty: 3,
      text: "Как вы находите и исправляете баги, которые проявляются только в продакшене?",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Расскажите, как вы анализируете инцидент, связанный с падением SLA по задержке (latency).",
    },

    // WrapUp
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие бэкенд-технологии вы хотите освоить в будущем?",
    },
  ],

  frontend: [
    // Introduction
    {
        stage: "Introduction",
        difficulty: 1,
        text: "Привет! Меня зовут Зарина, я AI-интервьюер Wind AI. Рада пообщаться. Можете представиться и рассказать о вашем опыте во фронтенд-разработке?",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Здравствуйте! Меня зовут Зарина, добро пожаловать в Wind AI. Я здесь, чтобы оценить ваши навыки фронтенда. Для начала расскажите о своем бэкграунде и фреймворках, с которыми вы работаете.",
    },
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте веб-разработки.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы управляете состоянием (state management) в React приложении?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Объясните разницу между CSR, SSR и SSG и когда что лучше использовать.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите случай, когда вам пришлось значительно оптимизировать производительность фронтенда.",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Как бы вы спроектировали интерфейс для сложного фильтра поиска с множеством параметров?",
    },
    {
      stage: "Debug",
      difficulty: 3,
      text: "Как вы отлавливаете и чините трудновоспроизводимые баги в браузере?",
    },
  ],

  devops: [
    // Introduction
    {
        stage: "Introduction",
        difficulty: 1,
        text: "Здравствуйте. Меня зовут Зарина, я ваш AI-интервьюер Wind AI на позицию DevOps. Представьтесь, пожалуйста, и расскажите о вашем опыте работы с инфраструктурой?",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Привет! Меня зовут Зарина, это интервью в Wind AI. Давайте обсудим ваш DevOps опыт. Можете кратко описать ваш бэкграунд и инструменты, которые вы используете чаще всего?",
    },
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте в DevOps и SRE.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Какие инструменты CI/CD вы использовали и как настраивали пайплайны?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы подходите к мониторингу и алертингу продакшен-сервисов?",
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

  ml_engineer: [
    // Introduction
    {
        stage: "Introduction",
        difficulty: 1,
        text: "Здравствуйте! Меня зовут Зарина, я проведу ваше интервью в Wind AI на позицию ML Engineer. Для начала, расскажите о себе и вашем опыте деплоя ML моделей?",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Привет! Меня зовут Зарина, добро пожаловать в Wind AI. Представьтесь и опишите ваш опыт построения и поддержки ML пайплайнов.",
    },
    {
      stage: "Background",
      difficulty: 1,
      text: "В чем, по вашему мнению, главное отличие Data Scientist от ML Engineer?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы деплоите ML модели в продакшен?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Расскажите о вашем опыте построения пайплайнов признаков (feature store, ETL).",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Опишите систему мониторинга качества моделей, которую вы строили или хотели бы построить.",
    },
    {
      stage: "Debug",
      difficulty: 4,
      text: "Как вы диагностируете деградацию модели после релиза новой версии?",
    },
  ],

  product_manager: [
    // Introduction
    {
        stage: "Introduction",
        difficulty: 1,
        text: "Привет. Меня зовут Зарина, я ваш AI-интервьюер из Wind AI. Мне интересно узнать о вашем стиле управления продуктом. Можете представиться и рассказать о своем опыте?",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Здравствуйте! Меня зовут Зарина. Я хотела бы услышать о вашем продуктовом опыте для Wind AI. Пожалуйста, представьтесь и поделитесь ярким моментом из вашей карьеры.",
    },
    {
      stage: "Background",
      difficulty: 1,
      text: "Расскажите о вашем опыте работы Product Manager.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как вы приоритизируете задачи в бэклоге?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как вы формируете и проверяете продуктовые гипотезы?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Представьте, что retention пользователей падает. Как вы будете искать причину?",
    },
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие продукты вас вдохновляют и почему?",
    },
  ],

  fraud_analyst: [
    {
        stage: "Introduction",
        difficulty: 1,
        text: "Здравствуйте! Меня зовут Зарина, я ваш AI-интервьюер из Wind AI. Мы ищем сильного аналитика по антифроду. Расскажите вкратце о своем опыте работы с транзакционными данными и SQL.",
    },
    {
        stage: "Introduction",
        difficulty: 2,
        text: "Привет! Меня зовут Зарина, я AI-интервьюер Wind AI. Давай начнем. Опиши свой опыт выявления мошеннических схем. Какую роль в твоей работе играет SQL?",
    },
    {
      stage: "Background",
      difficulty: 1,
      text: "С какими типами фрода (кардинг, ATO, бонус-хантинг) тебе приходилось сталкиваться чаще всего?",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Представь таблицу `payments` (user_id, amount, timestamp). Напиши логику SQL-запроса, чтобы найти пользователей, которые потратили больше $5000 за последние сутки.",
    },
    {
      stage: "Core",
      difficulty: 2,
      text: "Как с помощью SQL найти дубликаты транзакций, если у нас нет уникального ID события, но есть сумма, время и ID пользователя?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "У тебя есть таблица `logins`. Как написать запрос, чтобы найти пользователей, которые заходили с более чем 3 разных IP-адресов за один час?",
    },
    {
      stage: "Core",
      difficulty: 3,
      text: "Как использовать `LEFT JOIN` для поиска транзакций, у которых нет соответствующей записи в таблице верификации 3D-Secure?",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Нам нужно отследить 'velocity' (скорость) трат. Опиши, как использовать оконные функции (WINDOW functions), чтобы посчитать кумулятивную сумму трат пользователя за скользящее окно в 15 минут.",
    },
    {
      stage: "DeepDive",
      difficulty: 4,
      text: "Как с помощью SQL выявить цепочки связанных аккаунтов (link analysis), например, через общий `device_fingerprint` или `cookie_hash`?",
    },
    {
      stage: "DeepDive",
      difficulty: 5,
      text: "Как бы ты оптимизировал SQL-запрос для поиска паттернов отмывания денег (AML), который выполняется слишком долго на большом объеме данных (Terabytes)?",
    },
    {
      stage: "Case",
      difficulty: 3,
      text: "Мы видим резкий скачок чарджбеков в конкретном регионе. Какой SQL-запрос ты напишешь первым, чтобы диагностировать проблему?",
    },
    {
      stage: "Debug",
      difficulty: 3,
      text: "Правило блокировки по IP начало давать много ложных срабатываний (False Positives). Как с помощью SQL проверить пересечение заблокированных IP с белыми списками или подсетями провайдеров?",
    },
    {
      stage: "WrapUp",
      difficulty: 2,
      text: "Какие метрики качества антифрод-правил (Precision, Recall) ты считаешь самыми важными и почему?",
    },
  ],
};

function roleToKey(role: string): RoleKey | null {
    const r = role.toLowerCase();
    if (r.includes("fraud") || r.includes("anti-fraud") || r.includes("risk") || r.includes("compliance") || r.includes("security analyst")) return "fraud_analyst";
    if (r.includes("data") && r.includes("scientist")) return "data_scientist";
    if (r.includes("ml") || r.includes("machine learning")) return "ml_engineer";
    if (r.includes("backend")) return "backend";
    if (r.includes("front")) return "frontend";
    if (r.includes("devops") || r.includes("sre")) return "devops";
    if (r.includes("product") && r.includes("manager")) return "product_manager";
    
    // Strict fallback: Do NOT default to data_scientist for roles like "Financial", "Risk", "Fraud".
    // Returning null allows the Pipeline to generate a custom question via LLM.
    return null;
}

export function getQuestionForRoleAndStage(
  role: string,
  stage: Stage,
  difficulty: Difficulty,
  usedQuestions: string[] = []
): string | null {
  const key = roleToKey(role);
  if (!key) return null;

  const candidates = QUESTION_BANK[key].filter(
    (q) =>
      q.stage === stage &&
      Math.abs(q.difficulty - difficulty) <= 1 &&
      !usedQuestions.includes(q.text)
  );

  if (!candidates.length) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx].text;
}
