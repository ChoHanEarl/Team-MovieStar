import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppContext } from "./context/AppContext.js";

import FirstPage from "./screens/FirstScreen.js";
import HomePage from "./screens/MainScreen.js";
import LoginScreen from "./screens/login/LoginScreen.js";
import FindId from "./screens/login/FindId.js";
import FindPassword from "./screens/login/FindPassword.js";
import Signup from "./screens/login/Signup.js"
import MyInfoPage from "./screens/MyInfoScreen.js";

import "./App.css";
import "./css/main/Header.css"
import "./css/main/Slider.css"
import "./css/main/TopRecommendation.css"
import "./css/main/FirstPage.css"


// 앱의 루트 컴포넌트 - 라우터 설정
const App = () => {
  const [user, setUser] = useState(null)

  return (
    <AppContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* 기본 경로는 홈페이지 */}
          <Route path="/" element={<FirstPage />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/find-id" element={<FindId />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/myinfo" element={<MyInfoPage />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;