import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { IoHome } from "react-icons/io5";
import '../css/main/MyPage.css';
import logo from "../logo/logo.png"
import axios from 'axios';
import { API_BASE_URL } from '../api/api-config';

const MyPage = () => {
    const { user, setUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        newUserName: user?.userName || '',
        userNick: user?.userNick || '',
        userEmail: user?.userEmail || ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (!user) {
            navigate("/home")
        } else {
            axios.get(`${API_BASE_URL}/user/secure-data`, { withCredentials: true })
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401) {
                        console.log("Invalid token, logging out...");
                        // 로그아웃 처리
                        handleLogout();
                    } else {
                        console.log("Error: ", error.message);
                    }
                })
        }
    }, [])

    // 로그인되지 않은 경우 리다이렉트
    if (!user) {
        navigate('/login');
        return null;
    }

    // 홈으로 이동하는 함수
    const navigateToHome = () => {
        navigate("/home");
    };

    const handleLogout = () => {

        axios.post(`${API_BASE_URL}/user/logout`, {}, { withCredentials: true })
            .then(() => {
                setUser(null) // 사용자 로그아웃 처리
                alert("로그아웃 처리되었습니다")
            }).catch((error) => {
                console.log(error)
                setUser(null) // 사용자 로그아웃 처리

            })

    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setMessage(''); // 입력 시 메시지 초기화
    };

    const validateProfileUpdate = () => {
        if (!formData.newUserName || !formData.userNick) {
            setMessage('아이디와 닉네임을 모두 입력해주세요.');
            setMessageType('error');
            return false;
        }
        return true;
    };

    const updateProfile = () => {
        if (!validateProfileUpdate()) return;

        // 로컬 스토리지의 사용자 정보 업데이트
        const storageKey = Object.keys(localStorage).find(
            key => JSON.parse(localStorage.getItem(key)).userName === user.userName
        );

        if (storageKey) {
            const storedUser = JSON.parse(localStorage.getItem(storageKey));

            // 새로운 정보로 업데이트
            const updatedUser = {
                ...storedUser,
                userName: formData.newUserName,
                userNick: formData.userNick,
                userEmail: formData.userEmail
            };

            axios.put(`${API_BASE_URL}/user/private/modify`,
                {
                    userName: formData.newUserName,
                    userNick: formData.userNick,
                    userEmail: formData.userEmail
                },
                {
                    withCredentials: true
                }).then(() => {
                    // 로컬 스토리지 업데이트
                    localStorage.setItem(storageKey, JSON.stringify(updatedUser));

                    // 컨텍스트 사용자 정보 업데이트
                    setUser(prev => ({
                        ...prev,
                        userName: formData.newUserName,
                        userNick: formData.userNick,
                        userEmail: formData.userEmail
                    }));
                    setMessage('프로필이 성공적으로 업데이트되었습니다.');
                    setMessageType('success');
                }).catch((error) => {
                    setMessage(error.response.data)
                    setMessageType('error')
                })


        }
    };


    const handleLogoClick = () => {
        navigate("/home")
    }

    return (
        <div className="mypage-container">
            <header className="mypage-header">
                <img src={logo} className="signup-logo" onClick={handleLogoClick} />
                <div className="home-button-container">
                    <button
                        className="home-button"
                        onClick={navigateToHome}
                    >
                        <IoHome /> 홈
                    </button>
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            <div className="mypage-body">
                <h1>마이페이지</h1>
                <div className="mypage-tabs">
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        프로필 수정
                    </button>
                    <button
                        className={activeTab === 'password' ? 'active' : ''}
                        onClick={() => navigate('/ChangePwd', { state: { userEmail: user.userEmail } })}
                    >
                        비밀번호 변경
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className="profile-edit-section">
                        <h2>프로필 수정</h2>
                        <div className="input-group">
                            <label>아이디</label>
                            <input
                                type="text"
                                name="newUserName"
                                value={formData.newUserName}
                                readonly
                            />
                        </div>
                        <div className="input-group">
                            <label>닉네임</label>
                            <input
                                type="text"
                                name="userNick"
                                value={formData.userNick}
                                onChange={handleInputChange}
                                placeholder="새 닉네임 입력"
                            />
                        </div>
                        <div className="input-group">
                            <label>이메일</label>
                            <input
                                type="email"
                                name="userEmail"
                                value={formData.userEmail}
                                onChange={handleInputChange}
                                placeholder="새 이메일 입력"
                            />
                        </div>
                        <button onClick={updateProfile}>프로필 업데이트</button>
                    </div>
                )}



                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <div className="liked-movies-section">
                    <h2>좋아요 표시한 영화</h2>
                    {user.userLikeList && user.userLikeList.length > 0 ? (
                        <div className="liked-movies-flex">
                            {user.userLikeList.map((movie, index) => (
                                <div key={movie.movieId || index} className="liked-movie-item">
                                    {movie.moviePoster ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${movie.moviePoster}`}
                                            alt={movie.movieName}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '대체 이미지 URL';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-poster">포스터 없음</div>
                                    )}
                                    <p>{movie.movieName || '제목 없음'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>좋아요 표시한 영화가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPage;