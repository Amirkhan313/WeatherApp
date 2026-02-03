"use strict";
const dropdownBtn = document.querySelector(".dropdown-list");
const units = document.querySelector(".units");
const dropdownArrowUnit = document.querySelector('.dropdown_arrow');
const dropdownArrowDays = document.querySelector('.dropdownArrow');
const btnMenu = document.querySelector('.btnMenu');
const defualtDay = document.querySelector(".defualt_day");
const weekDaysMenu = [...document.querySelectorAll(".container_two li")];
const weekDays = weekDaysMenu.map(
    li => li.textContent.trim().toLowerCase());
// console.log(weekDaysMenu, typeof weekDaysMenu, Array.isArray(weekDaysMenu));
// console.log(weekDaysMenu.constructor.name);
const dailyCondtion = document.querySelector(".dailyCondtion");
const searchBtn = document.getElementById("searchBtn");
const inputValue = document.getElementById('inputValue');
const suggestionsList = document.querySelector('#suggestion-list');
const dailyForcast = document.querySelector('#dailyForecast');
const day = document.querySelector('.day');
const hourlyForecast = document.querySelector('.hourly-forecast');
const ConncetionError = document.querySelector('#show_connection_error');
ConncetionError.classList.add('hideContent');
const retryBtn = document.querySelector('#retryBtn');
const websiteBody = document.querySelector('.weather_site');
const body = document.querySelector('body');
const spinerBtn = document.querySelector('.spinerBtn');
const spinnerIcon = document.querySelector('.spinnerIcon');
const ErrorConnection = document.querySelector('.ErrorConnection');
const loadingMesage = document.querySelector('.loadingMesage');
const weatherIcon = document.querySelector("#wetherIcon");
let lastLocation = { lat: 34.34817, lon: 62.19967 };
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temperature = document.getElementById('temperature')
const FeelsLike = document.getElementById('FeelsLike');
const Humidity = document.getElementById('Humidity');
const Wind = document.getElementById('Wind');
const Precipitation = document.getElementById('Precipitation');
let defaultCity = 'Herat';

// Store the current unit selection
let unitsSelected = {
    temperature: "C",
    wind: "km/h",
    precipitation: "mm"
};

// Temperature buttons
const tempCBtn = document.querySelector('[data-type="temp"][data-unit="C"]');
const tempFBtn = document.querySelector('[data-type="temp"][data-unit="F"]');

// wind buttons
const windKmBtn = document.querySelector('[data-type="wind"][data-unit="km/h"]');
const windMphBtn = document.querySelector('[data-type="wind"][data-unit="mph"]');

// precipitation buttons
const precipInBtn = document.querySelector('[data-type="precip"][data-unit="in"]');
const precipMmBtn = document.querySelector('[data-type="precip"][data-unit="mm"]');

// Temperature
tempCBtn.addEventListener("click", () => {
    unitsSelected.temperature = "C";
    console.log(unitsSelected.temperature)
    tempCBtn.classList.add("active");
    tempFBtn.classList.remove("active");
    updateWeatherUnits();
});

tempFBtn.addEventListener("click", () => {
    unitsSelected.temperature = "F";
    console.log(unitsSelected.temperature)
    tempFBtn.classList.add("active");
    tempCBtn.classList.remove("active");
    updateWeatherUnits();
});

// Wind
windKmBtn.addEventListener("click", () => {
    unitsSelected.wind = "km/h";
    windKmBtn.classList.add("active");
    windMphBtn.classList.remove("active");
    updateWeatherUnits();
});

windMphBtn.addEventListener("click", () => {
    unitsSelected.wind = "mph";
    windMphBtn.classList.add("active");
    windKmBtn.classList.remove("active");
    updateWeatherUnits();
});

// Precipitation
precipMmBtn.addEventListener("click", () => {
    unitsSelected.precipitation = "mm";
    precipMmBtn.classList.add("active");
    precipInBtn.classList.remove("active");
    updateWeatherUnits();
});
precipInBtn.addEventListener("click", () => {
    unitsSelected.precipitation = "in";
    precipInBtn.classList.add("active");
    precipMmBtn.classList.remove("active");
    updateWeatherUnits();
});


