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
        { title: "ż.co", url: "https://ż.co" },
        { title: "0KB.org", url: "https://0kb.org" },
        { title: "Zennit @ 0KB", url: "https://zen.0kb.org" },
        { title: "Zennit @ ż", url: "https://zen.ż.co" },
        { title: "Clock @ 0KB", url: "https://clock.0kb.org" },
        { title: "Clock @ ż", url: "https://clock.ż.co" }
    ],
    "film": [
        { title: "YouTube", url: "https://youtube.com" },
        { title: "Watchug", url: "https://watchug.com" },
    ],
    "share-alt": [
        { title: "r/news", url: "https://reddit.com/r/news/hot" },
        { title: "r/technology", url: "https://reddit.com/r/technology/hot" },
        { title: "r/gaming", url: "https://reddit.com/r/gaming/hot" },
        { title: "Facebook", url: "https://facebook.com" },
        { title: "X", url: "https://X.com" },
        { title: "Bluesky", url: "https://bsky.app" }
    ],
    "code": [
        { title: "GitHub", url: "https://github.com" },
        { title: "GitLab", url: "https://gitlab.com" },
        { title: "Vercel", url: "https://vercel.com" },
        { title: "Heroku", url: "https://heroku.com" },
        { title: "Netlify", url: "https://netlify.com" }
    ],
    "book": [
        { title: "Goodreads", url: "https://example.com/26" },
        { title: "Poetry", url: "https://www.poetryfoundation.org/poems" },

    ],
    "cloud-download-alt": [
        { title: "Google Drive", url: "https://drive.google.com" },
        { title: "Mega", url: "https://mega.nz" },
        { title: "Dropbox", url: "https://dropbox.com" },
    ],
};

const rssFeeds = [
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://news.yahoo.com/rss/mostviewed",
    "https://www.theguardian.com/world/rss"
    ];



