import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const DATA_DIR = path.join(import.meta.dirname, 'data')
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR)
}

const WEATHER_FILE = path.join(DATA_DIR, 'weather.json')
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv')

export async function fetchWeather() {
    const apiKey = process.env.WEATHER_API_KEY
    const city = process.env.CITY
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Ankara&appid=ce45e9e6c3459e3017c31acabd3d4dc9&units=metric`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        const nowUTC = new Date().toISOString() // yyyy-mm-dd 2026-05-12
        data._last_updated_utc = nowUTC
        fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2))

        const header = 'timestamp,city,temperature,description\n'
        if (!fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, header)
        } else {
            const firstLine = fs.readFileSync(LOG_FILE, 'utf8').split('\n')[0]
            if (firstLine !== 'timestamp,city,temperature,description') {
                fs.writeFileSync(LOG_FILE, header + fs.readFileSync(LOG_FILE, 'utf8'))
            }
        }

        const logEntry = `${nowUTC},${city},${data.main.temp},${data.weather[0].description}\n`
        fs.appendFileSync(LOG_FILE, logEntry)

        console.log(`Weather data updated for ${city} at ${nowUTC}`)
    } catch (err) {
        console.error('Error fetching weather:', err)
    }
}

fetchWeather()
console.log(import.meta)
console.log(process.argv[0])
