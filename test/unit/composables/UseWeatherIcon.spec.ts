import { describe, it, expect, beforeEach } from 'vitest'
import {
  getMaterialIcon,
  owmIconUrl,
  formatTime,
  windDirection,
} from 'src/composables/UseWeatherIcon'

describe('Composable: UseWeatherIcon', () => {

  describe('Method: getMaterialIcon', () => {

    describe('known day codes', () => {
      let result: string

      it('returns sunny for 01d', () => {
        result = getMaterialIcon('01d')
        expect(result).toBe('sunny')
      })

      it('returns partly_cloudy_day for 02d', () => {
        result = getMaterialIcon('02d')
        expect(result).toBe('partly_cloudy_day')
      })

      it('returns cloud for overcast 03d', () => {
        result = getMaterialIcon('03d')
        expect(result).toBe('cloud')
      })

      it('returns cloud for overcast 04d', () => {
        result = getMaterialIcon('04d')
        expect(result).toBe('cloud')
      })

      it('returns rainy for drizzle 09d', () => {
        result = getMaterialIcon('09d')
        expect(result).toBe('rainy')
      })

      it('returns rainy for rain 10d', () => {
        result = getMaterialIcon('10d')
        expect(result).toBe('rainy')
      })

      it('returns thunderstorm for 11d', () => {
        result = getMaterialIcon('11d')
        expect(result).toBe('thunderstorm')
      })

      it('returns ac_unit for snow 13d', () => {
        result = getMaterialIcon('13d')
        expect(result).toBe('ac_unit')
      })

      it('returns foggy for mist 50d', () => {
        result = getMaterialIcon('50d')
        expect(result).toBe('foggy')
      })
    })

    describe('known night codes', () => {
      let result: string

      it('returns bedtime for 01n', () => {
        result = getMaterialIcon('01n')
        expect(result).toBe('bedtime')
      })

      it('returns partly_cloudy_night for 02n', () => {
        result = getMaterialIcon('02n')
        expect(result).toBe('partly_cloudy_night')
      })

      it('returns ac_unit for snow 13n', () => {
        result = getMaterialIcon('13n')
        expect(result).toBe('ac_unit')
      })

      it('returns foggy for mist 50n', () => {
        result = getMaterialIcon('50n')
        expect(result).toBe('foggy')
      })
    })

    describe('unknown or empty codes', () => {
      it('returns cloud as fallback for unknown code', () => {
        expect(getMaterialIcon('99x')).toBe('cloud')
      })

      it('returns cloud for empty string', () => {
        expect(getMaterialIcon('')).toBe('cloud')
      })
    })

    describe('Snapshot: all known codes', () => {
      it('matches snapshot', () => {
        const codes = [
          '01d','01n','02d','02n','03d','03n','04d','04n',
          '09d','09n','10d','10n','11d','11n','13d','13n','50d','50n',
        ]
        const map = codes.reduce<Record<string, string>>((acc, c) => {
          acc[c] = getMaterialIcon(c)
          return acc
        }, {})
        expect(map).toMatchSnapshot()
      })
    })
  })

  describe('Method: owmIconUrl', () => {
    let url: string

    beforeEach(() => {
      url = owmIconUrl('10d')
    })

    it('contains the icon code', () => {
      expect(url).toContain('10d')
    })

    it('points to openweathermap.org', () => {
      expect(url).toContain('openweathermap.org')
    })

    it('uses @2x.png resolution', () => {
      expect(url).toContain('@2x.png')
    })

    it('returns the exact expected URL for 01d', () => {
      expect(owmIconUrl('01d')).toBe('https://openweathermap.org/img/wn/01d@2x.png')
    })

    it('matches snapshot', () => {
      expect(url).toMatchSnapshot()
    })
  })

  describe('Method: formatTime', () => {
    const MIDNIGHT_UTC = 1704067200
    let result: string

    describe('with zero offset', () => {
      beforeEach(() => {
        result = formatTime(MIDNIGHT_UTC, 0)
      })

      it('formats as 00:00', () => {
        expect(result).toBe('00:00')
      })
    })

    describe('with positive offset UTC+1', () => {
      beforeEach(() => {
        result = formatTime(MIDNIGHT_UTC, 3600)
      })

      it('formats as 01:00', () => {
        expect(result).toBe('01:00')
      })
    })

    describe('with negative offset UTC-5', () => {
      beforeEach(() => {
        result = formatTime(MIDNIGHT_UTC, -18000)
      })

      it('formats as 19:00', () => {
        expect(result).toBe('19:00')
      })
    })

    describe('with half-hour offset UTC+5:30', () => {
      beforeEach(() => {
        result = formatTime(MIDNIGHT_UTC, 19800)
      })

      it('formats as 05:30', () => {
        expect(result).toBe('05:30')
      })
    })

    it('zero-pads single-digit hours and minutes', () => {
      expect(formatTime(MIDNIGHT_UTC + 3600 + 300, 0)).toBe('01:05')
    })

    it('defaults to UTC when offset is omitted', () => {
      expect(formatTime(MIDNIGHT_UTC)).toBe('00:00')
    })

    it('matches snapshot for typical sunrise 06:23 UTC', () => {
      expect(formatTime(MIDNIGHT_UTC + 6 * 3600 + 23 * 60, 0)).toMatchSnapshot()
    })
  })

  describe('Method: windDirection', () => {
    let result: string

    describe('exact cardinal points', () => {
      it('returns N for 0°', () => {
        result = windDirection(0)
        expect(result).toBe('N')
      })

      it('returns N for 360° full circle', () => {
        result = windDirection(360)
        expect(result).toBe('N')
      })

      it('returns NE for 45°', () => {
        result = windDirection(45)
        expect(result).toBe('NE')
      })

      it('returns E for 90°', () => {
        result = windDirection(90)
        expect(result).toBe('E')
      })

      it('returns SE for 135°', () => {
        result = windDirection(135)
        expect(result).toBe('SE')
      })

      it('returns S for 180°', () => {
        result = windDirection(180)
        expect(result).toBe('S')
      })

      it('returns SW for 225°', () => {
        result = windDirection(225)
        expect(result).toBe('SW')
      })

      it('returns W for 270°', () => {
        result = windDirection(270)
        expect(result).toBe('W')
      })

      it('returns NW for 315°', () => {
        result = windDirection(315)
        expect(result).toBe('NW')
      })
    })

    describe('rounding behaviour', () => {
      it('rounds 20° down to N', () => {
        expect(windDirection(20)).toBe('N')
      })

      it('rounds 25° up to NE', () => {
        expect(windDirection(25)).toBe('NE')
      })
    })

    describe('Snapshot: all 8 cardinal directions', () => {
      it('matches snapshot', () => {
        const results = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => ({
          deg,
          direction: windDirection(deg),
        }))
        expect(results).toMatchSnapshot()
      })
    })
  })

})
