// import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ChatView from './views/ChatView';
import ProfileProvider from './context/ProfileProvider';
import UserContactsProvider from './context/UserContactsProvider';
import "./globals.css";
import LoginView from './views/LoginView';
import RegisterUserView from './views/RegisterUser';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <BrowserRouter>
      <ProfileProvider>
        <UserContactsProvider>
          <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{
              top: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 3800,
              className: 'chatapp-toast',
              style: {
                background: '#111827',
                color: '#f9fafb',
                border: '1px solid #374151',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                padding: '14px 16px',
                borderRadius: '12px',
                maxWidth: '420px',
              },
              success: {
                className: 'chatapp-toast chatapp-toast-success',
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#ecfdf3',
                },
              },
              error: {
                className: 'chatapp-toast chatapp-toast-error',
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
            }}
          />
          <Routes>
            <Route path='/' element={
              <ProtectedRoute>
                <ChatView />
              </ProtectedRoute>
            } />
            <Route path='/login' element={<LoginView />} />
            <Route path='/register' element={<RegisterUserView />} />
          </Routes>
        </UserContactsProvider>
      </ProfileProvider>
    </BrowserRouter>
  )
}

export default App
