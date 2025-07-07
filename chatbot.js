document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Clave de API (dejar en blanco para que Canvas la gestione)
    const apiKey = "AIzaSyDCdzaN2ICI4g7NA6ZAS0Ak1U0l_0rJx6c"; 

    // Visibilidad del chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.toggle('visible');
    });

    chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('visible');
    });

    // Enviar mensaje al presionar Enter
    chatbotInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    });

    // Enviar mensaje al hacer clic en el botón
    chatbotSend.addEventListener('click', handleSendMessage);

    /**
     * Extrae el contenido de texto relevante de la página para usarlo como contexto.
     * @returns {string} El texto extraído de la página.
     */
    function getPageContext() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            // Clona el nodo para no modificar el DOM original
            const clone = mainContent.cloneNode(true);
            // Elimina elementos no deseados como scripts, formularios, iframes, etc.
            clone.querySelectorAll('script, form, iframe, button, audio, #chatbot-container').forEach(el => el.remove());
            // Extrae el texto, limpiando espacios extra
            return clone.innerText.replace(/\s\s+/g, ' ').trim();
        }
        return '';
    }

    /**
     * Muestra un mensaje en la interfaz del chat.
     * @param {string} text - El texto del mensaje.
     * @param {string} sender - Quién envía el mensaje ('user' o 'bot').
     * @param {boolean} isLoading - Si es un indicador de carga.
     */
    function displayMessage(text, sender, isLoading = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        
        if (isLoading) {
            messageDiv.classList.add('loading');
            messageDiv.innerHTML = '<span></span><span></span><span></span>';
        } else {
            messageDiv.textContent = text;
        }
        
        chatbotMessages.appendChild(messageDiv);
        // Desplazar hacia abajo para ver el último mensaje
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return messageDiv;
    }

    /**
     * Maneja el envío de un mensaje del usuario y la respuesta del bot.
     */
    async function handleSendMessage() {
        const userInput = chatbotInput.value.trim();
        if (userInput === '') return;

        displayMessage(userInput, 'user');
        chatbotInput.value = '';

        const loadingIndicator = displayMessage('', 'bot', true);

        try {
            const pageContext = getPageContext();
            const prompt = `
                Eres un asistente de ventas virtual para un festival de música llamado "Sonidos de la Ciudad".
                Tu objetivo es ser amable, convincente y ayudar a los usuarios a resolver sus dudas para que compren entradas.
                Usa un tono vendedor y entusiasta.
                BASA TUS RESPUESTAS ESTRICTAMENTE en la siguiente información del sitio web. NO inventes información.

                --- INFORMACIÓN DEL SITIO WEB ---
                ${pageContext}
                --- FIN DE LA INFORMACIÓN ---

                Si la pregunta del usuario NO se relaciona con el festival, los artistas, las entradas, la ubicación o la información proporcionada,
                DEBES responder EXACTAMENTE con: "Disculpé, no tengo esa información. Si tienes alguna duda acerca del festival no dudes en preguntarme, estoy para ayudarte."

                Pregunta del usuario: "${userInput}"
            `;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const payload = {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error de la API: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Eliminar el indicador de carga
            loadingIndicator.remove();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botResponse = result.candidates[0].content.parts[0].text;
                displayMessage(botResponse, 'bot');
            } else {
                 // Manejar respuesta vacía o mal formada
                displayMessage("Lo siento, no pude procesar tu solicitud en este momento.", 'bot');
            }

        } catch (error) {
            console.error('Error al contactar la API de Gemini:', error);
            // Eliminar el indicador de carga en caso de error
            loadingIndicator.remove();
            displayMessage('¡Ups! Algo salió mal. Por favor, intenta de nuevo más tarde.', 'bot');
        }
    }
});
