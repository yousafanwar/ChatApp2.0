import { useState, useEffect } from 'react';
import ContactsTab from '../components/ContactsTab';
import UseProfile from '../hooks/UseProfile';
import { io } from "socket.io-client";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/solid';

interface Message {
  _id: string;
  sender: string;
  receiver: Array<string>; // To be used in the implementation of group chats
  text: string;
  timeStamp: { type: Date };
  blobFetchedFromDb: any;
  blobType: string;
  senderAvatar: any;
  groupId: string;
  senderName: string;
}

interface groupMembers {
  groupAdmin: { _id: string, name: string };
  groupMembers: { _id: string, name: string }[];
}

const ChatView = () => {
  const [data, setData] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [mediaText, setMediaText] = useState<string>("");
  const [selectedContactData, setSelectedContactData] = useState<any>("");
  const [receiverSrc, setReceiverSrc] = useState<string>("");
  const [attachmentSrc, setAttachmentSrc] = useState<any>(null);
  const [mediaBlob, setmediaBlob] = useState<any>(null); // to be sent to backend
  const [open, setOpen] = useState<boolean>(false);
  const [groupDialog, setGroupDialog] = useState<boolean>(false);
  const [members, setMembers] = useState<groupMembers | null>(null);
  const profile = UseProfile();

  const server = io("http://localhost:5000");

  useEffect(() => {
    if (!profile || !selectedContactData) return;
    if (!selectedContactData.groupId) {
      server.emit('fetchChat', { sender: profile?.profile?._id, receiver: selectedContactData._id });
    } else {
      server.emit('fetchChat', { sender: profile.profile?._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId });
    }
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

  const handleNewMessage = async () => {
    try {
      if (mediaBlob) {
        if (!selectedContactData.groupId) {
          server.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData._id, text: mediaText, blob: mediaBlob, blobType: mediaBlob.type });
        } else {
          server.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId, text: inputText, blob: mediaBlob, blobType: mediaBlob.type });
        }
        setmediaBlob(null);
      } else {
        if (!selectedContactData.groupId) {
          server.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData._id, text: inputText });
        } else {
          server.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId, text: inputText });
        }
      }
      setInputText("");
      setMediaText("");
      setOpen(false);
    } catch (error) {
      console.log("Error while sending the new message: ", error);
    }

  };

  const receiveDataFromChild = (dataFromChild: any) => {
    setSelectedContactData(dataFromChild);
    setReceiverSrc(dataFromChild.avatar);
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
  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      setmediaBlob(blob);

      const url = URL.createObjectURL(blob);
      setAttachmentSrc(url);
    }
    reader.readAsArrayBuffer(file);
    setOpen(true);
  }

  const handleTimeStamp = (e: any) => {
    let formated = new Date(e).toLocaleString();;
    return formated;
  }

  const fetchSecondUser = async (userId: string) => {
    try {
      if (userId) {
        const response = await fetch(`http://localhost:5001/api/users/getIndividualUser/${userId}`)
        const result = await response.json();
        setReceiverSrc(result);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }
  useEffect(() => {
    if (!selectedContactData.adminId) {
      fetchSecondUser(selectedContactData._id);
    }

  }, [selectedContactData])

  const fetchAllGroupMembers = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/getAllGroupMembers/${profile.profile?._id}`);

      if (!response.ok) {
        throw new Error("Error while creating new group");
      } else {
        const result = await response.json();
        setMembers(result.payload);
        setGroupDialog(true);
      }

    } catch (error) {
      console.error("Error", error);
    }
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

            <div className="flex-1" onClick={fetchAllGroupMembers}>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
                <img
                  src={receiverSrc || "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="font-medium" style={{ color: "white" }}>{selectedContactData.name}</p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto">
              {data && data.map((item, index) => {
                return <div className="flex-1 p-4 space-y-3" key={index}>
                  <div className={item.sender === profile?.profile?._id ? "flex justify-end" : "flex justify-start"}>
                    <div className={item.sender === profile?.profile?._id ? "bg-green-600 px-4 py-2 rounded-lg max-w-xs" : "bg-gray-800 px-4 py-2 rounded-lg max-w-xs"}>
                      {item.blobType && item.blobType.includes("image") && <img src={URL.createObjectURL(new Blob([item.blobFetchedFromDb]))} />}
                      {item.blobType && item.blobType.includes("video") && <video width="320" height="240" controls style={{ borderRadius: "5px" }}>
                        <source src={URL.createObjectURL(new Blob([item.blobFetchedFromDb]))} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>}

                      {item.groupId && <p style={{ color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`, fontWeight: "bold", fontSize: "10px" }}>{item.senderName}</p>}
                      <p style={{ color: "white" }}>{item.text}</p>
                      <span className="bottom-1 right-2 text-[10px] text-gray-300">{handleTimeStamp(item.timeStamp)}</span>
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
              <label htmlFor="fileUpload" style={{ color: "white", margin: "1px", cursor: "pointer", height: "25px", width: "25px" }}>
                <PlusIcon />
                <input id="fileUpload" type="file" onChange={(e) => { handleUpload(e) }} style={{ display: "none" }} />
              </label>
              <button onClick={handleNewMessage} className="bg-green-600 hover:bg-green-500 rounded-full px-4 py-2 text-sm font-medium">
                Send
              </button>
            </div>
          </div>
          <Dialog open={open} onClose={setOpen} className="relative z-10">
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                  transition
                  className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                >
                  <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <DialogTitle as="h3" className="text-base font-semibold text-white">
                          Add Attachment
                        </DialogTitle>
                        <div className="mt-2">
                          {mediaBlob && mediaBlob.type.includes("image") && <img src={attachmentSrc} alt="attachment" style={{ width: "500px", height: "auto" }} />}
                          {mediaBlob && mediaBlob.type.includes("video") && <video width="320" height="240" controls style={{ borderRadius: "5px" }}>
                            <source src={attachmentSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>}
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <input type="text" placeholder="Enter text" value={mediaText} onChange={(e) => { setMediaText(e.target.value) }} className="bg-green-600 hover:bg-green-500 rounded-full px-4 py-2 text-sm font-medium" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleNewMessage} className="bg-green-600 hover:bg-green-500 rounded-full px-4 py-2 text-sm font-medium">
                    Send
                  </button>
                </DialogPanel>
              </div>
            </div>
          </Dialog>
          <Dialog open={groupDialog} onClose={setGroupDialog} className="relative z-10">
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                  transition
                  className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                >
                  <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <DialogTitle as="h3" className="text-base font-semibold text-white">
                          Group Members
                        </DialogTitle>
                        <div className="mt-2" style={{ color: "white" }}>
                          {members && <p>{members.groupAdmin.name}: Group Admin</p>}
                          {members && members.groupMembers.map((item) => {
                            return <>
                              <ul style={{ listStyle: "none" }}>
                                <li>{item.name}: Member</li>
                              </ul>
                            </>
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </Dialog>
        </section>
      }
    </div>
  );

};


export default ChatView;
