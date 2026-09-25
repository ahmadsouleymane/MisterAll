const API = import.meta.env.VITE_API_URL + '/chat';

// Envoyer un message et recevoir la réponse IA
export const sendMessage = async (conversationId, message) => {
  try {
    const response = await fetch(`${API}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify({ conversationId, message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...data };
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Envoyer un message avec streaming SSE
export const sendMessageStream = async (conversationId, message, onChunk, onDone, onError) => {
  try {
    const response = await fetch(`${API}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify({ conversationId, message })
    });

    if (!response.ok) {
      const data = await response.json();
      throw { status: response.status, ...data };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let conversationIdFromStream = null;
    let buffer = ''; // Buffer pour gérer les chunks partiels

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Ajouter le nouveau texte au buffer
      buffer += decoder.decode(value, { stream: true });

      // Traiter toutes les lignes complètes
      const lines = buffer.split('\n');
      // Garder la dernière ligne incomplète dans le buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'start') {
              conversationIdFromStream = data.conversationId;
            } else if (data.type === 'chunk') {
              onChunk(data.content);
            } else if (data.type === 'done') {
              onDone(conversationIdFromStream, data.limits);
            } else if (data.type === 'error') {
              onError(data.error);
            }
          } catch (e) {
            // Ignorer les lignes mal formées
          }
        }
      }
    }

    // Traiter le reste du buffer s'il reste quelque chose
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6));
        if (data.type === 'chunk') {
          onChunk(data.content);
        } else if (data.type === 'done') {
          onDone(conversationIdFromStream, data.limits);
        }
      } catch (e) {
        // Ignorer
      }
    }
  } catch (error) {
    onError(error.error || error.message || 'Erreur de connexion');
    throw error;
  }
};

// Récupérer les limites de messages
export const getMessageLimits = async () => {
  try {
    const response = await fetch(`${API}/limits`, {
      method: 'GET',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des limites');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Récupérer la liste des conversations
export const getConversations = async () => {
  try {
    const response = await fetch(`${API}/conversations`, {
      method: 'GET',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des conversations');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Récupérer une conversation spécifique
export const getConversation = async (id) => {
  try {
    const response = await fetch(`${API}/conversation/${id}`, {
      method: 'GET',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la conversation');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Créer une nouvelle conversation
export const createConversation = async (title = null) => {
  try {
    const response = await fetch(`${API}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la conversation');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Supprimer une conversation
export const deleteConversation = async (id) => {
  try {
    const response = await fetch(`${API}/conversation/${id}`, {
      method: 'DELETE',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la conversation');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Modifier le titre d'une conversation
export const updateConversationTitle = async (id, title) => {
  try {
    const response = await fetch(`${API}/conversation/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la modification de la conversation');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