function updateWeatherUnits() {
    const today = new Date().toISOString().split("T")[0];
    if (window.weatherData) {
        displayHourlyForecast(window.weatherData, today);
        displayDefualtLocation(); // updates current temp, wind, precipitation
        displayDailyWeather(window.weatherData.daily); // update daily cards
    }
}

function convertTemperature(tempC) {
    return unitsSelected.temperature === "C" ? tempC : tempC * 9 / 5 + 32;
}

function convertWind(speedKmH) {
    return unitsSelected.wind === "km/h" ? speedKmH : speedKmH / 1.609;
}

function convertPrecip(mm) {
    return unitsSelected.precipitation === "mm" ? mm : mm / 25.4;
}


// dropdown for units
let flag = 0;
dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    units.classList.toggle("open");
    flag === 0 ? (dropdownArrowUnit.style.rotate = "180deg", flag++) : (dropdownArrowUnit.style.rotate = "0deg", flag--);
});
document.addEventListener("click", () => {
    if (units.classList.contains("open")) {
        units.classList.remove("open");
        flag === 0 ? (dropdownArrowUnit.style.rotate = "180deg", flag++) : (dropdownArrowUnit.style.rotate = "0deg", flag--);
    };

});


// defualt value for the button day 
const newDay = weekDays[new Date().getDay()];
if (defualtDay) {
    defualtDay.textContent = newDay;
}

currentDate.innerText = new Date().toDateString();
weekDaysMenu[0].classList.add('active_one')
btnMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    dailyCondtion.classList.toggle("expand");
    dropdownArrowDays.classList.toggle('round');
});


// Weekday click
weekDaysMenu.forEach((day) => {
    day.addEventListener("click", async () => {
        weekDaysMenu.forEach(d => d.classList.remove("active_one"));
        day.classList.add("active_one");
        defualtDay.textContent = day.textContent;
        const clickedDay = defualtDay.textContent.trim().toLowerCase();
        const selectedDate = getDateFromWeekday(clickedDay);
        if (!lastLocation) return;
        const weatherData = await getWeather(lastLocation.lat, lastLocation.lon);
        if (weatherData) {
            displayHourlyForecast(weatherData, selectedDate);
        }
    });
});

document.addEventListener("click", () => {
    if (dailyCondtion.classList.contains("expand")) {
        dailyCondtion.classList.remove("expand");
        dropdownArrowDays.classList.remove('round');
    }
});


