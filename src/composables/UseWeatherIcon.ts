const OWM_TO_MATERIAL: Record<string, string> = {
  '01d': 'sunny',
  '01n': 'bedtime',
  '02d': 'partly_cloudy_day',
  '02n': 'partly_cloudy_night',
  '03d': 'cloud',
  '03n': 'cloud',
  '04d': 'cloud',
  '04n': 'cloud',
  '09d': 'rainy',
  '09n': 'rainy',
  '10d': 'rainy',
  '10n': 'rainy',
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  '13d': 'ac_unit',
  '13n': 'ac_unit',
  '50d': 'foggy',
  '50n': 'foggy',
}

export function getMaterialIcon(iconCode: string): string {
  return OWM_TO_MATERIAL[iconCode] ?? 'cloud'
}

export function owmIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export function formatTime(unixSeconds: number, timezoneOffsetSeconds = 0): string {
  const utcMs = unixSeconds * 1000
  const localMs = utcMs + timezoneOffsetSeconds * 1000
  const d = new Date(localMs)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function windDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(degrees / 45) % 8] ?? 'N'
}
