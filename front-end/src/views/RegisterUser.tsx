import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterUserView = () => {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [successFlag, setSuccessFlag] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>("");
    const navigate = useNavigate();

    const registerUser = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5002/api/auth/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });
            if (!response.ok) {
                const err = await response.json();
                setAlertMessage(err);
                setSuccessFlag(false);
                return;
            }
            const result = await response.json();
            console.log("register user data", result);
            setAlertMessage(result);
            setSuccessFlag(true);
            setName("");
            setEmail("");
            setPassword("");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" className="mx-auto h-10 w-auto" />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Register now and start chating</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={(e) => registerUser(e)}>
                        <div>
                            <label className="block text-sm/6 font-medium text-gray-100">Name</label>
                            <div className="mt-2">
                                <input id="name" type="name" name="name" required value={name} onChange={(e) => { setName(e.target.value) }} className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm/6 font-medium text-gray-100">Email address</label>
                            <div className="mt-2">
                                <input id="email" type="email" name="email" required value={email} onChange={(e) => { setEmail(e.target.value) }} className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm/6 font-medium text-gray-100">Password</label>
                            </div>
                            <div className="mt-2">
                                <input id="password" type="password" name="password" required value={password} onChange={(e) => { setPassword(e.target.value) }} className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Register Now</button>
                        </div>
                    </form>
                    {alertMessage && <>
                        <div className={successFlag ? "p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" : "p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"} role="alert">
                            <span className="font-medium">{successFlag ? "Success " : "User registration failed! "}</span>
                            <span className="font-medium">{alertMessage}</span>
                        </div></>}
                    <p className="mt-10 text-center text-sm/6 text-gray-400">
                        <a onClick={() => { navigate('/login'); }} className="font-semibold text-indigo-400 hover:text-indigo-300">Back to login</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterUserView;