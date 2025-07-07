document.addEventListener('DOMContentLoaded', () => {
    // Clave de API (dejar en blanco para que Canvas la gestione)
    const apiKey = "AIzaSyDCdzaN2ICI4g7NA6ZAS0Ak1U0l_0rJx6c";

    // --- Funcionalidad: Descubrir más sobre los artistas ---
    const artistBtn = document.getElementById('gemini-artist-btn');
    const artistResultContainer = document.getElementById('gemini-artist-result');

    if (artistBtn && artistResultContainer) {
        artistBtn.addEventListener('click', handleArtistDiscovery);
    }

    async function handleArtistDiscovery() {
        // Mostrar indicador de carga
        artistResultContainer.style.display = 'block';
        artistResultContainer.classList.add('loading-state');
        artistResultContainer.innerHTML = '<div class="chat-message loading"><span></span><span></span><span></span></div>';
        artistBtn.disabled = true;

        try {
            // Extraer artistas de la sección
            const artistElements = document.querySelectorAll('#artistas h3, #artistas strong');
            const artists = Array.from(artistElements).map(el => el.innerText.replace('(tributo)', '').trim()).join(', ');

            const prompt = `
                Eres un promotor de un festival de música llamado "Sonidos de la Ciudad".
                Tu tarea es generar una breve descripción (2-3 frases) para cada uno de los siguientes artistas o grupos: ${artists}.
                El tono debe ser muy entusiasta, vendedor y emocionante, para generar "hype" y animar a la gente a comprar entradas.
                Usa un lenguaje vibrante. Estructura la respuesta con el nombre del artista como un título (usando <h4>) y luego la descripción (usando <p>).
            `;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const result = await response.json();
            
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                const generatedText = result.candidates[0].content.parts[0].text;
                artistResultContainer.innerHTML = generatedText;
            } else {
                artistResultContainer.innerHTML = '<p>No se pudo generar la información en este momento. Inténtalo de nuevo.</p>';
            }

        } catch (error) {
            console.error('Error en Gemini Artist Discovery:', error);
            artistResultContainer.innerHTML = '<p>¡Ups! Algo salió mal. Por favor, intenta de nuevo más tarde.</p>';
        } finally {
            // Limpiar el estado de carga
            artistResultContainer.classList.remove('loading-state');
            artistBtn.disabled = false;
        }
    }

    // --- Funcionalidad: Ayúdame a decidir qué ver ---
    const scheduleBtn = document.getElementById('gemini-schedule-btn');
    const scheduleResultContainer = document.getElementById('gemini-schedule-result');

    if (scheduleBtn && scheduleResultContainer) {
        scheduleBtn.addEventListener('click', handleScheduleRecommendation);
    }

    async function handleScheduleRecommendation() {
        // Mostrar indicador de carga
        scheduleResultContainer.style.display = 'block';
        scheduleResultContainer.classList.add('loading-state');
        scheduleResultContainer.innerHTML = '<div class="chat-message loading"><span></span><span></span><span></span></div>';
        scheduleBtn.disabled = true;

        try {
            // Extraer cronograma de la tabla
            const scheduleRows = document.querySelectorAll('#cronograma table tbody tr');
            const scheduleData = Array.from(scheduleRows).map(row => {
                const cells = row.querySelectorAll('td');
                return `- Evento: ${cells[1].innerText} con ${cells[2].innerText}. Género: Rock/Pop. Fecha: ${cells[0].innerText}, ${cells[4].innerText}hs en ${cells[3].innerText}.`;
            }).join('\n');

            const prompt = `
                Eres un guía amigable y experto del festival "Sonidos de la Ciudad".
                Basado en el siguiente cronograma, crea una recomendación para diferentes tipos de público.
                Tu objetivo es ayudar a la gente a decidir a qué evento ir con un tono muy persuasivo y divertido.
                
                Cronograma:
                ${scheduleData}

                Genera 3 recomendaciones con los siguientes títulos en formato <h4>:
                1. Para una noche de rock intenso:
                2. Para bailar hasta el amanecer:
                3. Para una velada con clase y ritmo:

                Debajo de cada título, escribe un párrafo corto (<p>) recomendando el evento más adecuado del cronograma para ese tipo de público, explicando por qué es la mejor opción.
            `;
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const result = await response.json();

            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                const generatedText = result.candidates[0].content.parts[0].text;
                scheduleResultContainer.innerHTML = generatedText;
            } else {
                scheduleResultContainer.innerHTML = '<p>No se pudieron generar las recomendaciones. Inténtalo de nuevo.</p>';
            }

        } catch (error) {
            console.error('Error en Gemini Schedule Recommendation:', error);
            scheduleResultContainer.innerHTML = '<p>¡Ups! Algo salió mal. Por favor, intenta de nuevo más tarde.</p>';
        } finally {
            // Limpiar el estado de carga
            scheduleResultContainer.classList.remove('loading-state');
            scheduleBtn.disabled = false;
        }
    }
});
