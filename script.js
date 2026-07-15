/**
 * ==========================================================================
 * ADVANCED WEATHER APP SCRIPT
 * Concepts Used: Async/Await, Fetch API, Geolocation, Destructuring, 
 * LocalStorage, Error Handling, Event Delegation
 * ==========================================================================
 */
// API ("") me hai 
const API_CONFIG = {
    KEY: "508c298ef569301b70f02c6ccfa1cb03", // <-- Yahan apni free OpenWeatherMap API Key paste karein
    BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    DEFAULT_CITY: 'Delhi'
};


const DOM = {
    input: document.getElementById('city-input'),
    button: document.getElementById('search-btn'),
    cityName: document.getElementById('city-name'),
    temp: document.getElementById('temperature'),
    desc: document.getElementById('description'),
    humidity: document.getElementById('humidity-val'),
    wind: document.getElementById('wind-val'),
    visibility: document.getElementById('visibility-val'),
    pressure: document.getElementById('pressure-val'),
    card: document.querySelector('.weather-card')
};


/** 
 * Weather Data Fetch karne ka main function (Async/Await)
 * @param {string} query - City name ya Lat/Lon parameters
 */
async function fetchWeatherData(queryParam) {
    showLoadingState();
    
    try {
        const url = `${API_CONFIG.BASE_URL}?${queryParam}&appid=${API_CONFIG.KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found! 😢' : 'Server error! ⚙️');
        }
        
        const data = await response.json();
        updateUI(data);
        
        // Advanced: Last searched city ko save karna
        localStorage.setItem('lastCity', data.name);
        
    } catch (error) {
        handleError(error.message);
    }
}

/**
 * UI ko Dynamic Data se Update karne wala function (Destructuring & Advanced JS)
 * @param {Object} data - API Response JSON
 */
function updateUI(data) {
  
    const { 
        name, 
        main: { temp, humidity, pressure }, 
        wind: { speed }, 
        visibility, 
        weather: [{ description }] 
    } = data;

    // Reset layout animations/errors
    DOM.card.style.animation = 'none';
    
    // Updating Main Info
    DOM.cityName.textContent = name;
    DOM.temp.innerHTML = `${Math.round(temp)}<sup>°C</sup>`;
    DOM.desc.textContent = description;

    // Updating Details Grid
    DOM.humidity.textContent = `${humidity}%`;
    DOM.wind.textContent = `${(speed * 3.6).toFixed(1)} km/h`; // Converting m/s to km/h
    DOM.visibility.textContent = `${(visibility / 1000).toFixed(1)} km`; // Converting meters to km
    DOM.pressure.textContent = `${pressure} hPa`;
}

// ==========================================================================
// HELPER & INTERACTION FUNCTIONS
// ==========================================================================

// Loading state dikhane ke liye
function showLoadingState() {
    DOM.cityName.textContent = "Loading...";
    DOM.temp.innerHTML = `--<sup>°C</sup>`;
    DOM.desc.textContent = "Fetching latest updates...";
}

// Error popups handles karne ke liye smooth transitional style trigger
function handleError(message) {
    DOM.cityName.textContent = "Error";
    DOM.temp.innerHTML = `⚠️`;
    DOM.desc.textContent = message;
    
    // Grid values clear karna
    DOM.humidity.textContent = "--";
    DOM.wind.textContent = "--";
    DOM.visibility.textContent = "--";
    DOM.pressure.textContent = "--";

    // Card me error shake animation add karna CSS trigger karke
    DOM.card.style.transform = "scale(0.98)";
    setTimeout(() => DOM.card.style.transform = "none", 300);
}

// Input se city search trigger karna
function handleSearch() {
    const city = DOM.input.value.trim();
    if (city) {
        fetchWeatherData(`q=${encodeURIComponent(city)}`);
        DOM.input.value = ''; // Input clear karna search ke baad
    } else {
        handleError("Please enter a city name!");
    }
}


function getLiveLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
            },
            () => {
                // Agar user deny kare, to cached ya default city run karega
                loadDefaultCity();
            }
        );
    } else {
        loadDefaultCity();
    }
}

// Default/Cached City load karne ka logic
function loadDefaultCity() {
    const savedCity = localStorage.getItem('lastCity') || API_CONFIG.DEFAULT_CITY;
    fetchWeatherData(`q=${encodeURIComponent(savedCity)}`);
}

// ==========================================================================
// EVENT LISTENERS (Basic to Advanced bindings)
// ==========================================================================

// Search button click event
DOM.button.addEventListener('click', handleSearch);

// Enter key press event input field par
DOM.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// App initialization logic (Usee Geolocation if available, else load default)
window.addEventListener('DOMContentLoaded', () => {
    getLiveLocationWeather();
});