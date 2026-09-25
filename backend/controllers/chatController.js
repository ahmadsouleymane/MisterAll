import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Course from "../models/courseModel.js";
import CourseAssets from "../models/courseAssetsModel.js";
import { ChatGroq } from "@langchain/groq";

const GROQ_API_KEY = process.env.GROQ_KEY;
const MODEL_NAME = "llama-3.3-70b-versatile";

// Limites de messages par jour - gratuit pour tous
const MESSAGE_LIMITS = {
  free: 100,
  premium: 100
};

// Vérifier si l'utilisateur est premium
function checkUserPremium(user) {
  if (!user.premium) return false;

  // Si pas de date d'expiration, c'est un premium permanent
  if (!user.premiumExpiry) return true;

  // Vérifier si la date d'expiration n'est pas passée
  const expiry = new Date(user.premiumExpiry);
  const now = new Date();
  return expiry > now;
}

// Créer une instance du modèle
function createChatModel() {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_KEY non configurée");
  }
  return new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: MODEL_NAME,
    temperature: 0.7,
    maxTokens: 2000,
  });
}

// Vérifier la limite de messages de l'utilisateur
async function checkMessageLimit(userId, isPremium) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Convertir userId en ObjectId si nécessaire
  const userObjectId = typeof userId === 'string'
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // Compter les messages envoyés aujourd'hui avec agrégation MongoDB
  const result = await Conversation.aggregate([
    { $match: { user_id: userObjectId } },
    { $unwind: "$messages" },
    {
      $match: {
        "messages.role": "user",
        "messages.createdAt": { $gte: today, $lt: tomorrow }
      }
    },
    { $count: "count" }
  ]);

  const messageCount = result.length > 0 ? result[0].count : 0;
  const limit = isPremium ? MESSAGE_LIMITS.premium : MESSAGE_LIMITS.free;
  const remaining = Math.max(0, limit - messageCount);

  return {
    allowed: messageCount < limit,
    used: messageCount,
    limit,
    remaining
  };
}

// Récupérer les cours de l'utilisateur (liste simple)
async function getUserCoursesSimple(userId) {
  const courses = await Course.find({ user_id: userId })
    .select("_id title subject")
    .lean();
  return courses;
}

// Analyser l'intent du message pour détecter les références aux cours
async function analyzeIntent(message, courses) {
  const courseTitles = courses.map(c => c.title.toLowerCase());
  const courseSubjects = courses.map(c => c.subject.toLowerCase());
  const messageLower = message.toLowerCase();

  const matchedCourses = [];

  courses.forEach(course => {
    const titleMatch = messageLower.includes(course.title.toLowerCase());
    const subjectMatch = messageLower.includes(course.subject.toLowerCase());

    // Recherche de mots clés communs
    const titleWords = course.title.toLowerCase().split(/\s+/);
    const keywordMatch = titleWords.some(word =>
      word.length > 3 && messageLower.includes(word)
    );

    if (titleMatch || subjectMatch || keywordMatch) {
      matchedCourses.push(course);
    }
  });

  // Détecter le type de contexte demandé
  let contextType = "resume"; // Par défaut, on utilise le résumé

  if (messageLower.includes("quiz") || messageLower.includes("question")) {
    contextType = "quiz";
  } else if (messageLower.includes("fiche") || messageLower.includes("sheet")) {
    contextType = "sheet";
  } else if (messageLower.includes("flashcard") || messageLower.includes("carte")) {
    contextType = "flashcard";
  } else if (messageLower.includes("contenu") || messageLower.includes("complet") || messageLower.includes("détail")) {
    contextType = "content";
  }

  return {
    needsContext: matchedCourses.length > 0,
    courseIds: matchedCourses.map(c => c._id),
    contextType,
    matchedCourses
  };
}

// Récupérer le contexte d'un cours
async function fetchCourseContext(courseIds, contextType) {
  if (!courseIds || courseIds.length === 0) return null;

  const contexts = [];

  for (const courseId of courseIds.slice(0, 2)) { // Max 2 cours pour limiter les tokens
    const course = await Course.findById(courseId).lean();
    const assets = await CourseAssets.findOne({ course_id: courseId }).lean();

    if (!course) continue;

    let contextData = `\n### Cours: ${course.title} (${course.subject})\n`;

    if (assets) {
      switch (contextType) {
        case "resume":
          if (assets.resume) {
            contextData += `**Résumé:**\n${assets.resume.slice(0, 3000)}\n`;
          }
          break;
        case "sheet":
          if (assets.sheets && assets.sheets.length > 0) {
            assets.sheets.slice(0, 2).forEach(sheet => {
              contextData += `**Fiche: ${sheet.title}**\n${sheet.content.slice(0, 1500)}\n`;
            });
          }
          break;
        case "quiz":
          if (assets.allQuizs && assets.allQuizs.length > 0) {
            contextData += `**Quiz disponibles:** ${assets.allQuizs.length} questions\n`;
            assets.allQuizs.slice(0, 5).forEach(q => {
              contextData += `- ${q.quiz}\n`;
            });
          }
          break;
        case "flashcard":
          if (assets.flashcards && assets.flashcards.length > 0) {
            contextData += `**Flashcards:** ${assets.flashcards.length} cartes\n`;
            assets.flashcards.slice(0, 5).forEach(f => {
              contextData += `- Q: ${f.question} | R: ${f.answer}\n`;
            });
          }
          break;
        case "content":
          if (course.content) {
            contextData += `**Contenu extrait:**\n${course.content.slice(0, 4000)}\n`;
          }
          break;
        default:
          if (assets.resume) {
            contextData += `**Résumé:**\n${assets.resume.slice(0, 3000)}\n`;
          }
      }
    }

    contexts.push({
      courseId,
      assetType: contextType,
      data: contextData
    });
  }

  return contexts;
}

// Construire le prompt système
function buildSystemPrompt(courses, fetchedContext) {
  let prompt = `Tu es MisterAll, un assistant pédagogique intelligent et bienveillant. Tu aides les étudiants à comprendre leurs cours et à réussir leurs examens.

À PROPOS DE TOI:
- Tu as été créé par Ahmad Souleymane, un développeur passionné par l'éducation et la technologie.
- MisterAll est une application web éducative qui aide les étudiants à mieux apprendre. Les étudiants peuvent uploader leurs cours (PDF, DOCX) et l'IA génère automatiquement des résumés, des fiches de révision, des quiz et des flashcards pour faciliter l'apprentissage.
- Si on te demande qui est ton créateur, réponds que c'est Ahmad Souleymane.
- Si on te demande ce qu'est MisterAll, explique que c'est une plateforme d'apprentissage intelligente qui transforme les cours en outils de révision interactifs.

RÈGLES IMPORTANTES:
1. Réponds TOUJOURS dans la langue de l'utilisateur (français par défaut)
2. Sois concis mais complet (max 400 mots sauf si demande détaillée)
3. Utilise le Markdown pour structurer tes réponses
4. Si tu n'as pas accès au contenu demandé, indique-le clairement
5. Ne jamais inventer de contenu - base-toi uniquement sur les données fournies
6. Sois encourageant et pédagogue

COURS DE L'ÉTUDIANT:
${courses.map(c => `- ${c.title} (${c.subject})`).join('\n')}
`;

  if (fetchedContext && fetchedContext.length > 0) {
    prompt += `\n\nCONTEXTE RÉCUPÉRÉ:\n`;
    fetchedContext.forEach(ctx => {
      prompt += ctx.data;
    });
  }

  prompt += `\n\nSi l'utilisateur pose une question sur un cours spécifique, utilise le contexte fourni.
Si aucun contexte n'est fourni et la question concerne un cours, propose à l'utilisateur de préciser le cours concerné.`;

  return prompt;
}

