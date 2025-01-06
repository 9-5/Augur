self.addEventListener('message', async (event) => {
    const { query } = event.data;

    try {
        const proxyUrl = `https://cors.ż.co/api/cors?url=https://duckduckgo.com/ac/?q=${query}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        self.postMessage({ suggestions: data });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        self.postMessage({ error: error.message });
    }
});