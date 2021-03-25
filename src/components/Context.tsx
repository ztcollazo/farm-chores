import * as React from 'react'
import getWeatherForecast from "../lib/weather";

export const WeatherContext = React.createContext(null)

interface IWeatherContextProps {
    apiKey: string,
    children: JSX.Element[]
}

const ContextProvider = ({ children, apiKey }: IWeatherContextProps): JSX.Element => {
    const [weather, setWeather] = React.useState({}); // eslint-disable-line @typescript-eslint/no-unused-vars

    const requestWeather = (lat: number, long: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        const res = getWeatherForecast({ lat, apiKey, long })
        setWeather(res);
    }

    return <>{children}</>;
}

export default ContextProvider
