import {React, useEffect, useState} from "react";
import axios from "axios";
const API_KEY_THINGSPEAK = import.meta.env.VITE_THINGSPEAK_API_KEY;

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
                    <li>ubicacion: {`${AllSensor.field4}, ${AllSensor.field5}`}</li>
                    <li>temperatura: {parseFloat(AllSensor.field1).toFixed(2)}</li>
                    <li>humedad: {parseFloat(AllSensor.field2).toFixed(2)}</li>
                    <li>temperatura del aguaa: {parseFloat(AllSensor.field3).toFixed(2)}</li>
                    <li>esta lloviendo: {AllSensor.field6 === "0" ? "no" : "sí"}</li>
                </ul>
            )}
        </div>
    );
};

export default DataDisplay;
