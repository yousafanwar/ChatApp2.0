import { useState, useEffect } from 'react';
import UseProfile from '../hooks/UseProfile';
import UserContacts from '../hooks/UserContacts';

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
    const myContactIds = myContactList.map((item) => {
      return item._id;
    })

    const filteredResult = unfilteredContacts.filter((item) => {
      return !myContactIds.includes(item._id);
    })

    setContacts(filteredResult);
  }, [myContactList, unfilteredContacts]);

  const getContacts = async () => {

    if (userData.profile && userData.profile.token)
      try {
        const response = await fetch(`http://localhost:5001/api/users/getAllUsers/${userData.profile._id}`, {
          headers: {
            authorization: `Bearer ${userData.profile.token}`
          }
        });
        const result: IContact[] = await response.json();
        setUnfilteredContacts(result);

      } catch (error) {
        console.error(error);
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
      const response = await fetch("http://localhost:5001/api/users/addToMyContactList", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${userData.profile?.token}`
        },
        body: JSON.stringify(obj)
      });
      if (!response.ok) {
        console.log("Error while updating contact list");
      }
      setMyContactList((prevStat) => { return [...prevStat, e] });
      setRenderAllUsers(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="w-80 bg-gray-900 border-r border-gray-800 h-screen flex flex-col">
        <ul className="flex-1 overflow-y-auto">
          {renderAllUsers && contacts && contacts.map((ele) => {
            return <li
              key={ele._id}
              className="flex items-center gap-4 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
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
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleAllContacts}
            className="w-full py-2 text-white bg-red-600 hover:bg-red-700 transition-colors rounded">
            View All Contacts
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {myContactList && myContactList.map((ele) => (
            <li
              key={ele._id}
              className="flex items-center gap-4 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
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
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogOut}
            className="w-full py-2 text-white bg-red-600 hover:bg-red-700 transition-colors rounded">
            LOGOUT
          </button>
        </div>
      </div>
    </>
  )
};

export default ContactsTab;