// get the icon based wweather conditions
function getWeatherIcon({ weathercode, isDay_Night, precipitation = 0 }) {
    const code = Number(weathercode);
    const prec = Number(precipitation);

    if (code === 0 && isDay_Night) return "icon-sunny.webp";
    if (code === 0 && !isDay_Night) return "icon-clear-night.webp";

    if ((code === 1 || code === 2) && isDay_Night) return "icon-partly-cloudy.webp";
    if ((code === 1 || code === 2) && !isDay_Night) return "icon-partly-cloudy-night.webp";

    if (code === 3) return "icon-overcast.webp";
    if (code === 45 || code === 48) return "icon-fog.webp";
    if ([51, 53, 55, 56, 57].includes(code)) return "icon-drizzle.webp";

    if ([61, 63, 80, 81].includes(code)) {
        if (prec < 5) return "icon-rain.webp";
        else return "icon-heavy-rain.webp";
    }

    if ([65, 82].includes(code) || prec >= 5) return "icon-heavy-rain.webp";
    if ([66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return "icon-snow.webp";
    if ([95, 96, 99].includes(code)) return "icon-thunderstorm.webp";

    return "icon-overcast.webp"; // fallback
}


// Map day name to actual date from daily.time
function getDateFromWeekday(weekday, referenceDate = new Date()) {
    const todayIndex = referenceDate.getDay();
    const targetIndex = weekDays.indexOf(weekday);
    if (targetIndex === -1) {
        throw new Error("Invalid weekday name");
    }
    let diff = targetIndex - todayIndex;
    if (diff < 0) diff += 7; // next week if day passed

    const targetDate = new Date(referenceDate);
    targetDate.setDate(referenceDate.getDate() + diff);

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}


async function getLocation(location) {
    const locApi = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=en&format=json`;
    const response = await fetch(locApi)
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
        return null; // or throw an error
    }
    const result = data.results[0];
    return {
        city: result.name || "",
        country: result.country || "",
        lat: result.latitude,
        lon: result.longitude
    }
}


async function getWeather(lat, lon) {
    lastLocation = { lat, lon };
    const weatherApi = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode,windspeed_10m,winddirection_10m,precipitation,rain&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours&timezone=auto`
    try {
        const response = await fetch(weatherApi);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        window.weatherData = data;
        // default today hourly
        const today = new Date();
        const selectedDate = today.toISOString().split("T")[0];
        displayHourlyForecast(data, selectedDate);
        displayDailyWeather(data.daily);
        const code = data.current_weather.weathercode;
        const isDay_Night = Boolean(data.current_weather.is_day);
        const icon = getWeatherIcon({ weathercode: code, isDay_Night });

        const currentTime = data.current_weather.time.slice(0, 13) + ":00";
        const index = data.hourly.time.indexOf(currentTime);

        if (index === -1) {
            console.log("Time not found in hourly data");
            return;
        }
        const temp = data.hourly.temperature_2m[index];
        const feels = data.hourly.apparent_temperature[index];
        const humidity = data.hourly.relativehumidity_2m[index];
        const rain = data.hourly.precipitation[index];
        const wind = data.current_weather.windspeed;

        temperature.textContent = `${convertTemperature(temp).toFixed(0)}°${unitsSelected.temperature}`;
        FeelsLike.textContent = `${convertTemperature(feels).toFixed(0)}°${unitsSelected.temperature}`;
        Humidity.textContent = `${humidity.toFixed(0)}%`;
        Wind.textContent = `${convertWind(wind).toFixed(0)} ${unitsSelected.wind}`;
        Precipitation.textContent = `${convertPrecip(rain).toFixed(1)} ${unitsSelected.precipitation}`;
        weatherIcon.src = `assets/images/${icon}`;
        return data;
    }
    catch (error) {
        console.log("Could not fetch data:", error);
        dailyForcast.innerHTML = "<p class='text-center w-100 text-red-400'>Failed to load data</p>";
    }
}

async function searchSuggestion(locSuggestion) {
    const locUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locSuggestion)}&count=5&language=en&format=json`;
    const res = await fetch(locUrl);
    const data = await res.json();
    console.log(data.results)
    return data.results;
}


async function displayHourlyForecast(data, selectedDate) {
    if (!data?.hourly?.time) return;
    const hourly = data.hourly;
    const hourlyForecast = document.querySelector(".boxes");
    hourlyForecast.innerHTML = ""; // clear previous
    hourly.time.forEach((timeStr, index) => {
        const dateOnly = timeStr.split("T")[0];
        if (dateOnly === selectedDate) {
            const hourStr = timeStr.split("T")[1].slice(0, 5);
            const hourNum = Number(hourStr.split(":")[0]);
            let hour12 = hourNum % 12;
            if (hour12 === 0) hour12 = 12;
            let period = hourNum >= 12 ? "PM" : "AM";
            const isDay_Night = hourNum >= 6 && hourNum < 18;

            const temp = hourly.temperature_2m[index];
            const precipitation = hourly.precipitation[index] || 0;
            const weathercode = hourly.weathercode[index];

            const icon = getWeatherIcon({ weathercode, isDay_Night, precipitation });

            const hourBox = document.createElement("div");
            hourBox.className = "wet_box";
            hourBox.innerHTML = `<p><img src="assets/images/${icon.split('/').pop()}" alt=""> ${hour12} ${period}</p> <p>${temp.toFixed(0)}°${unitsSelected.temperature}</p>`;
            hourlyForecast.appendChild(hourBox);
        }
    });

    if (hourlyForecast.children.length === 0) {
        hourlyForecast.innerHTML = `<p class="text-red-500 text-center w-full">No hourly data available</p>`;
    }
}


async function displayDefualtLocation() {
    let location = await getLocation(defaultCity);
    if (!location) {
        location = { city: "Herat", country: "Afghanistan", lat: 34.34817, lon: 62.19967 }
    }
    const weather = await getWeather(location.lat, location.lon);

    if (!weather || !weather.current_weather || !weather.hourly) {
        console.error("Weather data is incomplete:", weather);
        return; // stop if data missing
    }
    // Current time index
    const currentHour = weather.current_weather.time.slice(0, 13) + ":00";
    const idx = weather.hourly.time.indexOf(currentHour);

    if (idx === -1) {
        console.log("Time not found in hourly data");
        return;
    }
    cityName.textContent = `${location.city}, ${location.country}`;
    temperature.textContent = `${convertTemperature(weather.current_weather.temperature).toFixed(0)}°${unitsSelected.temperature}`;
    FeelsLike.textContent = `${convertTemperature(weather.hourly.apparent_temperature[idx]).toFixed(0)}°${unitsSelected.temperature}`;
    Humidity.textContent = `${weather.hourly.relativehumidity_2m[idx].toFixed(0)}%`;
    Wind.textContent = `${convertWind(weather.current_weather.windspeed).toFixed(0)} ${unitsSelected.wind}`;
    Precipitation.textContent = `${convertPrecip(weather.hourly.precipitation[idx]).toFixed(1)} ${unitsSelected.precipitation}`;
}
window.addEventListener("load", displayDefualtLocation);


async function displayDailyWeather(daily) {
    if (!daily || !daily.time || daily.time.length === 0) {
        dailyForcast.innerHTML = `
            <p class="text-center text-red-600 py-4">
                No daily data available
            </p>
        `;
        return;
    }
    dailyForcast.innerHTML = "";
    daily.time.forEach((date, index) => {
        const dayName = new Date(date).toLocaleDateString("en-US", {
            weekday: "short"
        });
        const code = daily.weathercode[index];
        const icon = getWeatherIcon({ weathercode: code, isDay_Night: true });
        let day = document.createElement('div');
        day.className = `bg-[#25253f] border border-[#353356] rounded-lg !py-3 [@media(max-width:426px)]:!px-6 flex flex-col items-center w-full max-w-[100px] sm:max-w-[120px] md:max-w-[140px] text-center`;
        let img = document.createElement('img');
        img.className = `md:w-17 sm:w-17 md:!my-3 [@media(max-width:768px)]:my-3 [@media(max-width:950px)]:w-16 [@media(max-width:950px)]:my-1.5 [@media(max-width:900px)]:my-0`;
        img.src = `assets/images/${icon}`;
        let p = document.createElement('p');
        p.className = `text-[14px] [@media(max-width:1150px)and(min-width:1081px)]:text-[13px] [@media(max-width:1080px)and(min-width:1025px)]:text-[12px] [@media(max-width:1024px)and(min-width:891px)]:text-[10px] [@media(max-width:890px)and(min-width:769px)]:text-[8px] [@media(max-width:768px)]:text-[14px] [@media(max-width:426px)]:!text-[16px]`;
        p.innerText = dayName;
        const rate = document.createElement('div');
        rate.className = `flex mx-auto justify-between items-center lg:gap-x-5 md:gap-x-3 [@media(max-width:1150px)]:gap-x-4`;
        const max = document.createElement("p");
        max.className = `text-[14px] [@media(max-width:1200px)and(min-width:1081px)]:!text-[13px] [@media(max-width:1080px)and(min-width:1025px)]:text-[12px] [@media(max-width:1024px)and(min-width:891px)]:text-[10px] [@media(max-width:890px)and(min-width:769px)]:text-[8px] [@media(max-width:768px)]:text-[14px] [@media(max-width:426px)]:text-[16px]`;
        max.innerText = `${convertTemperature(daily.temperature_2m_max[index]).toFixed(0)}°${unitsSelected.temperature}`;
        const min = document.createElement("p");
        min.className = `text-[14px] [@media(max-width:1200px)and(min-width:1081px)]:!text-[13px] [@media(max-width:1080px)and(min-width:1025px)]:text-[12px] [@media(max-width:1024px)and(min-width:891px)]:text-[10px] [@media(max-width:890px)and(min-width:769px)]:text-[8px] [@media(max-width:768px)]:text-[14px] [@media(max-width:426px)]:text-[16px]`;
        min.innerText = `${convertTemperature(daily.temperature_2m_min[index]).toFixed(0)}°${unitsSelected.temperature}`;
        rate.appendChild(max);
        rate.appendChild(min);
        day.appendChild(p);
        day.appendChild(img);
        day.appendChild(rate);
        dailyForcast.appendChild(day);
    });
}


