import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AppContext } from "./context/AppContext.js";

import FirstPage from "./screens/FirstScreen.js";
import HomePage from "./screens/MainScreen.js";
import LoginScreen from "./screens/login/LoginScreen.js";
import FindIdOrPassword from "./screens/login/FindIdOrPassword.js";
import Signup from "./screens/login/Signup.js";
import Mypage from "./screens/MyPage.js";

import "./App.css";
import "./css/main/Header.css";
import "./css/main/Slider.css";
import "./css/main/TopRecommendation.css";
import "./css/main/FirstPage.css";
import { GoogleLogin, NaverLogin } from "./screens/login/SocialLogin.js";

// Layout 설정 컴포넌트
const Layout = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/mypage') {
            document.body.className = 'mypage-layout';
        } else {
            document.body.className = 'default-layout';
        }
    }, [location]);

    return children;
};

// 앱의 루트 컴포넌트
const App = () => {
    const [user, setUser] = useState(() => {
        // 초기 상태를 localStorage에서 가져옴
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [reviews, setReviews] = useState([]);

    // user 상태가 변경될 때마다 localStorage 업데이트
    useEffect(() => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [user]);

    // 좋아요 여부 확인 함수
    const isMovieLiked = (movieId) => {
        return user?.userLikeList?.some((movie) => movie.id === movieId);
    };

    // 좋아요 추가 함수
    const addLikeMovie = (movie) => {
        const updatedLikes = [...(user.userLikeList || []), movie];
        const updatedUser = { ...user, userLikeList: updatedLikes };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    };

    // 좋아요 제거 함수
    const removeLikeMovie = (movieId) => {
        const updatedLikes = user.userLikeList.filter((movie) => movie.id !== movieId);
        const updatedUser = { ...user, userLikeList: updatedLikes };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    };

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                reviews,
                setReviews,
                isMovieLiked,
                addLikeMovie,
                removeLikeMovie,
            }}
        >
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<FirstPage />} />
                        <Route path="/Home" element={<HomePage />} />
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/find" element={<FindIdOrPassword />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/mypage" element={<Mypage />} />
                        <Route path="/login/google" element = {<GoogleLogin/>}/>
                        <Route path="/login/naver" element = {<NaverLogin/>}/>
                    </Routes>
                </Layout>
            </Router>
        </AppContext.Provider>
    );
};

export default App;