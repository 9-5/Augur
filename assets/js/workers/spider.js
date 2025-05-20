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
            throw new Error(`HTTP error! Status: ${response.status}\n${await response.text()}\n${proxyUrl}`);
        }

        let data;
        if (mode === 'news') {
            data = await response.text();
        } else {
            data = await response.json();
        }
        self.postMessage({ mode, data, query });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        self.postMessage({ mode, error: error.message, query });
    }
});