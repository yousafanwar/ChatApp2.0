import { useState, useEffect } from 'react';
import Card from "./CardView";
import UseProfile from '../hooks/UseProfile';

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
    const profile = UseProfile();

    useEffect(() => {
        const fetchData = async () => {
            console.log(profile?.profile?._id);
            const obj = {
                sender: profile?.profile?._id,
                receiver: "68869977463cce0c1afdb378",
            };
            try {
                const response = await fetch(`http://localhost:5000/api/chats/getAllMessages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(obj)
                });
                const result = await response.json();
                console.log("getAllMessages", result);
                setData(result.payload);
                setUserData(profile?.profile?.name);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [profile.profile, flag]);

    const handleText = async () => {
        console.log(profile?.profile?._id);
        if (profile) {
            const obj = {
                sender: profile?.profile?._id,
                receiver: "68869977463cce0c1afdb378",
                text: inputText
            };

            try {
                const response = await fetch(`http://localhost:5000/api/chats/createNewMessage`, {
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
            {profile?.profile?.name && <h1>Hi {profile?.profile?.name}</h1>}
        </div>
    );
};

export default ChatView;