// Envoyer un message et obtenir une réponse
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const isPremium = checkUserPremium(req.user);
    const { conversationId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Le message ne peut pas être vide" });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Le message est trop long (max 2000 caractères)" });
    }

    // Vérifier la limite de messages
    const limitCheck = await checkMessageLimit(userId, isPremium);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: isPremium
          ? "Limite de 100 messages/jour atteinte. Réessayez demain."
          : "Limite de 10 messages/jour atteinte. Passez en Premium pour 100 messages/jour.",
        limit: limitCheck.limit,
        used: limitCheck.used,
        remaining: 0,
        isPremium
      });
    }

    // Trouver ou créer la conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user_id: userId,
        isArchived: false
      });
      if (!conversation) {
        return res.status(404).json({ error: "Conversation non trouvée" });
      }
    } else {
      conversation = new Conversation({
        user_id: userId,
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        messages: []
      });
    }

    // Récupérer les cours de l'utilisateur
    const courses = await getUserCoursesSimple(userId);

    // Analyser l'intent du message
    const intent = await analyzeIntent(message, courses);

    // Récupérer le contexte si nécessaire
    let fetchedContext = null;
    if (intent.needsContext) {
      fetchedContext = await fetchCourseContext(intent.courseIds, intent.contextType);

      // Ajouter les cours liés à la conversation
      intent.courseIds.forEach(courseId => {
        if (!conversation.relatedCourses.includes(courseId)) {
          conversation.relatedCourses.push(courseId);
        }
      });
    }

    // Ajouter le message de l'utilisateur
    const userMessage = {
      role: "user",
      content: message,
      contextUsed: fetchedContext ? fetchedContext.map(ctx => ({
        courseId: ctx.courseId,
        assetType: ctx.assetType
      })) : [],
      createdAt: new Date()
    };
    conversation.messages.push(userMessage);

    // Construire le prompt système
    const systemPrompt = buildSystemPrompt(courses, fetchedContext);

    // Préparer les messages pour l'IA (limiter à 10 derniers messages)
    const recentMessages = conversation.messages.slice(-10);
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    // Appeler l'IA
    let assistantContent;
    try {
      const model = createChatModel();
      const response = await model.invoke(aiMessages);
      assistantContent = response.content;
    } catch (aiError) {
      console.error("[Chat] Erreur IA:", aiError.message);

      // Sauvegarder quand même le message utilisateur
      await conversation.save();

      return res.status(503).json({
        error: "L'assistant est temporairement indisponible. Réessayez dans quelques instants.",
        conversationId: conversation._id,
        details: process.env.NODE_ENV !== 'production' ? aiError.message : undefined
      });
    }

    // Ajouter la réponse de l'assistant
    const assistantMessage = {
      role: "assistant",
      content: assistantContent,
      contextUsed: [],
      createdAt: new Date()
    };
    conversation.messages.push(assistantMessage);

    // Sauvegarder la conversation
    await conversation.save();

    // Recalculer les limites restantes
    const newLimitCheck = await checkMessageLimit(userId, isPremium);

    res.json({
      conversationId: conversation._id,
      message: assistantMessage,
      context: {
        coursesUsed: intent.matchedCourses.map(c => ({ id: c._id, title: c.title })),
        contextType: intent.contextType
      },
      limits: {
        used: newLimitCheck.used,
        limit: newLimitCheck.limit,
        remaining: newLimitCheck.remaining,
        isPremium
      }
    });

  } catch (error) {
    console.error("[Chat] Erreur sendMessage:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi du message",
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Envoyer un message avec streaming SSE
export const sendMessageStream = async (req, res) => {
  try {
    const userId = req.user._id;
    const isPremium = checkUserPremium(req.user);
    const { conversationId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Le message ne peut pas être vide" });
    }

    // Vérifier la limite de messages
    const limitCheck = await checkMessageLimit(userId, isPremium);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: isPremium
          ? "Limite de 100 messages/jour atteinte."
          : "Limite de 10 messages/jour atteinte. Passez en Premium pour 100 messages/jour.",
        limit: limitCheck.limit,
        used: limitCheck.used,
        remaining: 0,
        isPremium
      });
    }

    // Trouver ou créer la conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user_id: userId,
        isArchived: false
      });
      if (!conversation) {
        return res.status(404).json({ error: "Conversation non trouvée" });
      }
    } else {
      conversation = new Conversation({
        user_id: userId,
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        messages: []
      });
    }

    // Récupérer les cours et analyser l'intent
    const courses = await getUserCoursesSimple(userId);
    const intent = await analyzeIntent(message, courses);

    let fetchedContext = null;
    if (intent.needsContext) {
      fetchedContext = await fetchCourseContext(intent.courseIds, intent.contextType);
      intent.courseIds.forEach(courseId => {
        if (!conversation.relatedCourses.includes(courseId)) {
          conversation.relatedCourses.push(courseId);
        }
      });
    }

    // Ajouter le message utilisateur
    const userMessage = {
      role: "user",
      content: message,
      contextUsed: fetchedContext ? fetchedContext.map(ctx => ({
        courseId: ctx.courseId,
        assetType: ctx.assetType
      })) : [],
      createdAt: new Date()
    };
    conversation.messages.push(userMessage);
    await conversation.save();

    // Configurer SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Envoyer l'ID de conversation immédiatement
    res.write(`data: ${JSON.stringify({ type: 'start', conversationId: conversation._id })}\n\n`);

    // Construire le prompt et les messages
    const systemPrompt = buildSystemPrompt(courses, fetchedContext);
    const recentMessages = conversation.messages.slice(-10);
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    // Streaming avec LangChain
    let fullContent = '';
    try {
      const model = createChatModel();
      const stream = await model.stream(aiMessages);

      for await (const chunk of stream) {
        const text = chunk.content || '';
        if (text) {
          fullContent += text;
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`);
        }
      }

      // Sauvegarder la réponse complète
      const assistantMessage = {
        role: "assistant",
        content: fullContent,
        contextUsed: [],
        createdAt: new Date()
      };
      conversation.messages.push(assistantMessage);
      await conversation.save();

      // Envoyer les limites mises à jour
      const newLimitCheck = await checkMessageLimit(userId, isPremium);
      res.write(`data: ${JSON.stringify({
        type: 'done',
        limits: {
          used: newLimitCheck.used,
          limit: newLimitCheck.limit,
          remaining: newLimitCheck.remaining,
          isPremium
        }
      })}\n\n`);

    } catch (aiError) {
      console.error("[Chat] Erreur streaming IA:", aiError.message);
      res.write(`data: ${JSON.stringify({ type: 'error', error: "Erreur de l'assistant" })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error("[Chat] Erreur sendMessageStream:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  }
};

// Récupérer toutes les conversations de l'utilisateur
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      user_id: userId,
      isArchived: false
    })
      .select("_id title updatedAt messages")
      .sort({ updatedAt: -1 })
      .lean();

    // Ajouter le nombre de messages et le dernier message
    const result = conversations.map(conv => ({
      _id: conv._id,
      title: conv.title,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length,
      lastMessage: conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1].content.slice(0, 100)
        : null
    }));

    res.json(result);

  } catch (error) {
    console.error("Erreur getConversations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des conversations" });
  }
};

