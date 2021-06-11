interface IWeatherForecastOptions {
    apiKey: string,
    lat: number,
    long: number,
}

export const getWeatherForecast = async ({ lat, long, apiKey }: IWeatherForecastOptions): Promise<any> => {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?appid=${apiKey}&lat=${lat}&lon=${long}`);
    const json = await res.json();
    return json;
}

export const kelvinToFahr = (kelvin: number): number => {
    return ((kelvin - 273.15) * 1.8) + 32;
}

export default {
    getWeatherForecast,
    kelvinToFahr
};
