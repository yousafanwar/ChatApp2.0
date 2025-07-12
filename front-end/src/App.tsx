import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ChatView from './views/ChatView';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ChatView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
