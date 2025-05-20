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
        { title: "Clock @ 0KB", url: "https://clock.0kb.org" },
        { title: "Clock @ Å¼", url: "https://clock.Å¼.co" }
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

const defaultRssFeeds = [ // Renamed from rssFeeds
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
    const themes = [{ name: 'Ocean', className: '' }, { name: 'Sky', className: 'sky' }, { name: 'Forest', className: 'forest' }, { name: 'Bamboo', className: 'bamboo' }, { name: 'Crimson', className: 'crimson' }, { name: 'Blush', className: 'blush' }, { name: 'Petal', className: 'petal' }, { name: 'Lotus', className: 'lotus' }, { name: 'Amethyst', className: 'amethyst' }, { name: 'RetroBoy', className: 'retroboy' }];
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
        // Ensure notes are objects with id, content, and optional position
        try {
            const parsedNotes = savedNotes ? JSON.parse(savedNotes) : [];
            return parsedNotes.map((n, index) => typeof n === 'string' ? {id: Date.now().toString() + index, content: n, position: {x: Math.random()*100, y: Math.random()*50}} : ({ ...n, id: n.id || Date.now().toString() + index }) );
        } catch (e) {
            return [];
        }
    });
    const [showStickyNotes, setShowStickyNotes] = useState(false);
    const [activeStickyNoteId, setActiveStickyNoteId] = useState(null); // Store ID of active note
    const [showAddNotePopup, setShowAddNotePopup] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLocation, setWeatherLocation] = useState(() => localStorage.getItem('weatherLocation') || 'Warsaw');
    const [news, setNews] = useState([]);
    const [articleUrl, setArticleUrl] = useState(null);
    const [showArticlePopup, setShowArticlePopup] = useState(false);
    const [articleContent, setArticleContent] = useState(null);
    const [articleTitle, setArticleTitle] = useState(null);
    const [enableNews, setEnableNews] = useState(() => JSON.parse(localStorage.getItem('enableNews') || 'false'));
    const [enableWeather, setEnableWeather] = useState(() => JSON.parse(localStorage.getItem('enableWeather') || 'false'));
    const [showCalculator, setShowCalculator] = useState(false);
    const [showDevice, setShowDevice] = useState(false);
    const [userRssFeeds, setUserRssFeeds] = useState(() => {
        const savedUserFeeds = localStorage.getItem('userRssFeeds');
        return savedUserFeeds ? JSON.parse(savedUserFeeds) : [];
    });
    const [newRssUrl, setNewRssUrl] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { index: number, note: object }
    const [showToolsDropdown, setShowToolsDropdown] = useState(false);
    const toolsDropdownRef = useRef(null);


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
            const response = await fetch(`https://cors.Å¼.co/api/2?url=${url}`);
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
            if (!xml || typeof xml !== 'string') {
                console.error("Invalid XML content received for parsing.");
                return [];
            }
            const parser = new RSSParser();
            const feed = await parser.parseString(xml);
            const articles = feed.items && Array.isArray(feed.items) ? feed.items.slice(0, 5) : [];
            return articles;
        } catch (error) {
            console.error("Error parsing RSS XML:", error, xml.substring(0,100));
            return [];
        }
    };
    
    const fetchNews = async (url) => {
        if (newsRef.current) {
            newsRef.current.postMessage({ mode: 'news', query: url });
            return new Promise(resolve => {
                const handleNewsMessage = (event) => {
                    if (event.data.mode === 'news' && (event.data.query === url || !event.data.query) ) { // Ensure message is for this URL or generic news
                        newsRef.current.removeEventListener('message', handleNewsMessage);
                        if (event.data.error) {
                            console.error(`Error fetching news for ${url}: ${event.data.error}`);
                            resolve(null); 
                        } else {
                            resolve(event.data.data);
                        }
                    }
                };
                newsRef.current.addEventListener('message', handleNewsMessage);
            });
        } else {
            console.error('News worker not initialized');
            return Promise.resolve(null);
        }
    };

    const allRssFeeds = () => {
        const combined = [...new Set([...defaultRssFeeds, ...userRssFeeds])];
        return combined;
    };

    const fetchAndProcessNews = async () => {
        const newsList = [];
        const feedsToFetch = allRssFeeds();
        for (const url of feedsToFetch) {
            const xml = await fetchNews(url);
            if (xml) {
                const articles = await processXML(xml);
                newsList.push(...articles);
            } else {
                console.warn(`Could not fetch or process news from ${url}`);
            }
        }
        setNews(newsList.sort((a, b) => new Date(b.isoDate || b.pubDate || 0) - new Date(a.isoDate || a.pubDate || 0)).slice(0, 20)); // Show more, sorted
    };

    const renderNews = () => {
        if (news.length === 0 && enableNews) {
            fetchAndProcessNews();
        }
        
        return (
            <div className="flex flex-col  overflow-x-hidden mt-2">
                <h2 className="align-left text-white text-2xl font-bold ml-4">News</h2>
                <div className="overflow-x-auto pb-4">
                    <div className="flex flex-nowrap space-x-4 pl-4 pr-4">
                    {news.map((article, index) => (
                        <div key={index} className="news-item bg-gray-800 p-4 rounded shadow-lg flex-shrink-0 w-72 md:w-80">
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
                            <p className="text-xs text-gray-400 mt-2">
                                {article.isoDate ? new Date(article.isoDate).toLocaleDateString() : (article.pubDate ? new Date(article.pubDate).toLocaleDateString() : '')}
                                {article.creator ? ` - ${article.creator}` : ''}
                            </p>
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
        
        // For news worker, it needs to return the query in message to distinguish
        newsRef.current.onmessage = (event) => {
            if (event.data.error) {
                console.error(`News worker error: ${event.data.error}`);
            } else {
                // This generic onmessage for newsRef is problematic if multiple requests are out.
                // The promise-based fetchNews handles its own messages.
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
        const handleClickOutsideTools = (event) => {
            if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) setShowToolsDropdown(false);
        };
        if (showToolsDropdown) document.addEventListener("mousedown", handleClickOutsideTools);
        return () => document.removeEventListener("mousedown", handleClickOutsideTools);
    }, [showToolsDropdown]);
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
        // localStorage.setItem('weatherLocation', location); // useEffect for weatherLocation handles this
        fetchWeatherData(location);
    };

    const toggleDropdown = (icon) => {
        setDropdown(dropdown === icon ? null : icon);
    };
    
    useEffect(() => {
        localStorage.setItem('weatherLocation', weatherLocation);
    }, [weatherLocation]);

    useEffect(() => {
        localStorage.setItem('userRssFeeds', JSON.stringify(userRssFeeds));
        if(enableNews) {
            fetchAndProcessNews();
        }
    }, [userRssFeeds, enableNews]);

    const StickyNote = ({ noteId, initialContent, onClose, onSave, initialPosition }) => {
        const [content, setContent] = useState(initialContent);
        const [isEdited, setIsEdited] = useState(false);
        const noteRef = useRef(null);
        const contentEditableRef = useRef(null);
    
        const handleInput = (e) => {
            const newText = e.target.innerText;
            setContent(newText);
            setIsEdited(newText !== initialContent);
        };
    
        const handleSave = () => {
            onSave(noteId, content);
            setIsEdited(false); 
        };

        useEffect(() => {
            setContent(initialContent);
            if (contentEditableRef.current) {
                contentEditableRef.current.innerText = initialContent;
            }
            setIsEdited(false);
        }, [initialContent, noteId]);

        const handleNoteStop = (e, data) => {
            const updatedNotes = stickyNotes.map(n => 
                n.id === noteId ? { ...n, position: { x: data.x, y: data.y } } : n
            );
            setStickyNotes(updatedNotes); // This will trigger localStorage update via useEffect for stickyNotes
        };
    
        return (
            <Draggable nodeRef={noteRef} cancel={".interactable"} defaultPosition={initialPosition} onStop={handleNoteStop}>
                <div ref={noteRef} className="sticky-note bg-gray-800 p-4 rounded shadow-lg relative w-64 cursor-move">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-white font-bold">Note</p>
                        <button className="interactable text-white hover:text-gray-400" onClick={() => onClose(noteId)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div
                        ref={contentEditableRef}
                        contentEditable={true}
                        onInput={handleInput}
                        className="outline-none interactable text-white bg-gray-700 p-2 rounded min-h-[100px] whitespace-pre-wrap"
                        suppressContentEditableWarning={true}
                    />
                    {isEdited && (
                        <button
                            className="interactable bg-green-500 text-white px-4 py-2 rounded mt-2 w-full"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    )}
                </div>
            </Draggable>
        );
    };

    const handleUpdateStickyNote = (noteId, newContent) => {
        const updatedNotes = stickyNotes.map(note =>
            note.id === noteId ? { ...note, content: newContent } : note
        );
        setStickyNotes(updatedNotes);
        // localStorage update is handled by useEffect on stickyNotes
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
    
    const handleSaveStickyNote = (newNoteText) => {
        if (newNoteText) {
            const newNote = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
                content: newNoteText.trim(),
                position: { x: Math.random() * 150 + 50, y: Math.random() * 100 + 50 }
            };
            const updatedNotes = [...stickyNotes, newNote];
            setStickyNotes(updatedNotes);
            setActiveStickyNoteId(newNote.id);
            // localStorage update is handled by useEffect on stickyNotes
        }
    };

    useEffect(() => {
        localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
    }, [stickyNotes]);

    const handleCloseStickyNote = (noteId) => {
        if (activeStickyNoteId === noteId || !noteId) {
            setActiveStickyNoteId(null);
        }
    };

    const handleSetActiveStickyNote = (noteObjOrId) => {
        const noteIdToActivate = typeof noteObjOrId === 'string' ? noteObjOrId : noteObjOrId.id;
        setActiveStickyNoteId(noteIdToActivate);
        setShowStickyNotes(false);
    };

    const handleViewStickyNotes = () => {
        setShowStickyNotes(!showStickyNotes);
    };
    const handleDeleteStickyNote = (noteId) => {
        if (activeStickyNoteId === noteId) setActiveStickyNoteId(null);
        const updatedNotes = stickyNotes.filter(note => note.id !== noteId);
        setStickyNotes(updatedNotes);
    };

    const renderWeather = () => {
        if (!weatherData) {
            fetchWeatherData(weatherLocation);
            return <p>Loading weather data...</p>;
        }

        const renderWeatherWidget = () => {
            if (!weatherData || !weatherData.hourly || !weatherData.hourly.data || weatherData.hourly.data.length === 0) {
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
                                                <p className="text-white text-sm ml-1">🌬️</p>
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
        const location = weatherData && weatherData.merry && weatherData.merry.location ? weatherData.merry.location.name : 'Loading...';

        return (
            renderWeatherWidget()
        );
    };

    const SetupPopup = () => {
        const [localDefaultEngine, setLocalDefaultEngine] = useState(searchEngines[0]);
        const [localCurrentThemeObj, setLocalCurrentThemeObj] = useState(themes[0]);
        const [localEnableNews, setLocalEnableNews] = useState(false);
        const [localEnableWeather, setLocalEnableWeather] = useState(false);
        const [localWeatherLocation, setLocalWeatherLocation] = useState('');
        
        const handleSaveSetup = () => {
            setDefaultEngine(localDefaultEngine);
            setCurrentTheme(localCurrentThemeObj.className);
            setEnableNews(localEnableNews);
            setEnableWeather(localEnableWeather);
            if (localEnableWeather && localWeatherLocation) {
                setWeatherLocation(localWeatherLocation);
            }
            // localStorage persistence is handled by useEffect hooks in App for these states
            localStorage.setItem('isSetup', 'true');
            setIsSetup(true);
        };
        
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                    <style>{`
                        .toggle-switch { width: 37.5px; height: 18px; background-color: #ccc; border-radius: 50px; position: relative; cursor: pointer; transition: background-color 0.2s; }
                        .toggle-thumb { width: 16px; height: 16px; background-color: white; border-radius: 50%; position: absolute; top: 1px; left: -1px; transition: transform 0.2s; }
                        .toggle-thumb.on { transform: translateX(26px); }
                        .toggle-switch.on { background-color: #4caf50; }
                    `}</style>
                    {/* Styles are duplicated here as they are in global styles.css. Better to ensure global styles apply or pass class names. */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-white font-bold text-xl mb-4">Setup</h1>
                    </div>
                    <p className="text-white text-lg font-bold mb-2">Default Search Engine</p>
                    <select
                        className="bg-gray-700 text-center text-white px-4 py-2 rounded w-full"
                        value={localDefaultEngine[2]}
                        onChange={(e) => {
                            const selectedEngine = searchEngines.find(engine => engine[2] === e.target.value);
                            setLocalDefaultEngine(selectedEngine);
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
                        value={localCurrentThemeObj.className}
                        onChange={(e) => setLocalCurrentThemeObj(themes.find(theme => theme.className === e.target.value))}
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
                            checked={localEnableNews} 
                            onChange={(e) => setLocalEnableNews(e.target.checked)} 
                            className="hidden"
                            />
                            <div className={`toggle-switch ${localEnableNews ? 'on' : 'off'}`} onClick={() => setLocalEnableNews(!localEnableNews)}></div>
                            <div className={`toggle-thumb ${localEnableNews ? 'on' : 'off'}`}></div>

                    </div>
                </div>
                    <div className="flex items-center mb-2">
                        <span className="text-white mr-2" style={{ width: '200px' }}>Enable Weather</span>
                        <div className="relative">
                            <input 
                            type="checkbox" 
                            checked={localEnableWeather} 
                            onChange={(e) => setLocalEnableWeather(e.target.checked)} 
                            className="hidden"
                            />
                            <div className={`toggle-switch ${localEnableWeather ? 'on' : 'off'}`} onClick={() => setLocalEnableWeather(!localEnableWeather)}></div>
                            <div className={`toggle-thumb ${localEnableWeather ? 'on' : 'off'}`}></div>
                        </div>
                    </div>
                    {localEnableWeather && (
                        <div className="flex items-center space-x-4">
                            <p className="text-white font-bold">Location</p>
                            <input
                            type="text"
                            className="bg-gray-700 text-white px-4 py-2 rounded w-full"
                            placeholder="City, Region, Country"
                            value={localWeatherLocation}
                            onChange={(e) => setLocalWeatherLocation(e.target.value)}
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
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json');
                    if (ipResponse.ok) {
                        const ipData = await ipResponse.json();
                        deviceInfo.ipAddress = ipData.ip;
                    } else {
                        deviceInfo.ipAddress = "Could not fetch IP";
                    }
                } catch (e) {
                    deviceInfo.ipAddress = "Error fetching IP";
                }
    
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
    
        // Helper functions need to be robust
        const getBrowserName = (userAgent) => {
            if (!userAgent) return 'Unknown';
            if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
            if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
            // Safari might also contain "Chrome" in userAgent on iOS. Order matters.
            // More robust detection might be needed for accuracy.
            if (userAgent.indexOf('Edg') !== -1) return 'Edge'; // Modern Edge
            if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) return 'IE';
            if (userAgent.indexOf('Safari') !== -1) return 'Safari';
            if (userAgent.indexOf('Edge') !== -1) return 'Edge';
            if (userAgent.indexOf('Opera') !== -1) return 'Opera';
            return 'Unknown';
        };
    
        const getBrowserVersion = (userAgent) => {
            if (!userAgent) return 'Unknown';
            let match = userAgent.match(/(Chrome|Firefox|Safari|Edg|Opera|MSIE|Trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(match[1])) { // IE 11
                let rv = userAgent.match(/\brv[ :]+(\d+)/g) || [];
                return (rv[1] || '').split(')')[0];
            }
            if (match[1] === 'Chrome') {
                let temp = userAgent.match(/\b(OPR|Edg)\/(\d+)/);
                if (temp != null) return temp.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg', 'Edge');
            }
            match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
            let tem = userAgent.match(/version\/(\d+)/i);
            if (tem != null) match.splice(1, 1, tem[1]);
            return match.join(' ');
        };
    
        const getDeviceType = (userAgent) => {
            if (!userAgent) return 'Desktop';
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) return 'Tablet';
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) return 'Mobile';
            return 'Desktop';
        };
    
        const getDeviceOS = (userAgent) => {
            if (!userAgent) return 'Unknown';
            if (/windows phone/i.test(userAgent)) return "Windows Phone";
            if (/windows nt/i.test(userAgent)) return "Windows";
            if (/android/i.test(userAgent)) return "Android";
            if (/linux/i.test(userAgent)) return "Linux"; // Check before Android for Linux desktop
            if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
            if (/macintosh|mac os x/i.test(userAgent)) return "macOS";
            return 'Unknown';
        };
    
        const getDeviceOSVersion = (userAgent) => { // This is very basic
            if (!userAgent) return 'Unknown';
            const versionRegex = /(?:Windows NT |Android |CPU OS |Mac OS X |Linux )([^);]+)/;
            const match = userAgent.match(versionRegex);
            return match && match[1] ? match[1] : 'Unknown';
        };
    
        return (
        <Draggable cancel={".interactable"}>
            <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-white text-lg font-bold mb-2">Device Information</h2>
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

    const handleExportSettings = () => {
        const settingsToExport = {
            version: 1.1, // Updated version
            searchEngine: JSON.parse(localStorage.getItem('searchEngine') || JSON.stringify(searchEngines[0])),
            theme: localStorage.getItem('theme') || 'Ocean',
            enableNews: JSON.parse(localStorage.getItem('enableNews') || 'false'),
            enableWeather: JSON.parse(localStorage.getItem('enableWeather') || 'false'),
            weatherLocation: localStorage.getItem('weatherLocation') || 'Warsaw',
            customLinks: JSON.parse(localStorage.getItem('customLinks') || JSON.stringify(iconLinks)),
            stickyNotes: JSON.parse(localStorage.getItem('stickyNotes') || '[]'),
            userRssFeeds: JSON.parse(localStorage.getItem('userRssFeeds') || '[]'),
        };
        const jsonString = JSON.stringify(settingsToExport, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `augur_settings_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportSettings = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported && (imported.version === 1 || imported.version === 1.1)) {
                        if(imported.searchEngine) setDefaultEngine(imported.searchEngine);
                        if(imported.theme) setCurrentTheme(imported.theme);
                        if(typeof imported.enableNews === 'boolean') setEnableNews(imported.enableNews);
                        if(typeof imported.enableWeather === 'boolean') setEnableWeather(imported.enableWeather);
                        if(imported.weatherLocation) setWeatherLocation(imported.weatherLocation);
                        if(imported.customLinks) setCustomLinks(imported.customLinks);
                        if(imported.stickyNotes) setStickyNotes(imported.stickyNotes.map((n,idx) => typeof n === 'string' ? {id: Date.now().toString()+idx, content: n} : ({...n, id: n.id || Date.now().toString()+idx})));
                        if(imported.userRssFeeds) setUserRssFeeds(imported.userRssFeeds);
                        alert("Settings imported successfully! Some changes may require a page refresh.");
                    } else { alert("Invalid or incompatible settings file."); }
                } catch (error) { alert("Error importing settings: " + error.message); }
                event.target.value = null; // Reset file input
            };
            reader.readAsText(file);
        }
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
            {activeStickyNoteId && (() => {
                const currentActiveNote = stickyNotes.find(n => n.id === activeStickyNoteId);
                if (!currentActiveNote) return null;
                return (
                // Position will be handled by Draggable's defaultPosition or saved position
                // <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                    <StickyNote 
                        key={currentActiveNote.id}
                        noteId={currentActiveNote.id}
                        initialContent={currentActiveNote.content}
                        initialPosition={currentActiveNote.position}
                        onClose={handleCloseStickyNote}
                        onSave={handleUpdateStickyNote} />
                // </div>
                );
            })()}
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
                            stickyNotes.map((note) => {
                                return (
                                    <div key={note.id} className="flex justify-between items-center mb-2 hover:bg-gray-700 p-2 rounded">
                                        <p 
                                            className="text-white cursor-pointer flex-grow mr-2"
                                        >
                                            {note.content.length > 50 ? note.content.substring(0, 50) + "..." : 
                                                note.content.split('\n').map((line, i) => (<span key={i}>{line}<br /></span>))
                                            }
                                        </p>
                                        <div className="flex space-x-2">
                                            <button
                                                title="Edit Note"
                                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                                onClick={() => handleSetActiveStickyNote(note.id)} >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                title="Delete Note"
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                                onClick={() => setShowDeleteConfirm({ id: note.id, content: note.content })} >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-white">No sticky notes found </p>
                        )}
                    </div>
                </div>
            )}
            {showDeleteConfirm && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-6 rounded shadow-lg w-[90vw] max-w-[400px]">
                        <h2 className="text-white text-xl mb-4">Confirm Deletion</h2>
                        <p className="text-white mb-4">Are you sure you want to delete this note?</p>
                        <p className="text-gray-400 bg-gray-700 p-2 rounded mb-4 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {showDeleteConfirm.content}
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                                onClick={() => setShowDeleteConfirm(null)} >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                    handleDeleteStickyNote(showDeleteConfirm.id);
                                    setShowDeleteConfirm(null);
                                }} >
                                Delete
                            </button>
                        </div>
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
                        title="View All Notes"
                    ></i>
                    <i 
                        className="fas fa-sticky-note text-white text-2xl cursor-pointer relative" 
                        onClick={handleAddStickyNote}
                        title="Add New Note"
                    ></i>
                    <div className="relative" ref={toolsDropdownRef}>
                        <i 
                            className="fas fa-tools text-white text-2xl cursor-pointer" 
                            onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                            title="Tools"
                        ></i>
                        {showToolsDropdown && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 p-3 rounded shadow-lg w-48 z-30"> {/* Increased width */}
                                <ul className="space-y-2">
                                    <li>
                                        <button 
                                            className="w-full text-left text-white hover:bg-gray-600 p-2 rounded flex items-center"
                                            onClick={() => { setShowCalculator(true); setShowToolsDropdown(false); }}
                                        >
                                            <i className="fas fa-calculator mr-2 w-5 text-center"></i> Calculator
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            className="w-full text-left text-white hover:bg-gray-600 p-2 rounded flex items-center"
                                            onClick={() => { setShowDevice(true); setShowToolsDropdown(false); }}
                                        >
                                            <i className="fas fa-laptop mr-2 w-5 text-center"></i> Device Info
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        className="text-white px-4 py-2 rounded"
                        onClick={() => document.getElementById('settings').classList.toggle('hidden')}
                        title="Settings"
                    >
                        <i className="fas fa-cog text-white text-2xl "></i>
                    </button>
                </div>
            </div>
            <div id="settings" className="hidden absolute z-20 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center">
                <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-white font-bold text-xl mb-4">Settings <i className="fas fa-info-circle text-white cursor-pointer" title="About Augur" onClick={() => document.getElementById('about').classList.toggle('hidden')}></i></h1> 
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
                    <h2 className="text-white text-lg font-bold mt-4">RSS Feeds</h2>
                    <div id="rssFeedSettings">
                        {userRssFeeds.map((feedUrl, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={feedUrl}
                                    readOnly
                                    className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:py-2"
                                />
                                <button
                                    onClick={() => {
                                        const updatedFeeds = userRssFeeds.filter((_, i) => i !== index);
                                        setUserRssFeeds(updatedFeeds);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded sm:px-6 sm:py-3" >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <div className="flex items-center space-x-2 mb-2">
                            <input
                                type="url"
                                placeholder="Add new RSS feed URL"
                                value={newRssUrl}
                                onChange={(e) => setNewRssUrl(e.target.value)}
                                className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:py-2"
                            />
                            <button
                                onClick={() => {
                                    if (newRssUrl.trim() && !userRssFeeds.includes(newRssUrl.trim())) {
                                        try { new URL(newRssUrl.trim()); setUserRssFeeds([...userRssFeeds, newRssUrl.trim()]); setNewRssUrl(""); }
                                        catch (e) { alert("Invalid URL format for RSS feed."); }
                                    } else if (userRssFeeds.includes(newRssUrl.trim())) { alert("This RSS feed is already in your list.");}
                                }}
                                className="bg-green-500 text-white px-4 py-2 rounded sm:py-3" >
                                Add Feed
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Default feeds ({defaultRssFeeds.length}) will always be included. Add your custom feeds here.</p>
                    </div>
                    <h2 className="text-white text-lg font-bold mt-4">Data Management</h2>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-2">
                        <button onClick={handleExportSettings} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Export Settings</button>
                        <label className="bg-green-500 text-white px-4 py-2 rounded w-full text-center cursor-pointer">Import Settings<input type="file" accept=".json" className="hidden" onChange={handleImportSettings}/></label>
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