import React, {useState, useEffect} from "react";
import {GoogleGenerativeAI} from "@google/generative-ai";
import axios from "axios";
//const AIModel = 'gemini-1.5-flash'
//const AIModel = "gemini-2.0-flash";
const AIModel = "gemini-1.5-flash-8b";
const API_KEY_GOOGLE = import.meta.env.VITE_GOOGLE_API_KEY;
const API_KEY_THINGSPEAK = import.meta.env.VITE_THINGSPEAK_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY_GOOGLE);
const model = genAI.getGenerativeModel({model: AIModel});

const ChatBot = () => {
    const [DatosSensores, setDatosSensores] = useState();
    const [ChannelData, setChannelData] = useState();
    useEffect(() => {
        const fetchData = () => {
            axios
        .get(`https://api.thingspeak.com/channels/2736935/feeds.json?api_key=${API_KEY_THINGSPEAK}&results=1`)
        .then(({data}) => {
            console.log(data.channel);
            console.log(data.feeds[0]);
            setChannelData(data.channel);
            setDatosSensores(data.feeds[0]);
        })
        .catch((err) => console.log("error al obtener datos"));
        }
        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        const context =`
            Actúa como un experto en vida marina. Te proporcionaré datos sobre un lugar y algunas condiciones ambientales. Usando solo esa información, y basándote en tu conocimiento enciclopédico sobre cada especie marina, determina si una especie específica (que te indicaré) podría sobrevivir en ese entorno. Responde con un 'sí' 'probablemnte si' 'no' 'probablemente no', seguido de una breve explicación que justifique tu respuesta.
            Datos
            Temperatura: ${DatosSensores.field1} °C
            Humedad: ${DatosSensores.field2} %
            Temperatura del agua: ${DatosSensores.field3} °C
            Ubicación: ${DatosSensores.field5}, ${DatosSensores.field4}
            Está lloviendo: ${DatosSensores.field6 === "0" ? "no" : "sí"}
            Especie: te lo vaan a ddecir la gente que te pregunta
            Importante: La persona que te pregunta no tiene conocimientos sobre el ambiente marino, así que tu respuesta debe ser clara y concisa."
            
            Ejemplo de uso
            Ubicación (coordenadas): 3.42157, -76.49651
            Temperatura ambiente: 26.60°C
            Humedad: 46.50%
            Temperatura del agua: 25.56°C
            Está lloviendo: No
            Especie marina: Tiburón martillo

            \n` +
            messages.map((msg) => `Tú: ${msg.user}\nBot: ${msg.bot}`).join("\n");
        const prompt = `${context}\nTú: ${input}`;
        const result = await model.generateContent(prompt, {language: "es"});
        setMessages([...messages, {user: input, bot: result.response.text()}]);
        setInput("");
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <p>
                            <strong>Tú:</strong> {msg.user}
                        </p>
                        <p>
                            <strong>Bot:</strong> {msg.bot}
                        </p>
                    </div>
                ))}
            </div>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={sendMessage}>Enviar</button>
        </div>
    );
};

export default ChatBot;
