import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { IoHome } from "react-icons/io5";
import '../css/main/MyPage.css';

const MyPage = () => {
    const { user, setUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        userPwd: user?.userName || '',
        newUserName: user?.userName || '',
        userNick: user?.userNick || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        userEmail: user?.userEmail || ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // 로그인되지 않은 경우 리다이렉트
    if (!user) {
        navigate('/login');
        return null;
    }

    // 홈으로 이동하는 함수
    const navigateToHome = () => {
        navigate("/home");
    };

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

    const validatePasswordUpdate = () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            setMessage('모든 비밀번호 입력란을 채워주세요.');
            setMessageType('error');
            return false;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            setMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
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
        }
    };

    const updatePassword = () => {
        if (!validatePasswordUpdate()) return;

        // 로컬 스토리지의 사용자 정보 업데이트
        const storageKey = Object.keys(localStorage).find(
            key => JSON.parse(localStorage.getItem(key)).userName === user.userName
        );

        if (storageKey) {
            const storedUser = JSON.parse(localStorage.getItem(storageKey));
            
            // 현재 비밀번호 확인
            if (storedUser.userPwd !== formData.currentPassword) {
                setMessage('현재 비밀번호가 일치하지 않습니다.');
                setMessageType('error');
                return;
            }

            // 새로운 정보로 업데이트
            const updatedUser = {
                ...storedUser,
                userPwd: formData.newPassword
            };

            // 로컬 스토리지 업데이트
            localStorage.setItem(storageKey, JSON.stringify(updatedUser));

            // 입력 필드 초기화
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));

            setMessage('비밀번호가 성공적으로 변경되었습니다.');
            setMessageType('success');
        }
    };

    return (
        <div className="mypage-container">
            <div className='home-button-container'>
                <button
                    className="home-button"
                    onClick={navigateToHome}
                >
                    <IoHome />
                </button>
            </div>

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
                    onClick={() => setActiveTab('password')}
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
                            onChange={handleInputChange}
                            placeholder="새 아이디 입력"
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

            {activeTab === 'password' && (
                <div className="password-edit-section">
                    <h2>비밀번호 변경</h2>
                    <div className="input-group">
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="현재 비밀번호 입력"
                        />
                    </div>
                    <div className="input-group">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="새 비밀번호 입력"
                        />
                    </div>
                    <div className="input-group">
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleInputChange}
                            placeholder="새 비밀번호 다시 입력"
                        />
                    </div>
                    <button onClick={updatePassword}>비밀번호 변경</button>
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
                    <div className="liked-movies-grid">
                        {user.userLikeList.map(movie => (
                            <div key={movie.id} className="liked-movie-item">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                    alt={movie.title} 
                                />
                                <p>{movie.title}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>좋아요 표시한 영화가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default MyPage;