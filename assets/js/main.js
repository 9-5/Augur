const { useState, useEffect, useRef } = React;
const Draggable = ReactDraggable;

const searchEngines = [
    ["g", "https://www.google.com/search?q={Q}", "Google"],
    ["d", "https://duckduckgo.com/?q={Q}", "DuckDuckGo"],
    ["s", "https://www.startpage.com/do/search?query={Q}", "StartPage"],
    ["p", "https://engine.presearch.org/search?q={Q}", "Presearch"],
    ["x", "https://seek.fyi/?q={Q}", "SearX"],
    ["q", "https://www.qwant.com/?q={Q}&t=web", "Qwant"],
    ["w", "https://www.wolframalpha.com/input/?i={Q}", "Wolfram"],
    ["a", "https://alternativeto.net/browse/search?q={Q}", "AlternativeTo"],
    ["o", "https://ahmia.fi/search/?q={Q}", "Onion/TOR"],
];
const iconLinks = {
    "folder": [
        { title: "Å¼.co", url: "https://Å¼.co" },
        { title: "0KB.org", url: "https://0kb.org" },
        { title: "Zennit @ 0KB", url: "https://zen.0kb.org" },
        { title: "Zennit @ Å¼", url: "https://zen.Å¼.co" },
        { title: "Clock @ 0KB", url: "https://clock.0kb.org" 
... (truncated) ...
          </div>
                    <p className="text-lg">Welcome to Augur.</p>
                    <p className="text-lg">Augur is a sweet and simple startpage with many features and customizations.</p>
                    <div className="flex flex-col space-y-2 mt-4">
                        <a href="https://Å¼.co/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><i className="fas fa-code mr-2"></i>Å¼.co</a>
                        <a href="https://github.com/9-5/Augur" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><i className="fab fa-github mr-2"></i> GitHub Repo</a>
                        <a href="https://johnle.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><i className="fas fa-user mr-2"></i> Developer Site</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
