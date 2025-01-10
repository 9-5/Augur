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
    "https://www.theguardian.com/world/rss",
    "https://www.washingtonpost.com/rss.xml"
    ];

function App() {
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
    const [systemInfo, setSystemInfo] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const spiderRef = useRef(null);
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
    const [weatherLocation, setWeatherLocation] = useState('New York, NY');
    const [weatherDataFetched, setWeatherDataFetched] = useState(false);
    const [news, setNews] = useState([]);

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
        spiderRef.current.postMessage({ mode: 'news', query: url });
        return new Promise(resolve => {
            const handleNewsMessage = (event) => {
                if (event.data.mode === 'news') {
                    spiderRef.current.removeEventListener('message', handleNewsMessage);
                    resolve(event.data.data);
                }
            };
            spiderRef.current.addEventListener('message', handleNewsMessage);
        });
    };
    
    const renderNews = () => {
        useEffect(() => {
            const fetchAndProcessNews = async () => {
                const newsList = [];
                for (const url of rssFeeds) {
                    const xml = await fetchNews(url);
                    const articles = await processXML(xml);
                    newsList.push(...articles);
                }
                setNews(newsList);
            };
            fetchAndProcessNews();
        }, []);
    
        return (
            <div className="bg-gray-800 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-white text-xl mb-4">News</h1>
                    <button
                        className="text-white mr-2 mb-4 hover:text-gray-400"
                        onClick={() => document.getElementById('news').classList.add('hidden')}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <ul>
                        {news.map((article, index) => (
                            <li key={index} className="mb-2">
                                <a href={article.link} target="_blank" className="hover:underline">
                                    [{article?.link.split('www.')[1]?.split('/')[0] || 'Unknown Publisher'}]- {article.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    useEffect(() => {
        spiderRef.current = new Worker('assets/js/workers/spider.js');
        spiderRef.current.onmessage = (event) => {
            if (event.data.error) {
                console.error(`Worker error: ${event.data.error}`);
            } else {
                if (event.data.mode === 'search') {
                    setSuggestions(event.data.data);
                } else if (event.data.mode === 'weather') {
                    setWeatherData(event.data.data);
                } else if (event.data.mode === 'news') {
                    processXML(event.data.data)
                  }
                }
              };
            }, []);

    const fetchWeatherData = (location) => {
        spiderRef.current.postMessage({ mode: 'weather', query: location });
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
            spiderRef.current.postMessage({ mode: 'search', query });
        } else {
            setSuggestions([]);
        }
    }, [query]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        buildSystemInfo();
    }, []);

    useEffect(() => {
        localStorage.setItem('searchEngine', JSON.stringify(defaultEngine));
    }, [defaultEngine]);

    useEffect(() => {
        document.body.className = currentTheme === 'Ocean' ? '' : currentTheme.toLowerCase();
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);


    const buildSystemInfo = () => {
        const pixelRatio = window.devicePixelRatio;
        const realWidth = Math.round(window.screen.width * pixelRatio);
        const realHeight = Math.round(window.screen.height * pixelRatio);

        const userAgent = navigator.userAgent;
        let os = "Unknown OS";
        if (userAgent.indexOf("Win") !== -1) os = "Windows";
        if (userAgent.indexOf("Mac") !== -1) os = "macOS";
        if (userAgent.indexOf("Linux") !== -1) os = "Linux";
        if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1 || userAgent.indexOf("iPod") !== -1) os = "iOS";
        if (userAgent.indexOf("Android") !== -1) os = "Android";

        let browser = "Unknown Browser";
        if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) browser = "Chrome";
        if (userAgent.indexOf("Firefox") !== -1) browser = "Firefox";
        if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) browser = "Safari";
        if (userAgent.indexOf("Edg") !== -1) browser = "Edge";
        if (userAgent.indexOf("OPR") !== -1) browser = "Opera";

        const browserVersion = userAgent.match(/(Chrome|Firefox|Safari|Edg|OPR)\/(\d+)/);
        const version = browserVersion ? browserVersion[2] : "Unknown";

        let binfo = `${os}<br>${browser} ${version}<br>${realWidth} x ${realHeight}`;
        let threadnum = window.navigator.hardwareConcurrency;
        let logical = `${threadnum} Threads`;
        setSystemInfo(`${binfo}<br>${logical}`);
    };

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const StickyNote = ({ note, onClose, onSave }) => {
        const [editedNote, setEditedNote] = useState(note);
        const [isEdited, setIsEdited] = useState(false);
    
        const handleInput = (e) => {
            console.log('Editing on..')
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
            <Draggable>
                <div className="sticky-note bg-gray-800 p-4 rounded shadow-lg relative w-64 cursor-move">
                    <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-400"
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <p
                        contentEditable={true}
                        onInput={handleInput}
                        className="outline-none"
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
                            className="bg-green-500 text-white px-4 py-2 rounded mt-2 w-full"
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
        
        useEffect(() => {
            if (!weatherDataFetched) {
              const storedLocation = localStorage.getItem('weatherLocation');
              if (storedLocation) {
                fetchWeatherData(storedLocation);
                setWeatherDataFetched(true);
              }
            }
        }, []);

        const renderHourlyTemperatureTable = () => {
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
                <div className="overflow-x-auto overflow-y-auto h-full w-full sm:h-64 sm:w-full md:h-full md:w-full">
                    <table className="min-w-full rounded bg-gray-800 text-white border border-gray-700 sm:text-sm md:text-md">
                        <thead className="sticky top-0 bg-gray-800">
                            <tr>
                                <th className="font-bold text-center text-white px-4 py-2 border border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">Date and Time</th>
                                <th className="font-bold text-center text-white px-4 py-2 border border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">Temperature (°C/°F)</th>
                                <th className="font-bold text-center text-white px-4 py-2 border border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">Precipitation Type</th>
                                <th className="font-bold text-center text-white px-4 py-2 border border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">Precipitation Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weatherData.hourly.data.slice(start).map((hour, index) => {
                                const date = new Date(hour.time * 1000);
                                const dateString = date.toLocaleDateString([], { weekday: 'short', year: '2-digit', month: '2-digit', day: '2-digit' });
                                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const dateTimeString = `${dateString} ${timeString}`;
                                
                                const temperatureCelsius = hour.temperature;
                                const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
                                
                                const precipTyope = hour.precipType || 'N/A';
                                const precipAcc = hour.precipAccumulation || 0;

                                return (
                                    <tr key={index} className="hover:bg-gray-700">
                                        <td className="px-4 py-2 border text-white text-center border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">{dateTimeString}</td>
                                        <td className="px-4 py-2 border text-white text-center border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">{temperatureCelsius}°C / {temperatureFahrenheit.toFixed(2)}°F</td>
                                        <td className="px-4 py-2 border text-white text-center border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">{precipTyope}</td>
                                        <td className="px-4 py-2 border text-white text-center border-gray-700 sm:px-2 sm:py-1 md:px-4 md:py-2">{precipAcc}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        };

        const location = weatherData ? weatherData.merry.location.name : 'Loading...';
        
        return (
            <div className="bg-gray-600 p-4 rounded w-[90vw] h-[80vh] max-w-[600px] overflow-y-auto">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Weather</h1>
                    <button
                        className="text-white mr-2 mb-2 hover:text-gray-400"
                        onClick={() => document.getElementById('weather').classList.add('hidden')}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                {weatherData ? (
                    <div>
                        <p className="text-lg font-bold mb-2">{location}</p>
                        {renderHourlyTemperatureTable()}
                    </div>
                 ) : (
                    <p>Loading weather data...</p>
                )}
            </div>
        );
    };

    return (
        <div className="absolute w-full h-full bg-black">
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
            <div className="relative select-none top-0 left-0 right-0 flex justify-between items-center p-4 bg-black">
                <div className="flex items-center">
                    <i 
                        className="fas fa-bars text-white text-2xl mr-4 cursor-pointer" 
                        onClick={toggleSidebar}
                    ></i>
                    <img src="assets/augur.png" alt="Augur" className="w-8 h-8"/>
                    <span className="text-white text-2xl">UGUR</span>
                </div>
                {/*<div className="justify-right items-center text-right text-white" dangerouslySetInnerHTML={{ __html: dateTime + "<br>" + systemInfo }}></div>*/}

            </div>
            {isSidebarOpen && (
                <div ref={sidebarRef} className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg z-50">
                    <div className="p-4">
                        <div className="flex items-center mb-4">
                            <img src="assets/augur.png" alt="Augur" className="w-8 h-8" />
                            <span className="text-white text-2xl">UGUR</span>       
                        </div>
                        <ul>
                            <li className="py-2 hover:underline hover:cursor-pointer" onClick={() => document.getElementById('news').classList.toggle('hidden')}><i className="fas fa-newspaper mr-2"></i>News</li>
                            <li className="py-2 hover:underline hover:cursor-pointer"><i className="fas fa-calculator mr-3"></i>Calculator</li>
                            <li className="py-2 hover:underline hover:cursor-pointer" onClick={() => document.getElementById('weather').classList.toggle('hidden')}><i className="fas fa-cloud-sun-rain mr-2"></i>Weather</li>
                        </ul>
                        <button onClick={toggleSidebar} className="mt-4 bg-red-500 text-white p-2 rounded">Close</button>
                    </div>
                </div>
            )}
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
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-4 bg-black">
                <div className="flex items-center space-x-4">
                    <i 
                        className="fas fa-clipboard text-white text-2xl cursor-pointer" 
                        onClick={handleViewStickyNotes}
                    ></i>
                    <i 
                        className="fas fa-plus-circle text-white text-2xl cursor-pointer" 
                        onClick={handleAddStickyNote}
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
            <div id="news" className="hidden absolute z-20 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center">
                {renderNews()}
            </div>
            <div id="weather" className="hidden absolute z-20 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center">
                {renderWeather()}
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
                    <h2 className="text-white text-lg font-bold mt-4">Weather Settings</h2>
                    <div className="flex items-center space-x-4 mt-4">
                        <p className="text-white font-bold">Location</p>
                        <input
                            type="text"
                            className="bg-gray-700 text-white px-4 py-2 rounded w-full"
                            placeholder="City, Region, Country"
                            value={weatherLocation}
                            onChange={handleLocationChange}
                        />
                    </div>

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