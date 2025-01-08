self.addEventListener('message', async (event) => {
    const { mode, query } = event.data;
    const CORZ = 'https://cors.ż.co/api/cors?url=';
    try {
        let proxyUrl;
        if (mode === 'search') {
            proxyUrl = `${CORZ}https://duckduckgo.com/ac/?q=${query}`;
        } else if (mode === 'weather') {
            proxyUrl = `${CORZ}https://api.merrysky.net/weather?q=${query}&source=pirateweather`;
        } else if (mode === 'news') {
            proxyUrl = `${CORZ}${query}`;
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