inputValue.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const searchedLocation = inputValue.value.trim();
        if (!searchedLocation) return;
        const location = await getLocation(searchedLocation);
        if (!location) {
            cityName.textContent = "location not found";
            return;
        }
        await getWeather(location.lat, location.lon);
        cityName.textContent = location.city + ", " + location.country;
    }
});

inputValue.addEventListener('input', async () => {
    const searchedValue = inputValue.value.trim();
    suggestionsList.innerHTML = "";

    if (!searchedValue) return;
    const locations = await searchSuggestion(searchedValue);
    // here the question mark check if the locations has data or no
    locations?.forEach((city) => {
        if (city.name !== null || city.country !== null) {
            suggestionsList.classList.remove('hidden');
            const li = document.createElement("li");
            li.className = "hover:bg-[#3c3b5d] text-[10px] !text-gray-400 border-b border-white/8 last:border-0 !px-4 !py-2 cursor-pointer"
            li.textContent = `${city.name}, ${city.country}`;
            const p = document.createElement('p');
            p.className = "text-[16px] !text-white";
            p.textContent = `${city.name}`;
            li.prepend(p);

            li.addEventListener("click", async (e) => {
                e.preventDefault();
                suggestionsList.innerHTML = "";
                suggestionsList.classList.add('hidden')
                inputValue.value = city.name;
                const input_value = inputValue.value.trim();
                if (!input_value) return;
                const location = await getLocation(input_value);
                if (!location) {
                    cityName.textContent = 'location not found!';
                    return;
                }
                getWeather(location.lat, location.lon);
                cityName.textContent = location.city + ", " + location.country;
                inputValue.value = "";
                // weatherIcon.src = ``;
            });
            suggestionsList.appendChild(li);
        }
    });
});