// Récupérer une conversation spécifique
export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      user_id: userId
    }).lean();

    if (!conversation) {
      return res.status(404).json({ error: "Conversation non trouvée" });
    }

    res.json(conversation);

  } catch (error) {
    console.error("Erreur getConversation:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de la conversation" });
  }
};

// Créer une nouvelle conversation
export const createConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title } = req.body;

    const conversation = new Conversation({
      user_id: userId,
      title: title || "Nouvelle conversation",
      messages: []
    });

    await conversation.save();

    res.status(201).json(conversation);

  } catch (error) {
    console.error("Erreur createConversation:", error);
    res.status(500).json({ error: "Erreur lors de la création de la conversation" });
  }
};

// Supprimer (archiver) une conversation
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, user_id: userId },
      { isArchived: true },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation non trouvée" });
    }

    res.json({ success: true, message: "Conversation supprimée" });

  } catch (error) {
    console.error("Erreur deleteConversation:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la conversation" });
  }
};

// Modifier le titre d'une conversation
export const updateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Le titre ne peut pas être vide" });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, user_id: userId },
      { title: title.slice(0, 100) },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation non trouvée" });
    }

    res.json(conversation);

  } catch (error) {
    console.error("Erreur updateConversation:", error);
    res.status(500).json({ error: "Erreur lors de la modification de la conversation" });
  }
};

// Récupérer les limites de l'utilisateur
export const getMessageLimits = async (req, res) => {
  try {
    const userId = req.user._id;
    const isPremium = checkUserPremium(req.user);

    const limitCheck = await checkMessageLimit(userId, isPremium);

    res.json({
      ...limitCheck,
      isPremium
    });

  } catch (error) {
    console.error("Erreur getMessageLimits:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des limites" });
  }
};
