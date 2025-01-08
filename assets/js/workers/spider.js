self.addEventListener('message', async (event) => {
    const { mode, query } = event.data;

    try {
        let proxyUrl;
        if (mode === 'search') {
            proxyUrl = `https://cors.ż.co/api/cors?url=https://duckduckgo.com/ac/?q=${query}`;
        } else if (mode === 'weather') {
            proxyUrl = `https://cors.ż.co/api/cors?url=https://api.merrysky.net/weather?q=${query}&source=pirateweather`;
        } else {
            throw new Error('Invalid mode specified');
        }

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Send the response back to the main thread
        self.postMessage({ mode, data });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        self.postMessage({ mode, error: error.message });
    }
});