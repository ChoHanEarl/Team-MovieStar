import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../css/login/FindIdOrPassword.css";
import logo from "../../logo/logo.png"
import { API_BASE_URL } from '../../api/api-config';

const FindId = () => {
    const [email, setEmail] = useState('');
    const [pwdEmail, setPwdEmail] = useState('')
    const [takePwdCode,setTakePwdCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 아이디찾기 관련 메세지
    const [message, setMessage] = useState('');

    // 비밀번호찾기 관련 메세지
    const [pwMessage, setPwMessage] = useState('');

    const navigate = useNavigate();

    // 로고 클릭 시 메인화면 띄우기
    const handleLogoClick = () => {
        navigate("/home")
    }

    const handleFindId = async (e) => {
        e.preventDefault();

        if (!email) {
            setMessage("이메일을 입력해주세요.")
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/find-id?email=${email}`, {
                method: "GET",
            });

            const data = await response.json();

            if (data.success) {
                setMessage(`회원님의 아이디는 ${data.userName}입니다.`); // 성공 시 아이디 표시
            } else {
                setMessage(data.message); // 실패 시 에러 메시지 표시
            }
        } catch (error) {
            console.error("Error finding ID:", error);
            setMessage("아이디 찾기 중 오류가 발생했습니다.");
        }
    };

    const sendEmail = async (e) => {
        e.preventDefault();

        if (!pwdEmail) {
            setPwMessage('이메일을 입력해주세요');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/request_verification?email=${pwdEmail}`, { method: 'POST' });

            if (!response.ok) {
                throw new Error("이메일 전송 실패");
            }

            const data = await response.json();

            if (data.success) {
                setPwMessage(data.message || "인증코드를 이메일로 발송했습니다.");
            } else {
                setPwMessage(data.message || "인증코드 발송에 에러가 발생했습니다.");
            }
        } catch (error) {
            setPwMessage("해당 이메일로 등록된 아이디를 찾을 수 없습니다.");
            console.error("Error sending email:", error);
        }
    };

    const handleFindPassword = async (e) => {
        e.preventDefault();
    
        if (!takePwdCode) {
            setPwMessage('인증코드를 입력해주세요');
            return;
        }

        setIsLoading(true);
    
        try {
            const response = await fetch(`${API_BASE_URL}/user/verify_email?email=${pwdEmail}&code=${takePwdCode}`,{
                method:"POST"
            })

            const data = await response.json();
    
            if (response.ok) {
                 // 인증 성공 후, 토큰 발급 및 쿠키 저장
                if (data.token) {
                    document.cookie = `token=${data.token}; path=/; secure; HttpOnly`; // 토큰을 쿠키에 저장
                }
                setPwMessage(data || '인증 성공');
                alert('인증 성공')
                navigate('/ChangePwd');
            } else {
                setPwMessage(data.message || '인증코드가 일치하지 않습니다.');
            }
        } catch (error) {
            setPwMessage("서버 오류가 발생했습니다.");
            console.error("Error verifying code:", error);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className="find-page">
            <header className="find-header">
                <img src={logo} className="find-header-logo" onClick={handleLogoClick} />
            </header>
            <div className="find-body">
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
                    {message && (
                        <>
                            <p className="result-message">{message}</p>
                            {message === "해당 이메일로 등록된 아이디를 찾을 수 없습니다." ? (
                                <div className="additional-buttons">
                                    <button
                                        className="signup-button-inFindID"
                                        onClick={() => navigate('/signup')}
                                    >
                                        회원가입하기
                                    </button>
                                </div>
                            ) : (
                                <div className="additional-buttons">
                                    <button
                                        className="login-button-inFindID"
                                        onClick={() => navigate('/login')}
                                    >
                                        로그인하기
                                    </button>
                                </div>
                            )}
                        </>
                    )}
  <h2>비밀번호 찾기</h2>
                    <form >
                        <div className="input-group">
                            <label htmlFor="pwdEmail">이메일 입력</label>
                            <input
                                type="pwdEmail"
                                id="pwdEmail"
                                value={pwdEmail}
                                onChange={(e) => setPwdEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                required
                            />
                            <button onClick={sendEmail} type="button" className="find-password-button">임시 비밀번호 받기</button>
                        </div>
                    </form>
                    {pwMessage && (
                        <>
                            <p className="result-message">{pwMessage}</p>
                            {/* 이메일로 인증 코드를 발송한 경우 */}
                            {pwMessage === "인증코드를 이메일로 발송했습니다." && (
                                <>
                                    <div className="input-group">   
                                        <label htmlFor="takePwdCode">인증코드 입력</label>
                                        <input
                                            type="text"
                                            id="takePwdCode"
                                            value={takePwdCode}
                                            onChange={(e) => setTakePwdCode(e.target.value)}
                                            placeholder="이메일로 받은 인증코드를 입력하세요"
                                            required
                                        />
                                        <button
                                            className="login-button-inFindID"
                                            onClick={handleFindPassword}
                                        >
                                            인증코드확인
                                        </button>
                                    </div>
                                </>
                            )}
                            {pwMessage !== "인증코드를 이메일로 발송했습니다." &&(
                                <>
                                    <div className="additional-buttons">
                                        <button
                                            className="signup-button-inFindID"
                                            onClick={() => navigate('/signup')}
                                        >
                                            회원가입하기
                                        </button>
                                    </div>
                                    
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindId;
