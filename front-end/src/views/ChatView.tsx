import { useState, useEffect } from 'react';
import ContactsTab from '../components/ContactsTab';
import UseProfile from '../hooks/UseProfile';
import { io } from "socket.io-client";

interface Message {
  sender: string;
  text: string;
  timeStamp: { type: Date };
}

const ChatView = () => {
  const [data, setData] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedContactData, setSelectedContactData] = useState<any>("");
  const profile = UseProfile();

  const server = io("http://localhost:5000");

  useEffect(() => {
    if (!profile || !selectedContactData) return;
    server.emit('fetchChat', { sender: profile?.profile?._id, receiver: selectedContactData._id });
    console.log("fetchChat has been triggered");
    const handleChatHistory = (chatHistory: Message[]) => {
      setData(chatHistory);
    };
    server.on('chatHistory', handleChatHistory);
    return () => {
      server.off('chatHistory', handleChatHistory);
    };

  }, [selectedContactData])

  useEffect(() => {
    const readNewMessage = (newMessage: any) => {
      console.log("new message", newMessage);

      setData((preState) => [...preState, newMessage]);
    }
    server.on('message', readNewMessage);
    setInputText("");
    return () => {
      server.off('message');
    };
  }, []);

  const handleText = async () => {
    server.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData._id, text: inputText });
    setInputText("");
  };

  const receiveDataFromChild = (dataFromChild: any) => {
    console.log("receiveDataFromChild", dataFromChild);
    setSelectedContactData(dataFromChild);
  };

  const renderWelcomeMessage = () => {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-800 text-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to the ChatApp
          </h1>
          <p className="text-lg text-gray-300">
            Select a contact to see your chats
          </p>
        </div>
      </div>

    )
  }

  return (
    <div className="flex h-screen">
      <section >
        <ContactsTab sendData={receiveDataFromChild} />
      </section>

      {!selectedContactData ? renderWelcomeMessage()
        :

        <section>
          <div className="flex flex-col h-screen w-300">
            {/* Chat Header */}

            <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium" style={{ color: "white" }}>{selectedContactData.name}</p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto">
              {data && data.map((item, index) => {
                return <div className="flex-1 p-4 space-y-3">
                  <div className={item.sender === profile?.profile?._id ? "flex justify-end" : "flex justify-start"}>
                    <div className={item.sender === profile?.profile?._id ? "bg-green-600 px-4 py-2 rounded-lg max-w-xs" : "bg-gray-800 px-4 py-2 rounded-lg max-w-xs"}>
                      <p style={{ color: "white" }}>{item.text}</p>
                      <span className="text-xs text-gray-400 block text-right">{index}</span>
                    </div>
                  </div>
                </div>
              })}
            </div>
            {/* Message Input */}
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex gap-3">
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 bg-gray-800 rounded-full px-4 py-2 outline-none text-sm text-white"
                onChange={(e) => setInputText(e.target.value)}
                value={inputText}
              />
              <button onClick={handleText} className="bg-green-600 hover:bg-green-500 rounded-full px-4 py-2 text-sm font-medium">
                Send
              </button>
            </div>
          </div>
        </section>
      }
    </div>
  );

};


export default ChatView;
