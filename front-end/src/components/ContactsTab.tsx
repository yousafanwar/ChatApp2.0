import React from "react";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import UseProfile from '../hooks/UseProfile';
import { apiUrl } from '../config/apiBase';
import UserContacts from '../hooks/UserContacts';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import ProfileView from '../views/ProfileView';

interface IContact {
  _id: string,
  name: string,
  email: string,
  avatar: string,
  members?: Array<string>,
  adminId?: string
}

const ContactsTab = (props: any) => {

  const userData = UseProfile();
  const usersMyContacts = UserContacts();
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [unfilteredContacts, setUnfilteredContacts] = useState<IContact[]>([]);
  const [myContactList, setMyContactList] = useState<IContact[]>([]);
  const [renderAllUsers, setRenderAllUsers] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedGroupItem, setSelectedGroupItem] = useState<any[]>([]);
  const [groupCreationSuccess, setGroupCreationSuccess] = useState<boolean>(false);
  const [openGroupDialog, setOpenGroupDialog] = useState<boolean>(false);

  useEffect(() => {
    if (usersMyContacts) {
      setMyContactList(usersMyContacts);
    }
  }, [usersMyContacts])

  const handleAllContacts = () => {
    let renderUsersFlag = !renderAllUsers;
    setRenderAllUsers(renderUsersFlag);
    if (renderUsersFlag && contacts.length < 1) {
      getContacts();
    }
  };

  useEffect(() => {   // refreshs the contacts list whenever a new ccontact is added in my contacts
    if (userData.profile && userData.profile.token) {
      const myContactIds = myContactList.map((item) => {
        return item._id;
      })

      const filteredResult = unfilteredContacts.filter((item) => {
        return !myContactIds.includes(item._id);
      })

      setContacts(filteredResult);
    }
  }, [myContactList, unfilteredContacts]);

  const getContacts = async () => {

    if (userData.profile && userData.profile.token)
      try {
        const response = await fetch(apiUrl(`/user/getAllUsers/${userData.profile._id}`), {
          headers: {
            authorization: `Bearer ${userData.profile.token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setUnfilteredContacts(result.payload);
        } else {
          toast.error(result.message || "Failed to load contacts");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while loading contacts");
      }
  };

  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  }

  const handleContactClick = async (e: any) => {
    const obj = {
      loggedInUserId: userData.profile?._id,
      _id: e._id,
    }
    try {
      const response = await fetch(apiUrl("/user/addToMyContactList"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${userData.profile?.token}`
        },
        body: JSON.stringify(obj)
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Contact added successfully");
        setMyContactList((prevStat) => { return [...prevStat, e] });
        setRenderAllUsers(false);
      } else {
        toast.error(result.message || "Failed to add contact");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while adding contact");
    }
  };

  const handleGroup = async () => {

    const groupObj = {
      name: groupName,
      members: selectedGroupItem,
      adminId: userData.profile?._id
    }

    try {
      const response = await fetch(apiUrl("/user/createGroup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userData.profile?.token}`
        },
        body: JSON.stringify(groupObj)
      })
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Group created successfully");
        setGroupCreationSuccess(true);
        setOpenGroupDialog(false);
        // Maybe refresh groups
      } else {
        toast.error(result.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error", error);
      toast.error("An error occurred while creating group");
    }
  }

  const closeGroupDialog = () => {
    setOpenGroupDialog(false);
  }

  return (
    <>
      <div className="w-full bg-[#0f172a] border-r border-slate-800 h-screen flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Chats</p>
              <p className="text-sm text-slate-400">Dark mode messaging</p>
            </div>
            <button
              onClick={handleAllContacts}
              className="rounded-full bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition"
            >
              {renderAllUsers ? 'Hide users' : 'All users'}
            </button>
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto space-y-1 px-2 py-3">
          {renderAllUsers && contacts && contacts.map((ele) => {
            return <li
              key={ele._id}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
              style={{ cursor: "pointer" }}
              onClick={() => handleContactClick(ele)}
            >
              <img
                src={ele.avatar || "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium truncate">{ele.name}</p>
                  <span className="text-xs text-gray-400">3h ago</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{ele.email}</p>
              </div>
            </li>
          })}
        </ul>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleAllContacts}
            className="w-full py-2 text-slate-950 bg-sky-500 hover:bg-sky-400 transition-colors rounded">
            View All Contacts
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto space-y-1 px-2 py-3">
          {myContactList && myContactList.map((ele) => (
            <li
              key={ele._id}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => { props.sendData(ele) }}
            >
              <img
                src={ele.avatar || "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium truncate">{ele.name}</p>
                  <span className="text-xs text-gray-400">3h ago</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{ele.email}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-3 border-t border-slate-800 space-y-3">
          {userData && <>
            <div className="flex items-center gap-3">
              <img src={userData.profile?.avatar || "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"} alt='user profile picture' className="w-12 h-12 rounded-full object-cover" onClick={() => { setOpen(true) }} style={{ cursor: "pointer" }} />
              <p className="text-white">Hi {userData.profile?.name}</p>
            </div>
          </>}
          <button onClick={() => { setOpenGroupDialog(true) }}
            className="w-full py-2 text-slate-950 bg-sky-500 hover:bg-sky-400 transition-colors rounded"
            style={{ cursor: "pointer" }}>
            Create a new Group
          </button>
          <button
            onClick={handleLogOut}
            style={{ cursor: "pointer" }}
            className="w-full py-2 text-white bg-slate-700 hover:bg-slate-600 transition-colors rounded">
            LOGOUT
          </button>
        </div>
      </div>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <ProfileView />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <Dialog open={openGroupDialog} onClose={closeGroupDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg space-y-4">
            <DialogTitle className="text-lg font-semibold">
              Create New Group
            </DialogTitle>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
            />
            <h2 className="text-md font-medium">Add members</h2>
            <div className="w-full max-h-60 overflow-y-auto divide-y divide-gray-200 border rounded-lg">
              {myContactList && Array.isArray(myContactList) && myContactList.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedGroupItem((prevState: any) => selectedGroupItem.includes(item._id) ? selectedGroupItem.filter((i: any) => { return i !== item._id }) : [...prevState, item._id])}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.avatar ? item.avatar.toString() : "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"}
                      alt="user avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span>{item.name}</span>
                  </div>
                  {selectedGroupItem.includes(item._id) && (
                    <span className="text-green-600 font-bold">✔</span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleGroup}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Create Group
            </button>
            {groupCreationSuccess && (
              <div className="w-full bg-green-100 text-green-700 p-3 rounded-lg flex flex-col items-center space-y-2">
                <p>Group created successfully 🎉</p>
                <button
                  onClick={closeGroupDialog}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Continue
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
};

export default React.memo(ContactsTab);