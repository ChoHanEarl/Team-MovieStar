// MainScreen에서 로그인 여부에 따라 버튼을 로그인 <-> 로그아웃
// 이를 위해 Context 활용
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [user, setUser] = useState({
        userLikeList: [], // 초기 좋아요 목록
    });

    // 좋아요 여부 확인 함수
    const isMovieLiked = (movieId) => {
        return user?.userLikeList?.some((movie) => movie.id === movieId);
    };

    // 좋아요 추가 함수
    const addLikeMovie = (movie) => {
        const updatedLikes = [...(user.userLikeList || []), movie];
        setUser({ ...user, userLikeList: updatedLikes });
    };

    // 좋아요 제거 함수
    const removeLikeMovie = (movieId) => {
        const updatedLikes = user.userLikeList.filter((movie) => movie.id !== movieId);
        setUser({ ...user, userLikeList: updatedLikes });
    };

    return (
        <AppContext.Provider value={{ user, setUser, isMovieLiked, addLikeMovie, removeLikeMovie }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
