import { useState, useEffect } from "react";
import UseProfile from "../hooks/UseProfile";

// interface UserData {
//     name: string,
//     avatar: string
// }

const ProfileView = () => {

  const [name, setName] = useState<string | undefined>("");
  const [email, setEmail] = useState<string | undefined>("");
  const [src, setSrc] = useState<any>(null);
  // const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const userData = UseProfile();


  useEffect(() => {

    if (userData) {
      setName(userData.profile?.name);
      setSrc(userData.profile?.avatar);
      setEmail(userData.profile?.email);
      // setDataObj({
      //     name: userData.profile?.name,
      //     avatar: userData.profile?.avatar
      // })

    }

  }, [])

  const handleImageUpload = (e: any) => {

    const reader = new FileReader();

    const files = e.target.files[0];

    reader.readAsDataURL(files);

    reader.onload = () => {
      console.log("reader.result", reader.result);
      setSrc(reader.result);
    }

  }

  const updateUser = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/updateUser/${userData.profile?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar: src,
          name,
          email
        })
      })

      if (!response.ok) {
        console.log("User update failed");
      }
      const result = await response.json();
      console.log(result);
      if (result.modifiedCount > 0) {
        // setSuccessMessage(true);
        console.log("modified successfully");
        getUpdatedUser();
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  const getUpdatedUser = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/getIndividualUser/${userData.profile?._id}`);
      const result = await response.json();
      userData.setProfile(result);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-full mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Your Profile</h2>

      <div className="relative">
        <label htmlFor="fileSelector" className="cursor-pointer">
          <img alt="User avatar" src={src || "0684456b-aa2b-4631-86f7-93ceaf33303c.jpg"} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 hover:opacity-80 transition" />
        </label>
        <input id="fileSelector" type="file" className="hidden" onChange={handleImageUpload} />
      </div>

      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />

      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />

      <button onClick={updateUser} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
        Update
      </button>
    </div>
  );

};

export default ProfileView;