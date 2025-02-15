import React, {useState, useEffect} from "react";
import {GoogleGenerativeAI} from "@google/generative-ai";
import axios from "axios";
const API_KEY_GOOGLE = import.meta.env.VITE_GOOGLE_API_KEY;
const API_KEY_THINGSPEAK = import.meta.env.VITE_THINGSPEAK_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY_GOOGLE);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

const ChatBot = () => {
    const [DatosSensores, setDatosSensores] = useState()
    const [ChannelData, setChannelData] = useState()
    useEffect(() => {
        axios.get(`https://api.thingspeak.com/channels/2736935/feeds.json?api_key=${API_KEY_THINGSPEAK}&results=1`)
            .then(({ data }) => {
                console.log(data.channel);
                console.log(data.feeds[0]);
                setChannelData(data.channel)
                setDatosSensores(data.feeds[0]);
            })
            .catch((err) => console.log("error al obtener datos"));
    }, []);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        const context =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n" +
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
