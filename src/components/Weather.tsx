import * as React from "react";
import Card from "./Card";
import { useAsyncFn } from "react-use";
import { getWeatherForecast, kelvinToFahr } from "../lib/weather";

const getDayOfWeekFromNum = (day: number) => {
    if (day === 0) {
        return "Sunday";
    } else if (day === 1) {
        return "Monday";
    } else if (day === 2) {
        return "Tuesday";
    } else if (day === 3) {
        return "Wednesday";
    } else if (day === 4) {
        return "Thursday";
    } else if (day === 5) {
        return "Friday";
    } else if (day === 6) {
        return "Saturday";
    } else {
        return "No Such day";
    }
}

const addLoop = (num1: number, num2: number, loop: number): number => {
    let added: number = num1 + num2;
    while (added >= loop) {
        added -= loop;
    }
    return added;
}

const Weather: React.FC = () => {
    const [state, get] = useAsyncFn(getWeatherForecast);
    const today: number = new Date().getDay();

    React.useEffect(() => {
        get({ lat: 37.287537, long: -77.5504773, apiKey: process.env.WEATHER_API_KEY });
    }, []);
    console.log(state.value);

    if (!state.value || state.error || state.value.message || state.value.code) {
        return (
            <Card style={{height: 120}}>
                <span className="bg-red-500 my-auto rounded-xl m-4 p-4 w-full max-h-16 h-16 text-gray-500">
                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 24 24" width="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/></svg>
                    <p className="py-1.5 font-extralight">Error fetching weather.</p>
                </span>
            </Card>
        );
    }

    return (
        <Card style={{height: 120}}>
            <img src={`https://openweathermap.org/img/wn/${state.value.daily[0].weather[0].icon}@2x.png`} alt="Weather image" />
            <div className="flex flex-col">
                <h1 className="text-5xl font-extralight text-white opacity-60">{Math.round(kelvinToFahr(state.value.daily[0].temp.max))}°</h1>
                <h1 className="text-3xl font-extralight text-white opacity-60">{Math.round(kelvinToFahr(state.value.daily[0].temp.min))}°</h1>
            </div>
            <div className="flex flex-row right-4 absolute">
                {
                    state.value.daily.slice(1).map((temp: Record<string, any>, i: number) => (
                        <div key={i} className="flex flex-col mx-3">
                            <h1 className="font-extralight text-2xl text-white opacity-60">{getDayOfWeekFromNum(addLoop(today, i, 7))}</h1>
                            <div className="flex flex-row">
                                <img className="w-16 h-16" src={`https://openweathermap.org/img/wn/${temp.weather[0].icon}@2x.png`} alt="Weather image" />
                                <div className="flex flex-col">
                                    <h1 className="font-extralight text-2xl text-white opacity-60">{Math.round(kelvinToFahr(temp.temp.max))}°</h1>
                                    <h1 className="font-extralight text-xl text-white opacity-60">{Math.round(kelvinToFahr(temp.temp.min))}°</h1>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </Card>
    );
}

export default Weather;