function App() {
    const [isSetup, setIsSetup] = useState(() => localStorage.getItem('isSetup') === 'true');
    const [defaultEngine, setDefaultEngine] = useState(() => {
        const savedEngine = localStorage.getItem('searchEngine');
        return savedEngine ? JSON.parse(savedEngine) : searchEngines[0];
    });
    const themes = [{ name: 'Ocean', className: '' }, { name: 'Sky', className: 'sky' }, { name: 'Forest', className: 'forest' }, { name: 'Bamboo', className: 'bamboo' }, { name: 'Crimson', className: 'crimson' }, { name: 'Blush', className: 'blush' }, { name: 'Petal', className: 'petal' }, { name: 'Lotus', className: 'lotus' }, { name: 'Amethyst', className: 'amethyst' }, { name: 'RetroBoy', className: 'retroboy'}];
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('theme') || 'Ocean';
    });
    const [query, setQuery] = useState("");
    const [dropdown, setDropdown] = useState(null);
    const [dateTime, setDateTime] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const suggestionRef = useRef(null);
    const weatherRef = useRef(null);
    const newsRef = useRef(null);
    const dropdownRef = useRef(null);
    const [customLinks, setCustomLinks] = useState(() => {
        const savedLinks = localStorage.getItem('customLinks');
        return savedLinks ? JSON.parse(savedLinks) : iconLinks;
    });
    const [stickyNotes, setStickyNotes] = useState(() => {
        const savedNotes = localStorage.getItem('stickyNotes');
        return savedNotes ? JSON.parse(savedNotes) : [];
    });
    const [showStickyNotes, setShowStickyNotes] = useState(false);
    const [activeStickyNote, setActiveStickyNote] = useState(null);
    const [showAddNotePopup, setShowAddNotePopup] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLocation, setWeatherLocation] = useState(() => localStorage.getItem('weatherLocation') || 'Warsaw');
    const [news, setNews] = useState([]);
    const [articleUrl, setArticleUrl] = useState(null);
    const [showArticlePopup, setShowArticlePopup] = useState(false);
    const [articleContent, setArticleContent] = useState(null);
    const [articleTitle, setArticleTitle] = useState(null);
    const [enableNews, setEnableNews] = useState(() => JSON.parse(localStorage.getItem('enableNews')) || false);
    const [enableWeather, setEnableWeather] = useState(() => JSON.parse(localStorage.getItem('enableWeather')) || false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showDevice, setShowDevice] = useState(false);


    const Time = () => {
        const [currentTime, setCurrentTime] = useState(new Date());
        useEffect(() => {
            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 100);
            return () => clearInterval(interval);
        }, []);
        

        return (
            <>
                <span className="text-white ml-2">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: '2-digit' })}</span>
                <span className="text-white ml-2">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
            </>
        );
    }
    
    const fetchArticleContent = async (url) => {
        try {
            const response = await fetch(`https://cors.ż.co/api/2?url=${url}`);
            const data = await response.text();
            setArticleContent(data);
        } catch (error) {
            console.error(`Error fetching article content: ${error}`);
        }
    };
      
    const ArticlePopup = () => {
        const handleClose = () => {
            setShowArticlePopup(false);
            setArticleContent(null);
        };
      
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <a href={articleUrl} className="text-white font-bold text-lg break-words md:break-normal overflow-scroll">{articleTitle}</a>
                        <button
                            className="text-white mr-2 mb-4 hover:text-gray-400"
                            onClick={handleClose}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    {articleContent ? (
                    <div className="text-white" dangerouslySetInnerHTML={{ __html: articleContent }} />
                    ) : (
                    <p>Loading article content...</p>
                    )}
                </div>
            </div>
        );
    };
      
    const processXML = async (xml) => {
        try {
            const parser = new RSSParser();
            const feed = await parser.parseString(xml);
            const articles = feed.items.slice(0, 5);
            return articles;
        } catch (error) {
            return [];
        }
    };
    
    const fetchNews = async (url) => {
        if  (newsRef.current) {
        newsRef.current.postMessage({ mode: 'news', query: url });
        return new Promise(resolve => {
            const handleNewsMessage = (event) => {
                if (event.data.mode === 'news') {
                    newsRef.current.removeEventListener('message', handleNewsMessage);
                    resolve(event.data.data);
                }
            };
            newsRef.current.addEventListener('message', handleNewsMessage);
        });
        } else {
            return [];
        }
    };
    const fetchAndProcessNews = async () => {
        const newsList = [];
        for (const url of rssFeeds) {
            const xml = await fetchNews(url);
            const articles = await processXML(xml);
            newsList.push(...articles);
        }
        setNews(newsList);
    };

    const renderNews = () => {
        if (news.length === 0) {
            fetchAndProcessNews();
        }
        
        return (
            <div className="flex flex-col  overflow-x-hidden mt-2">
                <h2 className="align-left text-white text-2xl font-bold ml-4">News</h2>
                <div className="overflow-x-auto items-center overflow-y-hidden h-full w-full sm:h-64 sm:w-full md:h-full md:w-full">
                    <div className="news-grid flex flex-nowrap">
                    {news.map((article, index) => (
                        <div key={index} className="news-item bg-gray-800 p-4 rounded shadow-lg ml-4">
                            <h3 
                                className="text-white text-md font-bold hover:underline hover:cursor-pointer break-words md:break-normal overflow-scroll"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setArticleTitle(article.title);
                                    setArticleUrl(article.link);
                                    setShowArticlePopup(true);
                                    fetchArticleContent(article.link);
                                }}
                            >
                                {article.title}
                            </h3>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        )
    };

    useEffect(() => {
        suggestionRef.current = new Worker('assets/js/workers/spider.js');
        weatherRef.current = new Worker('assets/js/workers/spider.js');
        newsRef.current = new Worker('assets/js/workers/spider.js');
        
        suggestionRef.current.onmessage = (event) => {
            if (event.data.error) {
                console.error(`Suggestions worker error: ${event.data.error}`);
            } else {
                setSuggestions(event.data.data);
            }
        };
        
        weatherRef.current.onmessage = (event) => {
            if (event.data.error) {
                console.error(`Weather worker error: ${event.data.error}`);
            } else {
                setWeatherData(event.data.data);
            }
        };
        
        newsRef.current.onmessage = (event) => {
            if (event.data.error) {
                console.error(`News worker error: ${event.data.error}`);
            } else {
                processXML(event.data.data);
            }
        };
    }, []);
    
    const fetchWeatherData = (location) => {
        if (weatherRef.current) {
          weatherRef.current.postMessage({ mode: 'weather', query: location });
        } else {
          console.error('Weather worker not initialized');
        }
      };

    useEffect(() => {
        localStorage.setItem('customLinks', JSON.stringify(customLinks));
    }, [customLinks]);

    useEffect(() => {
        const savedLinks = localStorage.getItem('customLinks');
        if (savedLinks) {
            setCustomLinks(JSON.parse(savedLinks));
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdown(null);
                setSuggestions([]);
            }
        };
    
        if (dropdown || suggestions.length > 0) {
            document.addEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdown, suggestions]);

    useEffect(() => {
        if (query.length > 2) {
            suggestionRef.current.postMessage({ mode: 'search', query });
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        localStorage.setItem('searchEngine', JSON.stringify(defaultEngine));
    }, [defaultEngine]);

    useEffect(() => {
        document.body.className = currentTheme === 'Ocean' ? '' : currentTheme.toLowerCase();
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        localStorage.setItem('enableNews', JSON.stringify(enableNews));
    }, [enableNews]);

    useEffect(() => {
        localStorage.setItem('enableWeather', JSON.stringify(enableWeather));
    }, [enableWeather]);

    const handleSearch = () => {
        const searchUrl = defaultEngine[1].replace("{Q}", query);
        window.open(searchUrl, "_blank");
    };

    const handleThemeChange = (theme) => {
        setCurrentTheme(theme.className);
    };

    const handleLocationChange = (event) => {
        const location = event.target.value;
        setWeatherLocation(location);
        localStorage.setItem('weatherLocation', location);
        fetchWeatherData(location);
    };

    const toggleDropdown = (icon) => {
        setDropdown(dropdown === icon ? null : icon);
    };

    const StickyNote = ({ note, onClose, onSave }) => {
        const [editedNote, setEditedNote] = useState(note);
        const [isEdited, setIsEdited] = useState(false);
    
        const handleInput = (e) => {
            const newText = e.target.innerText;
            setEditedNote(newText);
            setIsEdited(newText !== note);
        };
    
        const handleEditStickyNote = () => {
            const updatedNotes = stickyNotes.map((note, index) => 
                note === activeStickyNote ? editedNote : note
            );
            setStickyNotes(updatedNotes);
            localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
            setActiveStickyNote(editedNote);
        };
    
        return (
            <Draggable cancel={".interactable"}>
                <div className="sticky-note bg-gray-800 p-4 rounded shadow-lg relative w-64 cursor-move">
                    <p className="text-white font-bold mb-2">Note</p>
                    <button 
                        className="interactable absolute top-1 right-2 text-white hover:text-gray-400"
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <p
                        contentEditable={true}
                        onInput={handleInput}
                        className="outline-none interactable"
                        suppressContentEditableWarning={true}
                    >
                        {note.split('\n').map((line, index) => (
                            <span key={index}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </p>
                    {isEdited && (
                        <button
                            className="interactable bg-green-500 text-white px-4 py-2 rounded mt-2 w-full"
                            onClick={handleEditStickyNote}
                        >
                            Save
                        </button>
                    )}
                </div>
            </Draggable>
        );
    };

    const handleEditStickyNote = (updatedNote) => {
        const updatedNotes = stickyNotes.map((note, index) => 
            note === activeStickyNote ? updatedNote : note
        );
        setStickyNotes(updatedNotes);
        localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
        setActiveStickyNote(updatedNote);
    };

    
    const AddNotePopup = ({ onSave, onClose }) => {
        const [noteText, setNoteText] = useState("");
        const handleSave = () => {
            if (noteText.trim()) {
                onSave(noteText);
                setNoteText("");
                onClose();
            }
        };
    
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-gray-800 p-4 rounded w-[90vw] max-w-[400px]">
                    <h2 className="text-white text-xl mb-4">Add Sticky Note</h2>
                    <textarea
                        className="bg-gray-700 text-white p-2 rounded w-full mb-4"
                        rows="4"
                        placeholder="Enter your note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleAddStickyNote = () => {
        setShowAddNotePopup(true);
    };
    
    const handleSaveStickyNote = (newNote) => {
        if (newNote) {
            const updatedNotes = [...stickyNotes, newNote];
            setStickyNotes(updatedNotes);
            setActiveStickyNote(newNote);
            localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
        }
    };

    const handleCloseStickyNote = () => {
        setActiveStickyNote(null);
    };

    const handleSetActiveStickyNote = (note) => {
        setActiveStickyNote(note);
        setShowStickyNotes(false);
    };

    const handleViewStickyNotes = () => {
        setShowStickyNotes(!showStickyNotes);
    };
    const handleDeleteStickyNote = (index) => {
        const updatedNotes = stickyNotes.filter((_, i) => i !== index);
        setStickyNotes(updatedNotes);
        localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
    };

    const renderWeather = () => {
        if (!weatherData) {
            fetchWeatherData(weatherLocation);
            return <p>Loading weather data...</p>;
        }

        const renderWeatherWidget = () => {
            if (!weatherData || !weatherData.hourly || !weatherData.hourly.data) {
                return <p>No hourly temperature data available.</p>;
            }
        
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const startIndex = weatherData.hourly.data.findIndex((hour) => {
                const date = new Date(hour.time * 1000);
                return date.getHours() === currentHour;
            });
            const start = startIndex >= 0 ? startIndex : 0;
        
            return (
                <>             
                    <div className="flex flex-col overflow-x-hidden mt-4">
                        <h2 className="text-white text-2xl font-bold ml-4">Weather</h2>
                        <p className="text-white text-lg ml-4">{location}</p>
                        <div className="overflow-x-auto items-center overflow-y-hidden h-full w-full sm:h-64 sm:w-full md:h-full md:w-full">
                            <div className="weather-grid flex flex-nowrap">
                                {weatherData && weatherData.hourly && weatherData.hourly.data.slice(start).map((hour, index) => {
                                    const date = new Date(hour.time * 1000);
                                    const dateString = date.toLocaleDateString([], { weekday: 'short', year: '2-digit', month: '2-digit', day: '2-digit' });
                                    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const dateTimeString = `${dateString} ${timeString}`;
                                    
                                    const temperatureCelsius = hour.temperature;
                                    const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
                                    
                                    const precipType = hour.precipType || 'N/A';
                                    const precipAcc = hour.precipAccumulation || 0;
                                    const icon = hour.icon;
                                    const iconMap = {
                                        "clear-day": "sun",
                                        "clear-night": "moon",
                                        "rain": "cloud-rain",
                                        "snow": "snowflake",
                                        "sleet": "",
                                        "wind": "wind",
                                        "fog": "smog",
                                        "cloudy": "water",
                                        "partly-cloudy-day": "cloud-sun",
                                        "partly-cloudy-night": "cloud-moon"
                                    }
                                    const iconClass = iconMap[icon];
                                    return (
                                        <div key={index} className="weather-item flex flex-row ml-4 bg-gray-800 p-4 rounded shadow-lg">
                                            <h4 className="text-white text-lg font-bold text-left">{dateTimeString}</h4>
                                            <i className={`fas fa-${iconClass} text-white fa-2x`}></i>

                                            <div id="temperature" className="ml-4 flex flex-col">
                                                <p className="text-white text-sm ml-3">🌡️</p>
                                                <p className="text-white text-sm">{temperatureFahrenheit.toFixed(2)}°F</p>
                                                <p className="text-white text-sm">{temperatureCelsius}°C</p>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-white text-sm ml-1">🌦️</p>
                                                <p className="text-white text-sm">{precipType}</p>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-white text-sm ml-1">💧</p>
                                                <p className="text-white text-sm">{precipAcc.toFixed(2)} mm</p>
                                            </div>
                                            <i className="fas fa-weather-cloudy top-0 left-0 right-0 bottom-0"></i>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            );
        };
        const location = weatherData ? weatherData.merry.location.name : 'Loading...';

        return (
            renderWeatherWidget()
        );
    };

    const SetupPopup = () => {
        const [defaultEngine, setDefaultEngine] = useState(searchEngines[0]);
        const [currentTheme, setCurrentTheme] = useState(themes[0]);
        const [enableNews, setEnableNews] = useState(false);
        const [enableWeather, setEnableWeather] = useState(false);
        const [weatherLocation, setWeatherLocation] = useState('');
        
        const handleSaveSetup = () => {
            localStorage.setItem('searchEngine', JSON.stringify(defaultEngine));
            
            localStorage.setItem('theme', currentTheme.className);
            localStorage.setItem('enableNews', JSON.stringify(enableNews));
            localStorage.setItem('enableWeather', JSON.stringify(enableWeather));
            if (enableWeather) {
            localStorage.setItem('weatherLocation', weatherLocation);
            }
            localStorage.setItem('isSetup', JSON.stringify(true));
            setIsSetup(true);
        };
        
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-white font-bold text-xl mb-4">Setup</h1>
                    </div>
                    <p className="text-white text-lg font-bold mb-2">Default Search Engine</p>
                    <select
                        className="bg-gray-700 text-center text-white px-4 py-2 rounded w-full"
                        value={defaultEngine[2]}
                        onChange={(e) => {
                            const selectedEngine = searchEngines.find(engine => engine[2] === e.target.value);
                            setDefaultEngine(selectedEngine);
                            }}
                    >
                        {searchEngines.map((engine, index) => (
                            <option key={index} value={engine[2]}>
                            {engine[2]}
                            </option>
                        ))}
                    </select>
                    <p className="text-white text-lg font-bold mt-4">Theme</p>
                    <select
                        className="bg-gray-700 text-center text-white px-4 py-2 rounded w-full"
                        value={currentTheme.className}
                        onChange={(e) => setCurrentTheme(themes.find(theme => theme.className === e.target.value))}
                        >
                            {themes.map(theme => (
                                <option key={theme.name} value={theme.className}>{theme.name}</option>
                            ))}
                    </select>
                    <div className="flex items-center mb-2">
                        <span className="text-white mr-2" style={{ width: '200px' }}>Enable News</span>
                        <div className="relative">
                            <input 
                            type="checkbox" 
                            checked={enableNews} 
                            onChange={(e) => setEnableNews(e.target.checked)} 
                            className="hidden"
                            />
                            <div className={`toggle-switch ${enableNews ? 'on' : 'off'}`} onClick={() => setEnableNews(!enableNews)}></div>
                            <div className={`toggle-thumb ${enableNews ? 'on' : 'off'}`}></div>

                    </div>
                </div>
                    <div className="flex items-center mb-2">
                        <span className="text-white mr-2" style={{ width: '200px' }}>Enable Weather</span>
                        <div className="relative">
                            <input 
                            type="checkbox" 
                            checked={enableWeather} 
                            onChange={(e) => setEnableWeather(e.target.checked)} 
                            className="hidden"
                            />
                            <div className={`toggle-switch ${enableWeather ? 'on' : 'off'}`} onClick={() => setEnableWeather(!enableWeather)}></div>
                            <div className={`toggle-thumb ${enableWeather ? 'on' : 'off'}`}></div>
                        </div>
                    </div>
                    {enableWeather && (
                        <div className="flex items-center space-x-4">
                            <p className="text-white font-bold">Location</p>
                            <input
                            type="text"
                            className="bg-gray-700 text-white px-4 py-2 rounded w-full"
                            placeholder="City, Region, Country"
                            value={weatherLocation}
                            onChange={(e) => setWeatherLocation(e.target.value)}
                            />
                        </div>
                    )}
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                        onClick={handleSaveSetup}
                        >
                        Save Setup
                    </button>
                </div>
            </div>
        );
    };

    const handleCalculatorClose = () => {
        setShowCalculator(false);
    };

    const Calculator = ({ onClose }) => {
        const [input, setInput] = useState("");
        
        const handleClick = (value) => {
            console.log(input);
            if (input === "") {
                setInput(value);
            } else if (input === "Error") {
                setInput("");
                setInput(value);
            } else {
                setInput(input + value);
            }
        };
    
        const handleClear = () => {
            setInput("");
        };
    
        const handleEqual = () => {
            try {
                setInput(eval(input).toString());
            } catch {
                setInput("Error");
            }
        };
    
        return (
            <Draggable cancel={".interactable"}>
                <div className="max-w-xs bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-white text-lg font-bold mb-4">Calculator</h2>
                    <i 
                        className="interactable fas fa-times text-white absolute top-2 right-2 cursor-pointer" 
                        onClick={onClose}
                    ></i>
                    <div className="mb-4">
                        <input 
                            type="text" 
                            value={input} 
                            className="w-full p-2 text-right bg-gray-700 rounded text-xl" 
                            readOnly 
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={handleClear} className="interactable bg-red-500 p-2 rounded text-lg">C</button>
                        <button onClick={() => handleClick('/')} className="interactable bg-gray-600 p-2 rounded text-lg">/</button>
                        <button onClick={() => handleClick('*')} className="interactable bg-gray-600 p-2 rounded text-lg">*</button>
                        <button onClick={() => handleClick('-')} className="interactable bg-gray-600 p-2 rounded text-lg">-</button>
                        <button onClick={() => handleClick('7')} className="interactable bg-gray-700 p-2 rounded text-lg">7</button>
                        <button onClick={() => handleClick('8')} className="interactable bg-gray-700 p-2 rounded text-lg">8</button>
                        <button onClick={() => handleClick('9')} className="interactable bg-gray-700 p-2 rounded text-lg">9</button>
                        <button onClick={() => handleClick('+')} className="interactable bg-gray-600 p-2 rounded text-lg">+</button>
                        <button onClick={() => handleClick('4')} className="interactable bg-gray-700 p-2 rounded text-lg">4</button>
                        <button onClick={() => handleClick('5')} className="interactable bg-gray-700 p-2 rounded text-lg">5</button>
                        <button onClick={() => handleClick('6')} className="interactable bg-gray-700 p-2 rounded text-lg">6</button>
                        <button onClick={handleEqual} className="interactable row-span-2 bg-green-500 p-2 rounded text-lg">=</button>
                        <button onClick={() => handleClick('1')} className="interactable bg-gray-700 p-2 rounded text-lg">1</button>
                        <button onClick={() => handleClick('2')} className="interactable bg-gray-700 p-2 rounded text-lg">2</button>
                        <button onClick={() => handleClick('3')} className="interactable bg-gray-700 p-2 rounded text-lg">3</button>
                        <button onClick={() => handleClick('0')} className="interactable col-span-2 bg-gray-700 p-2 rounded text-lg">0</button>
                        <button onClick={() => handleClick('.')} className="interactable bg-gray-700 p-2 rounded text-lg">.</button>
                    </div>
                </div>
            </Draggable>
        );
    };

    const handleDeviceClose = () => {
        setShowDevice(false);
    };

    const Device = ({ onClose }) => {
        const [deviceInfo, setDeviceInfo] = useState({});
    
        useEffect(() => {
            const getDeviceInfo = async () => {
                const deviceInfo = {};
    
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                deviceInfo.ipAddress = ipData.ip;
    
                deviceInfo.browser = navigator.userAgent;
                deviceInfo.browserName = getBrowserName(navigator.userAgent);
                deviceInfo.browserVersion = getBrowserVersion(navigator.userAgent);
    
                deviceInfo.deviceType = getDeviceType(navigator.userAgent);
    
                deviceInfo.deviceOS = getDeviceOS(navigator.userAgent);
                deviceInfo.deviceOSVersion = getDeviceOSVersion(navigator.userAgent);
    
                deviceInfo.screenResolution = `${window.screen.width}x${window.screen.height}`;
        
                setDeviceInfo(deviceInfo);
            };
    
            getDeviceInfo();
        }, []);
    
        const getBrowserName = (userAgent) => {
            if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
            if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
            if (userAgent.indexOf('Safari') !== -1) return 'Safari';
            if (userAgent.indexOf('Edge') !== -1) return 'Edge';
            if (userAgent.indexOf('Opera') !== -1) return 'Opera';
            return 'Unknown';
        };
    
        const getBrowserVersion = (userAgent) => {
            const versionRegex = /Version\/(\d+\.\d+\.\d+)/;
            const match = userAgent.match(versionRegex);
            return match && match[1] ? match[1] : 'Unknown';
        };
    
        const getDeviceType = (userAgent) => {
            if (userAgent.indexOf('Mobile') !== -1) return 'Mobile';
            if (userAgent.indexOf('Tablet') !== -1) return 'Tablet';
            return 'Desktop';
        };
    
        const getDeviceOS = (userAgent) => {
            if (userAgent.indexOf('Windows') !== -1) return 'Windows';
            if (userAgent.indexOf('Mac OS X') !== -1) return 'macOS';
            if (userAgent.indexOf('Linux') !== -1) return 'Linux';
            if (userAgent.indexOf('Android') !== -1) return 'Android';
            if (userAgent.indexOf('iOS') !== -1) return 'iOS';
            return 'Unknown';
        };
    
        const getDeviceOSVersion = (userAgent) => {
            const versionRegex = /Android (\d+\.\d+)/;
            const match = userAgent.match(versionRegex);
            return match && match[1] ? match[1] : 'Unknown';
        };
    
        return (
        <Draggable cancel={".interactable"}>
            <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2>Device Information</h2>
                <i 
                        className="interactable fas fa-times text-white absolute top-2 right-2 cursor-pointer" 
                        onClick={handleDeviceClose}
                    ></i>
                <ul>
                    <li>IP Address: {deviceInfo.ipAddress}</li>
                    <li>Browser: {deviceInfo.browserName} {deviceInfo.browserVersion}</li>
                    <li>Device Type: {deviceInfo.deviceType}</li>
                    <li>Device OS: {deviceInfo.deviceOS} {deviceInfo.deviceOSVersion}</li>
                    <li>Screen Resolution: {deviceInfo.screenResolution}</li>
                </ul>
            </div>
        </Draggable>
        );
    };
    
    return (
        <div className="absolute w-full h-full bg-black">
            
            {!isSetup && <SetupPopup />}
            {showArticlePopup && <ArticlePopup />}
            {showAddNotePopup && (
                <AddNotePopup
                    onSave={handleSaveStickyNote}
                    onClose={() => setShowAddNotePopup(false)}
                />
            )}
            {activeStickyNote && (
                <div className="fixed top-4 right-4 z-50">
                    <StickyNote 
                        note={activeStickyNote} 
                        onClose={handleCloseStickyNote}
                        onEdit={handleEditStickyNote}
                    />
                </div>
            )}
            {showCalculator && 
                <div className="fixed top-4 right-4 z-50">
                    <Calculator 
                    onClose={handleCalculatorClose}/>
                </div>
            }
            {showDevice && <Device /> }
            {showStickyNotes && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white font-bold text-xl mb-4">Sticky Notes</h2>
                            <button
                                className="mr-2 mb-4 text-white hover:text-gray-400"
                                onClick={() => setShowStickyNotes(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        {stickyNotes.length > 0 ? (
                            stickyNotes.map((note, index) => {
                                const formattedNote = note.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        <br />
                                    </span>
                                ));

                                return (
                                    <div key={index} className="flex justify-between items-center mb-2 hover:bg-gray-700 p-2 rounded">
                                        <p 
                                            className="text-white cursor-pointer flex-grow"
                                            onClick={() => handleSetActiveStickyNote(note)}
                                        >
                                            {formattedNote}
                                        </p>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                                            onClick={() => handleDeleteStickyNote(index)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-white">No sticky notes found </p>
                        )}
                    </div>
                </div>
            )}
            <div className="relative font-bold select-none top-0 left-0 right-0 flex justify-between items-center p-4 bg-black">
                <div className="flex items-center">
                    <img src="assets/augur.png" alt="Augur" className="w-8 h-8"/>
                    <span className="text-white text-2xl">UGUR</span>
                </div>
                <Time />
            </div>
            
            <div className="absolute vertical-center horizontal-center left-0 right-0 flex flex-col items-center mt-4">
                <div className="mb-4">
                    <div className="flex select-none items-center">
                        <img src="assets/augur.png" alt="Augur" className="w-10 h-10" />
                        <span className="text-white text-4xl font-bold">UGUR</span>
                    </div>
                </div>
                <div className="flex select-none items-center bg-gray-800 text-white p-2 rounded">
                    <input 
                        type="text" 
                        placeholder={defaultEngine[2]} 
                        className="bg-gray-800 text-white px-2 py-1 outline-none" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button 
                        className="bg-gray-700 text-white px-4 py-2 rounded justify-right ml-2"
                        onClick={handleSearch}
                    >
                        Find
                    </button>
                </div>
                {suggestions.length > 0 && (
                    <div ref={dropdownRef} className="absolute z-10 bottom-11 left-0 right-0 flex justify-center">
                        <div className="absolute bg-gray-800 text-white p-2 rounded w-64">
                            <ul>
                                {suggestions.map((suggestion, index) => (
                                    <li 
                                        key={index}
                                        className="hover:bg-gray-700 p-1 cursor-pointer"
                                        onClick={() => setQuery(suggestion.phrase)}
                                    >
                                            {suggestion.phrase}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                <div className="flex right-0 justify-center mt-2">
                    <div className="flex space-x-4 items-center">
                    {["folder", "film", "share-alt", "code", "book", "cloud-download-alt"].map((icon, index) => (
                        <div key={index} className="relative">
                            <i 
                                className={`fas fa-${icon} hover:text-white text-blue-500 text-2xl cursor-pointer`} 
                                onClick={() => toggleDropdown(icon)}
                            ></i>
                            {dropdown === icon && (
                                <div ref={dropdownRef} className={`absolute w-32 top-8 overflow-x-hidden bg-gray-800 text-white p-2 rounded shadow-lg ${["folder", "film", "share-alt"].includes(icon) ? "left-0" : "right-0"}`}>               <ul>
                                        {customLinks[icon].map((link, i) => (
                                            <li key={i} className=" mb-1">
                                                <a href={link.url} target="_blank" className="hover:underline">{link.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            {(enableNews || enableWeather) ? (
                <>
                    <div className= "mt-40">
                        {enableNews && (
                            renderNews()
                        )}
                        {enableWeather && (
                            renderWeather()
                        )}
                    </div>
                </>
            ) : null}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-4 bg-black">
                <div className="flex items-center space-x-4">
                    <i 
                        className="fas fa-clipboard text-white text-2xl cursor-pointer" 
                        onClick={handleViewStickyNotes}
                    ></i>
                    <i 
                        className="fas fa-sticky-note text-white text-2xl cursor-pointer relative" 
                        onClick={handleAddStickyNote}
                    ></i>
                    <i 
                        className="fas fa-tools text-white text-2xl cursor-pointer" 
                        onClick={() => document.getElementById('tools').classList.toggle('hidden')}
                    ></i>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        className="text-white px-4 py-2 rounded"
                        onClick={() => document.getElementById('settings').classList.toggle('hidden')}
                    >
                        <i className="fas fa-cog text-white text-2xl "></i>
                    </button>
                </div>
            </div>
            <div id="tools"className="hidden absolute z-20 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center">
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="text-white text-2xl font-bold mb-4" onClick={() => document.getElementById('tools').classList.add('hidden')}>Tools</p>
                    <i className="fas fa-calculator text-white text-2xl cursor-pointer relative" onClick={() => {setShowCalculator(true); }}></i>
                    <i className="fas fa-laptop text-white text-2xl cursor-pointer relative" onClick={() => {setShowDevice(true); }}></i>
                </div>
            </div>
            <div id="settings" className="hidden absolute z-20 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center">
                <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-white font-bold text-xl mb-4">Settings <i className="fas fa-info-circle text-white" onClick={() => document.getElementById('about').classList.toggle('hidden')}></i></h1> 
                        <button
                            className="text-white mr-2 mb-4 hover:text-gray-400"
                            onClick={() => document.getElementById('settings').classList.add('hidden')}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <p className="text-white text-lg font-bold mb-2">Search Engine</p>
                    <select
                        className="bg-gray-700 text-center text-white px-4 py-2 rounded w-full"
                        value={defaultEngine[2]}
                        onChange={(e) => {
                            const selectedEngine = searchEngines.find(engine => engine[2] === e.target.value);
                            setDefaultEngine(selectedEngine);
                        }}
                    >
                        {searchEngines.map((engine, index) => (
                            <option key={index} value={engine[2]}>
                                {engine[2]}
                            </option>
                        ))}
                    </select>
                    <p className="text-white text-lg font-bold mt-4">Theme</p>
                    <select
                        className="bg-gray-700 text-center text-white px-4 py-2 rounded w-full"
                        value={currentTheme}
                        onChange={(e) => handleThemeChange(themes.find(theme => theme.className === e.target.value))}
                    >
                        {themes.map(theme => (
                            <option key={theme.name} value={theme.className}>{theme.name}</option>
                        ))}
                    </select>
                    <div className="flex items-center mb-2">
                        <span className="text-white mr-2" style={{ width: '200px' }}>Enable News</span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={enableNews} 
                                onChange={(e) => setEnableNews(e.target.checked)} 
                                className="hidden"
                            />
                            <div className={`toggle-switch ${enableNews ? 'on' : 'off'}`} onClick={() => setEnableNews(!enableNews)}>
                                <div className={`toggle-thumb ${enableNews ? 'on' : 'off'}`}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center mb-2">
                        <span className="text-white mr-2" style={{ width: '200px' }}>Enable Weather</span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={enableWeather} 
                                onChange={(e) => setEnableWeather(e.target.checked)} 
                                className="hidden"
                            />
                            <div className={`toggle-switch ${enableWeather ? 'on' : 'off'}`} onClick={() => setEnableWeather(!enableWeather)}>
                                <div className={`toggle-thumb ${enableWeather ? 'on' : 'off'}`}></div>
                            </div>
                        </div>
                    </div>
                    {enableWeather && (
                        <>
                            <h2 className="text-white text-lg font-bold mt-4">Weather Settings</h2>
                            <div className="flex items-center space-x-4">
                                <p className="text-white font-bold">Location</p>
                                <input
                                    type="text"
                                    className="bg-gray-700 text-white px-4 py-2 rounded w-full"
                                    placeholder="City, Region, Country"
                                    value={weatherLocation}
                                    onChange={handleLocationChange}
                                />
                            </div>
                        </>
                    )}
                    <div className="flex items-center space-x-4 mt-4">
                        <p className="text-white text-lg font-bold">Custom Links</p>
                        <button className="text-white rounded" onClick={() => document.getElementById('linkSettings').classList.toggle('hidden')}>
                            <i className="fas fa-chevron-down mr-8"></i>
                        </button>
                    </div>
                    <div id="linkSettings" className="hidden">
                        {Object.keys(customLinks).map((icon) => (
                            <div key={icon} className="mb-4">
                                <h2 className="text-white text-xl font-semibold"><i className={`fas fa-${icon} mr-2`}></i></h2>
                                {customLinks[icon].map((link, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={link.title}
                                            onChange={(e) => {
                                                const updatedLinks = { ...customLinks };
                                                updatedLinks[icon][index].title = e.target.value;
                                                setCustomLinks(updatedLinks);
                                            }}
                                            className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:py-2"
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => {
                                                const updatedLinks = { ...customLinks };
                                                updatedLinks[icon][index].url = e.target.value;
                                                setCustomLinks(updatedLinks);
                                            }}
                                            className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:py-2"
                                        />
                                        <button
                                            onClick={() => {
                                                const updatedLinks = { ...customLinks };
                                                updatedLinks[icon].splice(index, 1);
                                                setCustomLinks(updatedLinks);
                                            }}
                                            className="bg-red-500 text-white px-4 py-2 rounded sm:px-6 sm:py-3"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const updatedLinks = { ...customLinks };
                                        updatedLinks[icon].push({ title: "New Link", url: "https://example.com" });
                                        setCustomLinks(updatedLinks);
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded w-full sm:py-3"
                                >
                                    Add Link
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                localStorage.setItem('customLinks', JSON.stringify(customLinks));
                                alert('Custom links saved successfully!');
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:py-3 mt-4"
                        >
                            Save Custom Links
                        </button>
                    </div>
                    <button
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
                        onClick={() => document.getElementById('settings').classList.add('hidden')}
                    >
                        Close
                    </button>
                </div>
            </div>
            <div id="about" className="hidden absolute z-20 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center">
                <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">About</h1>
                        <button
                            className="mr-2 mb-4 text-white hover:text-gray-400" 
                            onClick={() => document.getElementById('about').classList.add('hidden')}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <p className="text-lg">Welcome to Augur.</p>
                    <p className="text-lg">Augur is a sweet and simple startpage with many features and customizations.</p>
                    <div className="flex flex-col space-y-2 mt-4">
                        <a href="https://ż.co/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><i className="fas fa-code mr-2"></i>ż.co</a>
                        <a href="https://github.com/9-5/Augur" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><i className="fab fa-github mr-2"></i> GitHub Repo</a>
                        <a href="https://johnle.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"><i className="fas fa-user mr-2"></i> Developer Site</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));