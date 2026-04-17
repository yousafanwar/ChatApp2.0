import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import ContactsTab from '../components/ContactsTab';
import UseProfile from '../hooks/UseProfile';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PlusIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import socket from '../hooks/UseSocket';

interface Message {
  _id: string;
  sender: string;
  receiver: Array<string>;
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
  const [imageDialog, setimageDialog] = useState<boolean>(false);
  const [expandImageBlob, setExpandImageBlob] = useState<Blob | null>(null);
  const chatContainer = useRef<HTMLDivElement | null>(null);
  const profile = UseProfile();

  useEffect(() => {
    const userId = profile?.profile?._id;
    if (!userId) return;
    socket.emit('register', userId);
  }, [profile?.profile?._id]);

  useEffect(() => {
    if (!profile || !selectedContactData) return;
    if (!selectedContactData.groupId) {
      socket.emit('fetchChat', { sender: profile?.profile?._id, receiver: selectedContactData._id });
    } else {
      socket.emit('fetchChat', { sender: profile.profile?._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId || null });
    }
    const handleChatHistory = (chatHistory: Message[]) => {
      setData(chatHistory);
    };
    socket.on('chatHistory', handleChatHistory);
    return () => {
      socket.off('chatHistory', handleChatHistory);
    };

  }, [selectedContactData])

  useEffect(() => {
    const readNewMessage = (newMessage: any) => {
      console.log("new message", newMessage);

      setData((preState) => [...preState, newMessage]);
      chatContainer.current?.scrollIntoView({ behavior: 'smooth' });
    }
    socket.on('message', readNewMessage);
    setInputText("");
    return () => {
      socket.off('message');
    };
  }, []);

