interface IWeatherForecastOptions {
    apiKey: string,
    lat: number,
    long: number
}

export const getWeatherForecast = ({ lat, long, apiKey }: IWeatherForecastOptions): Promise<ReadableStream<Uint8Array>> => {
    return fetch(`http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=${apiKey}&lat=${lat}&lon=${long}`).then(res => res.body);
}

export default getWeatherForecast;