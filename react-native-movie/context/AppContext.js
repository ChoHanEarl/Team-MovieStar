import React, { createContext, useState, useEffect } from 'react';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null); // 사용자 정보 상태
    const [token, setToken] = useState(null); // 토큰 상태

    // 로그인 시 호출하는 함수
    const login = async (userInfo, userToken) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userInfo));
            await AsyncStorage.setItem('token', userToken);
            setUser(userInfo);
            setToken(userToken);
        } catch (error) {
            console.error("로그인 오류:", error);
        }
    };

    // 로그아웃 시 호출하는 함수
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error("로그아웃 오류:", error);
        }
    };

    // 앱 시작 시 사용자 정보를 AsyncStorage에서 불러오는 함수
    const loadUserFromAsyncStorage = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch (error) {
            console.error("AsyncStorage에서 사용자 정보 불러오기 오류:", error);
        }
    };

    // 앱 실행 시 사용자 정보를 불러오기
    useEffect(() => {
        loadUserFromAsyncStorage();
    }, []);

    return (
        <AppContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AppContext.Provider>
    );
};
