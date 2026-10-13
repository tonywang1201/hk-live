export function formatTemp(data, stationName = 'Hong Kong Observatory', part = 'temperature') {
  const temperatures = data?.temperature?.data;
  const stationReading = Array.isArray(temperatures)
    ? temperatures.find((reading) => reading.place === stationName)
    : undefined;
  const hasTemperature = stationReading
    && (typeof stationReading.value === 'number' || typeof stationReading.value === 'string')
    && String(stationReading.value).trim() !== ''
    && Number.isFinite(Number(stationReading.value))
    && stationReading.unit === 'C';
  const hasUpdateTime = typeof data?.updateTime === 'string'
    && data.updateTime.length > 0;

  if (!hasTemperature) {
    return part === 'updateTime' ? 'Update time unavailable' : '--';
  }

  if (part === 'updateTime') {
    return hasUpdateTime ? data.updateTime : 'Update time unavailable';
  }

  return `${stationReading.value} °C`;
}

export function formatAqhi(stations, stationName, part = 'summary') {
  const stationReading = Array.isArray(stations)
    ? stations.find((reading) => reading.station === stationName)
    : undefined;
  const aqhi = Number(stationReading?.aqhi);
  const hasValidReading = stationReading
    && (typeof stationReading.aqhi === 'number' || typeof stationReading.aqhi === 'string')
    && String(stationReading.aqhi).trim() !== ''
    && Number.isFinite(aqhi)
    && typeof stationReading.health_risk === 'string'
    && stationReading.health_risk.length > 0;

  if (!hasValidReading) {
    return 'Air quality unavailable.';
  }

  const output = {
    aqhi: String(aqhi),
    risk: stationReading.health_risk,
    station: stationReading.station,
    summary: `${stationReading.station}: ${aqhi} (${stationReading.health_risk})`,
  };

  return output[part] ?? output.summary;
}

export function nextTrain(data, line, station, part = 'summary') {
  if (data?.status !== 1) {
    return 'Transport service is unavailable.';
  }

  const stationData = data?.data?.[`${line}-${station}`];

  if (!stationData || !Array.isArray(stationData.UP)) {
    return 'Train data is unavailable.';
  }

  if (stationData.UP.length === 0) {
    return 'No upcoming trains.';
  }

  const train = stationData.UP[0];
  const rawMinutes = train?.ttnt;
  const minutes = Number(rawMinutes);
  const hasValidTrain = (typeof rawMinutes === 'number' || typeof rawMinutes === 'string')
    && String(rawMinutes).trim() !== ''
    && Number.isInteger(minutes)
    && minutes >= 0
    && typeof train?.dest === 'string'
    && train.dest.length > 0;

  if (!hasValidTrain) {
    return 'Next-train data is unavailable.';
  }

  const output = {
    destination: train.dest,
    minutes: String(minutes),
    summary: `${train.dest} in ${minutes} min`,
  };

  return output[part] ?? output.summary;
}