  const handleNewMessage = async () => {
    try {
      if (mediaBlob) {
        if (!selectedContactData.groupId) {
          socket.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData._id, text: mediaText, blob: mediaBlob, blobType: mediaBlob.type });
        } else {
          socket.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId, text: inputText, blob: mediaBlob, blobType: mediaBlob.type });
        }
        setmediaBlob(null);
      } else {
        if (!selectedContactData.groupId) {
          socket.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData._id, text: inputText });
        } else {
          socket.emit('message', { sender: profile?.profile?._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId, text: inputText });
        }
      }
      setInputText("");
      setMediaText("");
      setOpen(false);
    } catch (error) {
      console.log("Error while sending the new message: ", error);
    }
  };

  const receiveDataFromChild = useCallback((dataFromChild: any) => {
    setSelectedContactData(dataFromChild);
    setReceiverSrc(dataFromChild.avatar);
  }, []);

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

  const fetchAllGroupMembers = async () => {
    if (selectedContactData.groupId) {
      try {
        const response = await fetch(`/api/users/getAllGroupMembers/${profile.profile?._id}`, {
          headers: {
            authorization: `Bearer ${profile.profile?.token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          setMembers(result.payload);
          setGroupDialog(true);
        } else {
          toast.error(result.message || "Failed to load group members");
        }

      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while loading group members");
      }
    } else {
      return;
    }
  }

  const expandImage = (imageBlob: Blob) => {
    setExpandImageBlob(imageBlob);
    setimageDialog(true);
  };

  useEffect(() => {
    chatContainer.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContactData]);

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white md:flex">
        <aside className={`w-full md:w-[320px] ${selectedContactData ? 'hidden md:block' : 'block'}`}>
          <ContactsTab sendData={receiveDataFromChild} />
        </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        {!selectedContactData ? renderWelcomeMessage()
          :
          <section className="flex flex-col h-screen w-full">
            <div className="flex-none" onClick={fetchAllGroupMembers}>
              <div className="flex items-center gap-3 px-4 py-4 bg-slate-950 border-b border-slate-800">
                <button className="md:hidden p-2 rounded-full hover:bg-slate-800 transition" onClick={() => { setSelectedContactData(null) }}>
                  <ArrowLeftIcon className="h-5 w-5 text-white" />
                </button>
                <img
                  src={receiverSrc || "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"}
                  alt="Contact Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white truncate">{selectedContactData.name}</p>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
              {data && data.map((item, index) => {
                const isMine = item.sender === profile?.profile?._id;
                return (
                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`} key={index}>
                    <div className={`rounded-[20px] px-4 py-3 text-sm leading-6 ${isMine ? 'bg-sky-500/95 text-white' : 'bg-slate-800/95 text-slate-100'} max-w-[85%] md:max-w-[70%]`}>
                      {item.groupId && <p className="text-[11px] text-slate-400 mb-1">{item.senderName}</p>}
                      {item.blobType && item.blobType.includes("image") && (
                        <img
                          src={URL.createObjectURL(new Blob([item.blobFetchedFromDb]))}
                          onClick={() => expandImage(item.blobFetchedFromDb)}
                          className="mb-2 w-full max-w-full max-h-[280px] rounded-2xl object-contain cursor-pointer"
                          alt="message attachment"
                        />
                      )}
                      {item.blobType && item.blobType.includes("video") && (
                        <video className="mb-2 w-full max-w-full max-h-[280px] rounded-2xl" controls>
                          <source src={URL.createObjectURL(new Blob([item.blobFetchedFromDb]))} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <p className="whitespace-pre-wrap break-words">{item.text}</p>
                      <span className="block mt-2 text-[11px] text-slate-400">{handleTimeStamp(item.timeStamp)}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={chatContainer} />
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500"
                onChange={(e) => setInputText(e.target.value)}
                value={inputText}
              />
              <div className="flex items-center gap-2">
                <label className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 cursor-pointer transition">
                  <PlusIcon className="h-5 w-5 text-white" />
                  <input id="fileUpload" type="file" onChange={handleUpload} className="hidden" />
                </label>
                <button onClick={handleNewMessage} className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 hover:bg-sky-400 transition">
                  Send
                </button>
              </div>
            </div>
          </section>
        }
      </main>
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
            className="relative transform overflow-hidden rounded-3xl bg-slate-950 text-left shadow-2xl outline outline-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-slate-950 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-white">
                    Add Attachment
                  </DialogTitle>
                  <div className="mt-2">
                    {mediaBlob && mediaBlob.type.includes("image") && <img src={attachmentSrc} alt="attachment" className="w-full max-w-full rounded-2xl" />}
                    {mediaBlob && mediaBlob.type.includes("video") && (
                      <video className="w-full max-w-full rounded-2xl" controls>
                        <source src={attachmentSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <div className="mt-4 flex justify-center">
                      <input type="text" placeholder="Enter text" value={mediaText} onChange={(e) => { setMediaText(e.target.value) }} className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4 sm:px-6">
              <button onClick={handleNewMessage} className="w-full rounded-full bg-sky-500 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-sky-400 transition">
                Send
              </button>
            </div>
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
            className="relative transform overflow-hidden rounded-3xl bg-slate-950 text-left shadow-2xl outline outline-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-slate-950 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-white">
                    Group Members
                  </DialogTitle>
                  <div className="mt-2 text-slate-200">
                    {members && <p className="mb-2 text-slate-300">{members.groupAdmin.name}: Group Admin</p>}
                    {members && members.groupMembers.map((item) => (
                      <div key={item._id} className="text-slate-300">
                        {item.name}: Member
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    <Dialog open={imageDialog} onClose={setimageDialog} className="relative z-10">

      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-3xl bg-slate-950 text-left shadow-2xl outline outline-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-slate-950 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className='flex justify-end'>
                <XMarkIcon onClick={() => setimageDialog(false)} className="h-6 w-6 text-white cursor-pointer" />
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <div className="mt-2 text-slate-200">
                    {expandImageBlob && <img src={URL.createObjectURL(new Blob([expandImageBlob]))} className="w-full max-w-full rounded-3xl object-contain" alt="expanded attachment" />}
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    </>
  );
};

export default ChatView;
