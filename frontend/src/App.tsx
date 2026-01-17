import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App App-header">
          <h1 className="text-3xl font-bold text-primary-600">
            Words of Praise app
          </h1>
          <p className="text-gray-600 mt-4">Coming Soon</p>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
