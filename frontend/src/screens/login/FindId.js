import React, { useState } from 'react';
import "../../css/login/LoginScreen.css";

const FindId = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleFindId = (e) => {
        e.preventDefault();

        // 실제 서비스에서는 서버로 이메일 데이터를 보내고 결과를 받아옵니다.
        if (email === 'example@example.com') {
            setMessage('회원님의 아이디는 "user123"입니다.');
        } else {
            setMessage('입력하신 정보와 일치하는 아이디가 없습니다.');
        }
    };

    return (
        <div className="find-id-container">
            <h2>아이디 찾기</h2>
            <form onSubmit={handleFindId}>
                <div className="input-group">
                    <label htmlFor="email">가입 시 사용한 이메일</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        required
                    />
                </div>
                <button type="submit" className="find-id-button">아이디 찾기</button>
            </form>
            {message && <p className="result-message">{message}</p>}
        </div>
    );
};

export default FindId;
