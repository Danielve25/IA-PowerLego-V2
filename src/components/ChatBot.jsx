import React, {useState, useEffect} from "react";
import {GoogleGenerativeAI} from "@google/generative-ai";
import axios from "axios";
import {Temporal} from "temporal-polyfill";
import SendIcon from "./icons/Send";

const AIModel = "gemini-2.0-flash";
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
                setChannelData(data.channel);
                setDatosSensores(data.feeds[0]);
            })
            .catch((err) => console.log("error al obtener datos"));
        };
        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        const now = Temporal.Now.plainTimeISO();
        let hour = parseInt(now.hour);
        const minutes = now.minute.toString().padStart(2, "0");
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        const timestamp = `${hour}:${minutes} ${ampm}`;

        const context =
            `
            Actúa como un experto en vida marina. Te proporcionaré datos sobre un lugar y algunas condiciones ambientales. Usando solo esa información, y basándote en tu conocimiento enciclopédico sobre cada especie marina, determina si una especie específica (que te indicaré) podría sobrevivir en ese entorno. Responde con un 'sí' 'probablemente sí' 'no' 'probablemente no', seguido de una breve explicación que justifique tu respuesta.
            Datos
            Temperatura: ${DatosSensores?.field1} °C
            Humedad: ${DatosSensores?.field2} %
            Temperatura del agua: ${DatosSensores?.field3} °C
            Ubicación: ${DatosSensores?.field5}, ${DatosSensores?.field4}
            Está lloviendo: ${DatosSensores?.field6 === "0" ? "no" : "sí"}
            Importante: La persona que te pregunta no tiene conocimientos sobre el ambiente marino, así que tu respuesta debe ser clara y concisa
            
` +
            messages
            .map(
                (msg) => `Tú (${msg.timestamp}): ${msg.user}
Bot: ${msg.bot}`
            )
            .join("\n");

        const prompt = `${context}\nTú (${timestamp}): ${input}`;
        const result = await model.generateContent(prompt, {language: "es"});

        setMessages([...messages, {user: input, bot: result.response.text(), timestamp}]);
        setInput("");
    };

    return (
        <div className="ChatBot-container">
            <div className="chatBot">
                {messages.map((msg, index) => (
                    <div className="Tex" key={index}>
                        <p className="ME">
                            <strong>Tú: </strong> {msg.user} <br /><small>{msg.timestamp}</small>
                        </p>
                        <p className="IA">
                            <strong>Bot:</strong> {msg.bot} <br /><small>{msg.timestamp}</small>
                        </p>
                    </div>
                ))}
            </div>
            <div className={`Message-Area ${messages.length === 0 ? 'empty' : ''}`}>
                <input
                    type="text"
                    id="messageInput"
                    className="TextArea"
                    placeholder="Escribe tu mensaje"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="btn-Send" onClick={sendMessage} disabled={!input.trim()}>
                    Enviar
                </button>
            </div>
        </div>
    );
};

export default ChatBot;
