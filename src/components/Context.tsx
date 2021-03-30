import * as React from 'react'
import getWeatherForecast from "../lib/weather";

export const WeatherContext = React.createContext({})

interface IWeatherContextProps {
    apiKey: string,
    children: JSX.Element[],
    id: number
}

const ContextProvider = ({ children, apiKey, id }: IWeatherContextProps): JSX.Element => {
    const [weather, setWeather] = React.useState({}); // eslint-disable-line @typescript-eslint/no-unused-vars

    const requestWeather = (lat: number, long: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        const res = getWeatherForecast({ lat, apiKey, long, id })
        setWeather(res);
    }

    return <WeatherContext.Provider value={{weather, setWeather}} >{children}</WeatherContext.Provider>;
}

export default ContextProvider
