const dayNameSpans = document.querySelectorAll(".dailyForecast .dayName");
const dayTempSpans = document.querySelectorAll(".dayTemp");
const dailyForecastTexts = document.querySelectorAll(".dailyForecast .forecastText");
const forecastToday = document.querySelector(".forecastToday .forecastText");
const weatherIcons = document.querySelectorAll("#forecastSection i");
const currentWeekday = document.querySelector("#currentWeekday");
const currentDate = document.querySelector("#fullCurrentDate");
const citySpan = document.querySelector("#cityName");
const countrySpan = document.querySelector("#countryName");
const dropIcon = document.querySelector("#dropIcon");
const searchForm = document.querySelector("#searchform");
const searchCity = document.querySelector("#findCity");
const searchCountry = document.querySelector("#findCountry");
const errorMsg = document.querySelector("#errorMsg");
const exit = document.querySelector("#exit");
const apiID = "&appid=64b24d6f700e91128f18e56fa42c624c";
const allTemperatures = [];
const allTextsForIcons = [];
const allForecastTexts = [];
let newCity = "Nashik";
let newCountry = "IN";
let currentCity = newCity;
let currentCountry = "India";
let newCityLatitude;
let newCityLongitude;
let date = new Date();


setDate();
setNextDaysNames();
showForecast();


// *** Show current date and name of the week ***//

function whichDay(dayNum){
    let text;
    switch (dayNum) {
    case 1: text = "Monday"; break;
    case 2: text = "Tuesday"; break;
    case 3: text = "Wednesday"; break;
    case 4: text = "Thursday"; break;
    case 5: text = "Friday"; break;
    case 6: text = "Saturday"; break;
    case 0: text = "Sunday"; break;
    default: console.log("Invalid day number!");
    }
    return text;
};

function setDate() {
    currentWeekday.innerHTML = whichDay(date.getUTCDay());
    currentDate.innerHTML = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;
};

function setNextDaysNames() {
    try {
        let i = date.getUTCDay();
        for (dayName of dayNameSpans) {
            if (i < 6) { i++ }
            else { i = 0 } 
            dayName.innerText = whichDay(i).slice(0, 3);       
        }}
    catch {e => console.error(e)}
};



// **** Get data from the Weather API **** //

function createCityInfoURL() {
    const findCityURL = "https://api.openweathermap.org/data/2.5/weather?q=";    
    let cityName = newCity.toLowerCase();
    let stateCode = newCountry.toLowerCase();
    let fullURL = findCityURL + cityName + "," + stateCode + apiID;
    return fullURL;
};

async function getCityCoordinates() {
    await fetch(createCityInfoURL())
        .then(response => response.json())
        .then(function(json) {
        currentCity = json.name;
        currentCountry = json.sys.country;
        newCityLatitude = json.coord.lat;
        newCityLongitude = json.coord.lon;
        })
        .catch(err => {console.log('Request Failed', err)}
    )
};

function createForecastURL() {
    const apiWeek = "https://api.openweathermap.org/data/2.5/onecall?";
    const apiWeekExclude = "&exclude=current,minutely,hourly,alerts&units=metric";
    let urlLat = "lat=" + newCityLatitude;
    let urlLon = "&lon=" + newCityLongitude;
    let forecastURL = apiWeek + urlLat + urlLon + apiWeekExclude + apiID;
    return forecastURL;
};

async function getWeeklyForecast() {
    await getCityCoordinates();
    await fetch(createForecastURL())
        .then (response => response.json())
        .then(function(json) {                        
            for (let i = 0; i < 8; i++) {
                allTemperatures[i] = json.daily[i].temp.day.toFixed();
                allTextsForIcons[i] = json.daily[i].weather[0].main;
                allForecastTexts[i] = json.daily[i].weather[0].description;
            }
        })
        .catch(err => {console.log('Request Failed', err)}
    )
};

async function getCountryName() {
    let ccapi = "https://restcountries.eu/rest/v2/alpha/";
    await fetch(ccapi + newCountry.toLowerCase())
    .then(response => response.json())
    .then(function(json) {
        currentCountry = json.name;        
    })
    .catch(err => {console.log('Request Failed', err)})
};



// *** Show weekly forecast *** //

async function showCountryName() {
    try {await getCountryName()}
    catch {e => console.error(e)}
    if ((currentCity !== undefined) && (currentCountry !== undefined)){
        citySpan.innerText = currentCity;
        countrySpan.innerText = currentCountry;
        hide(searchForm); 
    }
    else {show(errorMsg)};    
};

function showForecastTexts() {
    forecastToday.innerText = allForecastTexts[0];
    let i = 1;
    for (forecast of dailyForecastTexts) {
    forecast.innerText = allForecastTexts[i];
    i++;
    };
};

function whichIcon(arritem){
    let text;
    switch (arritem) {
    case "Snow": text = "fa-snowflake"; break;
    case "Rain": ;
    case "Drizzle": text = "fa-cloud-showers-heavy"; break;
    case "Clear": text = "fa-sun"; break;
    case "Clouds": text = "fa-cloud"; break;
    case "Thunderstorm": text = "fa-bolt"; break;    
    default: text = "fa-smog";
    };
    return text;
};

function showIcons() {
    let i = 0;
    for (icon of weatherIcons) {
        let iconClass = whichIcon(allTextsForIcons[i]);
        icon.classList = `fas ${iconClass}`;
        i++;
    };
};

function showTemperatures() {
    let i = 0
    for (day of dayTempSpans) {        
        let temp = allTemperatures[i];
        day.innerText = `${temp}°`;
        i++;
    };
};

async function showForecast() {
    try {
        await getWeeklyForecast();
        await showCountryName();
        showForecastTexts();
        showIcons();
        showTemperatures();       
    }
    catch {e => console.error(e);}
};



// *** Choose another city ***

// Show or hide form

function hide(object) {
    if (!object.classList.contains("hide")){
        object.classList.add("hide");
    };
    if (object === searchForm) {
        dropIcon.classList.remove("fa-caret-square-up", "clicked");
        dropIcon.classList.add("fa-caret-square-down");  
    };
};

function show(object) {
    if (object.classList.contains("hide")){
        object.classList.remove("hide");
    };
    if (object === searchForm) {
        dropIcon.classList.remove("fa-caret-square-down");
        dropIcon.classList.add("fa-caret-square-up", "clicked");  
    };
};

dropIcon.addEventListener("click", () => {
    if (!dropIcon.classList.contains("clicked")){
        show(searchForm);        
    }
    else {
        hide(searchForm);
        hide(errorMsg);        
    };    
});

// Show forecast on form submit
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hide(errorMsg);
    newCity = searchCity.value;
    newCountry = searchCountry.value;
    try {
        await showForecast();         
    }   
    catch {e => console.error(e)}
});

exit.addEventListener("click", (e) => {
    e.preventDefault();
    hide(searchForm);
    hide(errorMsg);
});
    