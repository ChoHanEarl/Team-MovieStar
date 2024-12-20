import React, { useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const NaverLogin = () => {
    const { setUser } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (code && state) {
            axios.post(`http://localhost:9090/user/naver_signin?code=${code}&state=${state}`,null,{ withCredentials: true })
                .then((response) => {
                    if (response.status === 200) {
                        const userData = response.data;
                        console.log("로그인 응답 데이터:", userData);

                        setUser({
                            userId: userData.userId,
                            userEmail: userData.userEmail,
                            userNick: userData.userNick,
                            userName: userData.userName,
                            userLikeList: userData.userLikeList || []
                        });
                        console.log("Context에 저장된 사용자 정보:", userData);

                        alert("로그인 성공")
                        navigate("/home")
                    }
                    
                }).catch((error) => {
                    console.error("로그인 실패: ", error)
                })
        }
    }, [navigate])
    return (
        <div>
            <h1>로그인 처리중</h1>
        </div>
    );

}

export const GoogleLogin = () => {
    const { setUser } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            axios.post(`http://localhost:9090/user/google_signin?code=${code}`,null,{ withCredentials: true })
                .then((response) => {
                    if (response.status === 200) {
                        const userData = response.data;
                        console.log("로그인 응답 데이터:", userData);

                        setUser({
                            userId: userData.userId,
                            userEmail: userData.userEmail,
                            userNick: userData.userNick,
                            userName: userData.userName,
                            userLikeList: userData.userLikeList || []
                        });
                        console.log("Context에 저장된 사용자 정보:", userData);

                        alert("로그인 성공")
                        navigate("/home")
                    }
                    
                }).catch((error) => {
                    console.error("로그인 실패: ", error)
                })
        }
    }, [navigate])
    return (
        <div>
            <h1>로그인 처리중</h1>
        </div>
    );
}