import { useState, useEffect } from 'react';
import ContactsTab from '../components/ContactsTab';
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
  const [selectedContactData, setSelectedContactData] = useState<any>("");
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
        setData(result.payload);
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

  const receiveDataFromChild = (dataFromChild: any) => {
    console.log("receiveDataFromChild", dataFromChild);
    setSelectedContactData(dataFromChild);
  };
  useEffect(() => {
    console.log("SelectedContactData", selectedContactData)
  }, [selectedContactData])

  return (
    <div className="flex h-screen">
      <section >
        <ContactsTab sendData={receiveDataFromChild} />
      </section>

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
              <p className="font-medium">Contact Name</p>
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

    </div>
  );

};


export default ChatView;
