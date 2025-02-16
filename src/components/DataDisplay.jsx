import {React, useEffect, useState} from "react";
import axios from "axios";
import TermoIcon from './icons/TermometroIcon'
import HumidityIcon from "./icons/HumidityIcon";
import CloudIcon from "./icons/CloudIcon";
import CloudIconRain from "./icons/CloudIconRain";
import WaterTemperatureIcon from "./icons/WaterTemperatureIcon";
const API_KEY_THINGSPEAK = import.meta.env.VITE_THINGSPEAK_API_KEY;
import MapIcon from "./icons/MapIcon";
const DataDisplay = () => {
    const [AllSensor, setAllSensor] = useState(null);
    const [ChannelData, setChannelData] = useState(null)
    useEffect(() => {
        const fetchData = () => {
            axios
            .get(`https://api.thingspeak.com/channels/2736935/feeds.json?api_key=${API_KEY_THINGSPEAK}&results=1`)
            .then(({data}) => {
                setAllSensor(data.feeds[0]);
                setChannelData(data.channel)
                console.log(data.channel)
                console.log(data.feeds[0]);
            })
            .catch((err) => console.log("error al obtener datos"));
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='Data-Display-Container'>
            {ChannelData &&(
                <div>
                    <h1>{ChannelData.name.split(/(?=[A-Z])/).join(' ')}</h1>
                    <h2>{ChannelData.description}</h2>
                </div>
            )}
            {AllSensor && (
                <ul>
                    <li><MapIcon fill="#007BFF" height={20}/> ubicacion: {`${AllSensor.field4}, ${AllSensor.field5}`}</li>
                    <li><TermoIcon height={30}/> temperatura: {parseFloat(AllSensor.field1).toFixed(2)}</li>
                    <li><HumidityIcon height={20}/> humedad: {parseFloat(AllSensor.field2).toFixed(2)}</li>
                    <li><WaterTemperatureIcon height={30} /> temperatura del agua: {parseFloat(AllSensor.field3).toFixed(2)}</li>
                    <li>{AllSensor.field6 === "0" ? <><CloudIcon/> esta lloviendo: no</> : <><CloudIconRain width={20}/> esta lloviendo: si</>}</li>
                </ul>
            )}
        </div>
    );
};

export default DataDisplay;