document.addEventListener('click', (e) => {
    if (!suggestionsList.contains(e.target) && !inputValue.contains(e.target)) {
        suggestionsList.classList.add('hidden');
    }
});

searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const searchedLocation = inputValue.value.trim();
    if (!searchedLocation) return;
    const location = await getLocation(searchedLocation);
    if (!location) {
        cityName.textContent = "location not found";
        return;
    }
    cityName.textContent = location.city + ", " + location.country;
    await getWeather(location.lat, location.lon);
});


function updateConnectionError() {
    if (!navigator.onLine) {
        ConncetionError.classList.remove('hideContent');
        websiteBody.classList.add('hideContent');
        body.className = "flex justify-center items-center mx-auto h-screen bg-[#02012b]";
    }
}
updateConnectionError();


retryBtn.addEventListener('click', async () => {
    spinnerIcon.classList.add('fa-spin');
    loadingMesage.textContent = "Retrying..."
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!navigator.onLine) {
        spinnerIcon.classList.remove('fa-spin');
        loadingMesage.textContent = "Retry"
        return;
    }

    try {
        ConncetionError.classList.add('hideContent')
        websiteBody.classList.remove('hideContent');
    }
    catch (err) {
        ConncetionError.classList.remove('hideContent')
        loadingMesage.textContent = "failed. Tab to retry";
    }
    finally {
        spinnerIcon.classList.remove('fa-spin');
    }

});