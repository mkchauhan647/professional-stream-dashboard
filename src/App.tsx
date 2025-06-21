import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StreamProvider } from './context/StreamContext';
import { ToastContainer } from 'react-toastify';
import { HomePage } from './pages/HomePage';
import { RestreamPage } from './pages/RestreamPage';
import { Nav } from './components/Nav';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <StreamProvider>
        <div className="min-h-screen bg-gray-900 text-white">
          <Nav />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restream" element={<RestreamPage />} />
          </Routes>
        </div>
      <ToastContainer
        theme="dark"
        position="bottom-center"
        autoClose={4000}
        hideProgressBar={false}
      />
    </StreamProvider>
  );
}

export default App;
