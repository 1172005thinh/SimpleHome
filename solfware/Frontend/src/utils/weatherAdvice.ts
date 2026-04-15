export interface WeatherAdvice {
  key: 'rain' | 'hot' | 'cold' | null
  message: string | null
}

export const getWeatherAdvice = (
  temperature: number | null,
  humidity: number | null,
): WeatherAdvice => {
  if (temperature === null || humidity === null) {
    return { key: null, message: null }
  }

  if (temperature >= 24 && temperature <= 28 && humidity >= 60 && humidity <= 100) {
    return {
      key: 'rain',
      message:
        'It might rain today, remember to take an umbrella and close the windows if you are going out.',
    }
  }

  if (temperature >= 28 && humidity >= 50) {
    return {
      key: 'hot',
      message:
        'It is quite hot today, remember to stay hydrated and turn on the fan or AC if you are at home.',
    }
  }

  if (temperature <= 24 && humidity <= 50) {
    return {
      key: 'cold',
      message:
        'It is quite cold today, remember to wear warm clothes and turn on the heater if you are at home.',
    }
  }

  return { key: null, message: null }
}
