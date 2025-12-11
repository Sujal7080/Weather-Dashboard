class WeatherDashboard {
    constructor() {
        // Note: In a real application, you would store this securely
        // For demo purposes, using a free tier API key
        this.API_KEY = 'demo_key'; // Replace with actual OpenWeatherMap API key
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDefaultCity();
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        const locationBtn = document.getElementById('locationBtn');

        searchBtn.addEventListener('click', () => this.searchWeather());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        locationBtn.addEventListener('click', () => this.getCurrentLocation());
    }

    async loadDefaultCity() {
        // Load weather for a default city (New York) on page load
        await this.getWeatherByCity('New York');
    }

    async searchWeather() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim();

        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.getWeatherByCity(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.hideLoading();
                this.showError('Unable to get your location. Please search for a city instead.');
            }
        );
    }

    async getWeatherByCity(city) {
        this.showLoading();
        
        try {
            // For demo purposes, we'll use mock data since we don't have a real API key
            const weatherData = this.getMockWeatherData(city);
            const forecastData = this.getMockForecastData();
            
            this.displayWeather(weatherData, forecastData);
        } catch (error) {
            this.showError('City not found. Please check the spelling and try again.');
        }
    }

    async getWeatherByCoords(lat, lon) {
        this.showLoading();
        
        try {
            // For demo purposes, using mock data
            const weatherData = this.getMockWeatherData('Your Location');
            const forecastData = this.getMockForecastData();
            
            this.displayWeather(weatherData, forecastData);
        } catch (error) {
            this.showError('Unable to fetch weather data for your location.');
        }
    }

    // Mock data for demonstration (replace with real API calls)
    getMockWeatherData(city) {
        return {
            name: city,
            main: {
                temp: Math.round(Math.random() * 30 + 10), // 10-40°C
                feels_like: Math.round(Math.random() * 30 + 10),
                humidity: Math.round(Math.random() * 40 + 40), // 40-80%
                pressure: Math.round(Math.random() * 50 + 1000) // 1000-1050 hPa
            },
            weather: [{
                main: 'Clear',
                description: 'clear sky',
                icon: '01d'
            }],
            wind: {
                speed: Math.round(Math.random() * 10 + 2) // 2-12 m/s
            },
            visibility: Math.round(Math.random() * 5000 + 5000), // 5-10km
            uvi: Math.round(Math.random() * 10) // 0-10
        };
    }

    getMockForecastData() {
        const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
        const conditions = [
            { main: 'Clear', icon: '01d', desc: 'Clear sky' },
            { main: 'Clouds', icon: '02d', desc: 'Few clouds' },
            { main: 'Rain', icon: '10d', desc: 'Light rain' },
            { main: 'Snow', icon: '13d', desc: 'Light snow' }
        ];

        return {
            list: days.map((day, index) => {
                const condition = conditions[Math.floor(Math.random() * conditions.length)];
                return {
                    dt_txt: day,
                    main: {
                        temp_max: Math.round(Math.random() * 15 + 20),
                        temp_min: Math.round(Math.random() * 10 + 5)
                    },
                    weather: [{
                        main: condition.main,
                        description: condition.desc,
                        icon: condition.icon
                    }]
                };
            })
        };
    }

    displayWeather(current, forecast) {
        this.hideLoading();
        this.hideError();
        
        // Display current weather
        document.getElementById('currentCity').textContent = current.name;
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('currentTemp').textContent = `${current.main.temp}°C`;
        document.getElementById('feelsLike').textContent = `${current.main.feels_like}°C`;
        document.getElementById('humidity').textContent = `${current.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${current.wind.speed} m/s`;
        document.getElementById('pressure').textContent = `${current.main.pressure} hPa`;
        document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
        document.getElementById('uvIndex').textContent = current.uvi || 'N/A';
        
        // Weather icon
        const iconUrl = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
        document.getElementById('weatherIcon').src = iconUrl;
        document.getElementById('weatherIcon').alt = current.weather[0].description;
        
        // Display forecast
        this.displayForecast(forecast);
        
        // Show weather content
        document.getElementById('weatherContent').classList.remove('hidden');
    }

    displayForecast(forecast) {
        const container = document.getElementById('forecastContainer');
        
        container.innerHTML = forecast.list.map(item => `
            <div class="forecast-item">
                <div class="forecast-date">${item.dt_txt}</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                         alt="${item.weather[0].description}">
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${item.main.temp_max}°</span>
                    <span class="forecast-low">${item.main.temp_min}°</span>
                </div>
                <div class="forecast-desc">${item.weather[0].description}</div>
            </div>
        `).join('');
    }

    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('weatherContent').classList.add('hidden');
        this.hideError();
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        this.hideLoading();
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
}

// Initialize the weather dashboard
const weatherDashboard = new WeatherDashboard();

// Note: To use real weather data, you need to:
// 1. Sign up for a free API key at https://openweathermap.org/api
// 2. Replace the mock data methods with actual API calls
// 3. Handle CORS by using a backend proxy or CORS-enabled endpoint