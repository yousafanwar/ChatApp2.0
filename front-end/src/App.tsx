// import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ChatView from './views/ChatView';
import ProfileProvider from './context/ProfileProvider';
import UserContactsProvider from './context/UserContactsProvider';
import "./globals.css";
import LoginView from './views/LoginView';
import RegisterUserView from './views/RegisterUser';

function App() {

  return (
    <BrowserRouter>
      <ProfileProvider>
        <UserContactsProvider>
          <Routes>
            <Route path='/' element={<ChatView />} />
            <Route path='/login' element={<LoginView />} />
            <Route path='/register' element={<RegisterUserView />} />
          </Routes>
        </UserContactsProvider>
      </ProfileProvider>
    </BrowserRouter>
  )
}

export default App
