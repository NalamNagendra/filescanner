import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <h1 className="logo">
                <Link to="/">
                  <span style={{ color: 'var(--primary-color)' }}>Cyber</span>
                  <span style={{ color: 'var(--dark-bg)' }}>Net</span>
                </Link>
              </h1>
              <nav className="main-nav">
                <Link to="/" className="nav-link active">
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                    <FileList key={refreshKey} />
                  </>
                }
              />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p> {new Date().getFullYear()} CyberNet - Secure File Scanning</p>
          </div>
        </footer>

        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

const globalStyles = `
  :root {
    --primary-color: #4a6fa5;
    --secondary-color: #6b8cae;
    --success-color: #4caf50;
    --danger-color: #f44336;
    --warning-color: #ff9800;
    --light-bg: #f0f8ff;
    --dark-bg: #2c3e50;
    --text-color: #333;
    --text-light: #666;
    --white: #fff;
    --border-color: #e0e0e0;
    --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--light-bg);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .app-header {
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 15px 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 24px;
    font-weight: 700;
  }

  .logo a {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .main-nav {
    display: flex;
    gap: 20px;
  }

  .nav-link {
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .nav-link:hover, .nav-link.active {
    background-color: var(--primary-color);
    color: white;
  }

  .main-content {
    flex: 1;
    padding: 30px 0;
  }

  .content-box {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }

  .app-footer {
    background-color: var(--dark-bg);
    color: var(--white);
    padding: 20px 0;
    text-align: center;
    font-size: 14px;
  }
`;

const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

export default App;
