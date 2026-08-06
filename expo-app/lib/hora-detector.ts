// Base sequence for calculation (without Rahu/Ketu)
const BASE_GRAHA_SEQUENCE = [
  'Ravi',
  'Shukra',
  'Budh',
  'Chandra',
  'Shani',
  'Guru',
  'Mangal',
] as const;

// Full sequence including Rahu/Ketu for display when enabled
export const GRAHA_SEQUENCE = [
  'Ravi',
  'Shukra',
  'Budh',
  'Chandra',
  'Shani',
  'Guru',
  'Mangal',
  'Rahu',
  'Ketu',
] as const;

export type Graha = (typeof GRAHA_SEQUENCE)[number];

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type HoraPeriod = {
  index: number;
  graha: Graha;
  start: Date;
  end: Date;
  isActive: boolean;
  isPast: boolean;
};

export type HoraDay = {
  date: Date;
  sunrise: Date;
  nextSunrise: Date;
  periods: HoraPeriod[];
  current: HoraPeriod;
};

type SunriseApiResponse = {
  status: string;
  results?: {
    sunrise: string;
  };
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMs(date: Date, ms: number) {
  return new Date(date.getTime() + ms);
}

function getGrahaForPeriod(day: Date, periodIndex: number): Graha {
  return BASE_GRAHA_SEQUENCE[(day.getDay() * 24 + periodIndex) % BASE_GRAHA_SEQUENCE.length] as Graha;
}

// Dev mode flag - set to true to skip sunrise API and use hardcoded 6:00 AM
export const DEV_MODE = false;

// Hardcoded coordinates for dev mode (example: Mumbai)
export const DEV_MODE_COORDINATES: Coordinates = {
  latitude: 19.0760,
  longitude: 72.8777,
};

export class HoraDetector {
  async getSunriseTime(coordinates: Coordinates, date = new Date()) {
    // In dev mode, return hardcoded 6:00 AM
    if (DEV_MODE) {
      const dateKey = toDateKey(date);
      return new Date(`${dateKey}T06:00`);
    }

    const dateKey = toDateKey(date);
    const response = await fetch(
      `https://api.sunrisesunset.io/json?lat=${coordinates.latitude}&lng=${coordinates.longitude}&date=${dateKey}&time_format=24`,
    );

    if (!response.ok) {
      throw new Error('Unable to load sunrise time.');
    }

    const payload = (await response.json()) as SunriseApiResponse;

    if (payload.status !== 'OK' || !payload.results?.sunrise) {
      throw new Error('Sunrise service returned an invalid response.');
    }

    return new Date(`${dateKey}T${payload.results.sunrise}`);
  }

  async getHoraDay(coordinates: Coordinates, now = new Date(), showRahuKetu = false): Promise<HoraDay> {
    const todaysSunrise = await this.getSunriseTime(coordinates, now);
    const usedDate = now.getTime() >= todaysSunrise.getTime() ? now : addDays(now, -1);
    const sunrise =
      usedDate === now ? todaysSunrise : await this.getSunriseTime(coordinates, usedDate);
    const nextSunrise = await this.getSunriseTime(coordinates, addDays(usedDate, 1));
    const periodLength = (nextSunrise.getTime() - sunrise.getTime()) / 24;

    let periods = Array.from({ length: 24 }, (_, index) => {
      const start = addMs(sunrise, periodLength * index);
      const end = index === 23 ? nextSunrise : addMs(sunrise, periodLength * (index + 1));

      return {
        index,
        graha: getGrahaForPeriod(usedDate, index),
        start,
        end,
        isActive: now >= start && now < end,
        isPast: now >= end,
      };
    });

    // Insert Rahu and Ketu if enabled
    if (showRahuKetu) {
      periods = this.insertRahuKetu(periods, now);
    }

    return {
      date: usedDate,
      sunrise,
      nextSunrise,
      periods,
      current: periods.find((period) => period.isActive) ?? periods[0],
    };
  }

  private insertRahuKetu(periods: HoraPeriod[], now: Date): HoraPeriod[] {
    const rahuKetuDuration = 12 * 60 * 1000; 

    // Create a copy of periods to modify
    const modifiedPeriods = periods.map(p => ({ ...p }));

    // Find and modify Mangal → Ravi transition for Rahu insertion (all occurrences)
    for (let i = 0; i < modifiedPeriods.length - 1; i++) {
      const current = modifiedPeriods[i];
      const next = modifiedPeriods[i + 1];

      if (current.graha === 'Mangal' && next.graha === 'Ravi') {
        // Adjust Mangal: end 12 minutes earlier
        current.end = addMs(current.end, -rahuKetuDuration);
        
        // Adjust Ravi: start 12 minutes later
        next.start = addMs(next.start, rahuKetuDuration);
        
        // Insert Rahu period (24 minutes total)
        const rahuPeriod: HoraPeriod = {
          index: 0, // Will be reindexed later
          graha: 'Rahu',
          start: current.end,
          end: next.start,
          isActive: now >= current.end && now < next.start,
          isPast: now >= next.start,
        };
        
        // Insert Rahu between Mangal and Ravi
        modifiedPeriods.splice(i + 1, 0, rahuPeriod);
        // Skip the newly inserted Rahu period in the next iteration
        i++;
      }
    }

    // Find and modify Shani → Guru transition for Ketu insertion (all occurrences)
    for (let i = 0; i < modifiedPeriods.length - 1; i++) {
      const current = modifiedPeriods[i];
      const next = modifiedPeriods[i + 1];

      if (current.graha === 'Shani' && next.graha === 'Guru') {
        // Adjust Shani: end 12 minutes earlier
        current.end = addMs(current.end, -rahuKetuDuration);
        
        // Adjust Guru: start 12 minutes later
        next.start = addMs(next.start, rahuKetuDuration);
        
        // Insert Ketu period (24 minutes total)
        const ketuPeriod: HoraPeriod = {
          index: 0, // Will be reindexed later
          graha: 'Ketu',
          start: current.end,
          end: next.start,
          isActive: now >= current.end && now < next.start,
          isPast: now >= next.start,
        };
        
        // Insert Ketu between Shani and Guru
        modifiedPeriods.splice(i + 1, 0, ketuPeriod);
        // Skip the newly inserted Ketu period in the next iteration
        i++;
      }
    }

    // Reindex all periods and recalculate isActive/isPast
    return modifiedPeriods.map((period, index) => ({
      ...period,
      index,
      isActive: now >= period.start && now < period.end,
      isPast: now >= period.end,
    }));
  }
}

export const horaDetector = new HoraDetector();
