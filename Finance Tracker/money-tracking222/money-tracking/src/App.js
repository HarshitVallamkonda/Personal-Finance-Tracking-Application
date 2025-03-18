import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/auth/SignIn";
import Register from "./components/auth/Register";

import Home from "./page/home"; // Import Home

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/register" element={<Register />} />


        {/* Dashboard Routes */}
        <Route path="/dashboard/*" element={<Home />} /> {/* ✅ Fix: Keep `/*` for nested routes */}
      </Routes>
    </Router>
  );
}

export default App;
