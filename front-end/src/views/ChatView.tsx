import { useState, useEffect } from 'react';
import Card from "./CardView";

interface Message {
    sender: string;
    text: string;
    timeStamp: { type: Date };
}

const ChatView = () => {
    const [data, setData] = useState<Message[] | null>(null);
    const [inputText, setInputText] = useState<string>("");
    const [flag, setFlag] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getAllMessages`);
                const result: Message[] = await response.json();
                console.log("getAllMessages", result);
                setData(result);
                setUserData(localStorage.getItem("userName"));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [flag]);

    const handleText = async () => {
        const obj = {
            sender: localStorage.getItem("userName"),
            text: inputText
        };

        try {
            const response = await fetch(`http://localhost:5000/createMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj)
            });

            if (!response.ok) {
                console.log("Error while creating new record");
            }

            const result = await response.json();
            setFlag(!flag);
            setInputText("");
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="chat-container">
            <h1>Chat View</h1>

            <div className="message-list">
                {data && data.map((item, index) => (
                    <div
                        key={index}
                        className={`message-wrapper ${item.sender === userData ? "right" : "left"}`}
                    >
                        {item.text && (
                            <Card
                                sender={item.sender}
                                text={item.text}
                                timeStamp={item.timeStamp}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button onClick={handleText}>Send</button>
            </div>
        </div>
    );
};

export default ChatView;
