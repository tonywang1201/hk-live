import { formatAqhi, formatTemp, nextTrain } from './format.js';

const WEATHER_API_URL = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en';
const AIR_QUALITY_API_URL = 'https://dashboard.data.gov.hk/api/aqhi-individual?format=json';
const MTR_API_URL = 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=ISL&sta=HKU';
const WEATHER_STATION_NAME = 'Hong Kong Observatory';
const AIR_QUALITY_STATION_NAME = 'Central/Western';
const MTR_LINE = 'ISL';
const MTR_STATION = 'HKU';

const temperatureElement = document.querySelector('#weather-temperature');
const timestampElement = document.querySelector('#weather-timestamp');
const messageElement = document.querySelector('#weather-message');
const transportMinutesElement = document.querySelector('#transport-minutes');
const transportDestinationElement = document.querySelector('#transport-destination');
const transportMessageElement = document.querySelector('#transport-message');
const airQualityValueElement = document.querySelector('#air-quality-value');
const airQualityStationElement = document.querySelector('#air-quality-station');
const airQualityRiskElement = document.querySelector('#air-quality-risk');
const airQualityMessageElement = document.querySelector('#air-quality-message');

const renderWeather = (temperature, updateTime, message = '') => {
  temperatureElement.textContent = temperature;
  timestampElement.textContent = updateTime;

  if (message) {
    messageElement.textContent = message;
    messageElement.hidden = false;
  } else {
    messageElement.textContent = '';
    messageElement.hidden = true;
  }
};

const renderWeatherFallback = (message) => {
  renderWeather('-', 'Update time unavailable', message);
};

const renderTransport = (minutes, destination, message = '') => {
  transportMinutesElement.textContent = minutes;
  transportDestinationElement.textContent = destination;

  if (message) {
    transportMessageElement.textContent = message;
    transportMessageElement.hidden = false;
  } else {
    transportMessageElement.textContent = '';
    transportMessageElement.hidden = true;
  }
};

const renderTransportFallback = (message) => {
  renderTransport('-', 'Unavailable', message);
};

const renderAirQuality = (aqhi, station, risk, message = '') => {
  airQualityValueElement.textContent = aqhi;
  airQualityStationElement.textContent = station;
  airQualityRiskElement.textContent = risk;

  if (message) {
    airQualityMessageElement.textContent = message;
    airQualityMessageElement.hidden = false;
  } else {
    airQualityMessageElement.textContent = '';
    airQualityMessageElement.hidden = true;
  }
};

const renderAirQualityFallback = (message) => {
  renderAirQuality('-', 'Station unavailable', 'Risk unavailable', message);
};

const loadWeather = async () => {
  try {
    const response = await fetch(WEATHER_API_URL);

    if (!response.ok) {
      throw new Error('Weather data request failed.');
    }

    const data = await response.json();
    const temperature = formatTemp(data, WEATHER_STATION_NAME);
    const updateTime = formatTemp(data, WEATHER_STATION_NAME, 'updateTime');

    if (temperature === '--' || updateTime === 'Update time unavailable') {
      renderWeatherFallback('Weather data is unavailable.');
      return;
    }

    renderWeather(temperature, updateTime);
  } catch {
    renderWeatherFallback('Unable to load weather data.');
  }
};

const loadTransport = async () => {
  try {
    const response = await fetch(MTR_API_URL);

    if (!response.ok) {
      throw new Error('Transport data request failed.');
    }

    const data = await response.json();

    const train = nextTrain(data, MTR_LINE, MTR_STATION);

    if (train === 'No upcoming trains.') {
      renderTransport('-', 'No train', 'No upcoming trains.');
      return;
    }

    const transportFailures = [
      'Transport service is unavailable.',
      'Train data is unavailable.',
      'Next-train data is unavailable.',
    ];

    if (transportFailures.includes(train)) {
      renderTransportFallback(train);
      return;
    }

    renderTransport(
      nextTrain(data, MTR_LINE, MTR_STATION, 'minutes'),
      nextTrain(data, MTR_LINE, MTR_STATION, 'destination'),
    );
  } catch {
    renderTransportFallback('Unable to load transport data.');
  }
};

const loadAirQuality = async () => {
  try {
    const response = await fetch(AIR_QUALITY_API_URL);

    if (!response.ok) {
      throw new Error('Air-quality data request failed.');
    }

    const data = await response.json();
    const airQuality = formatAqhi(data, AIR_QUALITY_STATION_NAME);

    if (airQuality === 'Air quality unavailable.') {
      renderAirQualityFallback('Air quality unavailable.');
      return;
    }

    renderAirQuality(
      formatAqhi(data, AIR_QUALITY_STATION_NAME, 'aqhi'),
      formatAqhi(data, AIR_QUALITY_STATION_NAME, 'station'),
      formatAqhi(data, AIR_QUALITY_STATION_NAME, 'risk'),
    );
  } catch {
    renderAirQualityFallback('Air quality unavailable.');
  }
};

loadWeather();
loadTransport();
loadAirQuality();
