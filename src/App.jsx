import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./Pages/MainPage";
import SignIn from "./Pages/SignIn";

const App = () => {
  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
