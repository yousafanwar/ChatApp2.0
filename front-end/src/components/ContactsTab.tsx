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

const ContactsTab = () => {

  const userData = UseProfile();
  const usersMyContacts = UserContacts();
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [myContactList, setMyContactList] = useState<IContact[]>([]);

  useEffect(() => {

    const getContacts = async () => {

      if (usersMyContacts) {
        setMyContactList(usersMyContacts);
      }

      if (userData.profile && userData.profile.token)
        try {
          const response = await fetch(`http://localhost:5001/api/users/getMyContacts/${userData.profile._id}`, {
            headers: {
              authorization: `Bearer ${userData.profile.token}`
            }
          });
          const result: IContact[] = await response.json();

          const myContactIds = myContactList.map((item) => {
            return item._id;
          })

          const filteredResult = result.filter((item) => {
            return !myContactIds.includes(item._id);
          })

          setContacts(filteredResult);


        } catch (error) {
          console.error(error);
        }
    };

    getContacts();
  }, []);

  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  }

  return (
    <>
      <div className="w-80 bg-gray-900 border-r border-gray-800 h-screen flex flex-col">
        <ul className="flex-1 overflow-y-auto">
          {contacts && contacts.map((ele) => (
            <li
              key={ele._id}
              className="flex items-center gap-4 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
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