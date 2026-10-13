import test from 'node:test';
import assert from 'node:assert/strict';

import { formatAqhi, formatTemp, nextTrain } from './format.js';

test('formatTemp returns "--" when the station list is empty', () => {
  const data = { temperature: { data: [] } };

  assert.equal(formatTemp(data), '--');
});

test('formatTemp finds the requested station when the list order changes', () => {
  const data = {
    temperature: {
      data: [
        { place: 'Happy Valley', value: 31, unit: 'C' },
        { place: 'Hong Kong Observatory', value: 29, unit: 'C' },
      ],
    },
  };

  assert.equal(formatTemp(data), '29 °C');
});

test('formatTemp returns "--" when the requested station is missing', () => {
  const data = {
    temperature: {
      data: [{ place: 'Happy Valley', value: 31, unit: 'C' }],
    },
  };

  assert.equal(formatTemp(data), '--');
});

test('nextTrain converts a string ttnt value into numeric display text', () => {
  const data = {
    status: 1,
    data: {
      'ISL-HKU': {
        UP: [{ ttnt: '3', dest: 'CHW' }],
      },
    },
  };

  assert.equal(nextTrain(data, 'ISL', 'HKU'), 'CHW in 3 min');
});

test('nextTrain handles an API response with status 0', () => {
  const data = { status: 0 };

  assert.equal(
    nextTrain(data, 'ISL', 'XXX'),
    'Transport service is unavailable.',
  );
});

test('formatAqhi returns the station, value, and health risk', () => {
  const stations = [
    { station: 'Central/Western', aqhi: '3', health_risk: 'Low' },
  ];

  assert.equal(
    formatAqhi(stations, 'Central/Western'),
    'Central/Western: 3 (Low)',
  );
});

test('formatTemp rejects missing, blank, and non-numeric readings', () => {
  for (const value of [undefined, null, '', ' ', false, 'not a reading']) {
    const data = {
      temperature: {
        data: [{ place: 'Hong Kong Observatory', value, unit: 'C' }],
      },
    };

    assert.equal(formatTemp(data), '--');
  }
});

test('formatAqhi rejects missing and blank readings instead of displaying zero', () => {
  for (const aqhi of [undefined, null, '', ' ', false, []]) {
    const stations = [
      { station: 'Central/Western', aqhi, health_risk: 'Low' },
    ];

    assert.equal(formatAqhi(stations, 'Central/Western'), 'Air quality unavailable.');
  }
});

test('nextTrain rejects missing and blank minutes instead of displaying zero', () => {
  for (const ttnt of [undefined, null, '', ' ', false, []]) {
    const data = {
      status: 1,
      data: {
        'ISL-HKU': { UP: [{ ttnt, dest: 'CHW' }] },
      },
    };

    assert.equal(nextTrain(data, 'ISL', 'HKU'), 'Next-train data is unavailable.');
  }
});

test('formatTemp preserves a genuine zero temperature', () => {
  const data = {
    temperature: {
      data: [{ place: 'Hong Kong Observatory', value: 0, unit: 'C' }],
    },
  };

  assert.equal(formatTemp(data), '0 °C');
});

test('nextTrain preserves genuine numeric and string zero minutes', () => {
  for (const ttnt of [0, '0']) {
    const data = {
      status: 1,
      data: {
        'ISL-HKU': { UP: [{ ttnt, dest: 'CHW' }] },
      },
    };

    assert.equal(nextTrain(data, 'ISL', 'HKU'), 'CHW in 0 min');
  }
});
