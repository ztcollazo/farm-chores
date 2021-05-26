import * as React from "react";
import Card from "./Card";
// import { useAsyncFn, useGeolocation } from "react-use";
// import { getWeatherForecast, kelvinToFahr } from "../lib/weather";

const Weather: React.FC = () => {
    // const { latitude: lat, longitude: long } = useGeolocation();
    // const [weather, setWeather] = React.useState(null);
    // const [state, get] = useAsyncFn(getWeatherForecast)

    // setWeather(get({ lat, long, apiKey: process.env.WEATHER_API_KEY }));
    // console.log(weather);

    return (
        <Card>
            <img src={`https://openweathermap.org/img/wn/04d@2x.png`} alt="Weather image" />
            <div className="flex flex-col">
                <h1 className="text-5xl font-extralight text-white text-opacity-30">{70}°</h1>
                <h1 className="text-3xl font-extralight text-white text-opacity-30">{45}°</h1>
            </div>
            <div className="flex flex-row right-4 absolute">
                {
                    new Array(6).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col mx-3">
                            <h1 className="font-extralight text-2xl text-white text-opacity-30">Some Day</h1>
                            <div className="flex flex-row">
                                <img className="w-16 h-16" src={`https://openweathermap.org/img/wn/04d@2x.png`} alt="Weather image" />
                                <div className="flex flex-col">
                                    <h1 className="font-extralight text-2xl text-white text-opacity-30">{68}°</h1>
                                    <h1 className="font-extralight text-xl text-white text-opacity-30">{34}°</h1>
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
