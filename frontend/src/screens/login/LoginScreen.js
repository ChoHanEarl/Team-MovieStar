import React, { useState, useContext } from "react"
import { AppContext } from "../../context/AppContext"
import { Link, useNavigate } from "react-router-dom"
import "../../css/login/LoginScreen.css"


const LoginScreen = () => {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const { setUser } = useContext(AppContext)
  const navigate = useNavigate()

  // 카카오 로그인
  const handleKakaoLogin = () => {
    const Rest_api_key = process.env.REACT_APP_KAKAO_LOGIN_API_KEY // REST API KEY
    const REDIRECT_URI = 'http://localhost:9090/oauth'; // Redirect URI
    // oauth 요청 URL
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    // 카카오 로그인 페이지로 리디렉션
    window.location.href = KAKAO_AUTH_URL;
  }

  // 네이버 로그인
  const hadnleNaverLogin = () => {
    const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_LOGIN_CLIENT_ID; // 클라이언트 ID
    const REDIRECT_URI = 'http://localhost:9090/oauth'; // Redirect URI
    const STATE = "false";
    // oauth 요청 URL
    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;
    // 네이버 로그인 페이지로 리디렉션
    window.location.href = NAVER_AUTH_URL;
  }

  // 구글 로그인
  const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_LOGIN_CLIENT_ID
    const REDIRECT_URI = 'http://localhost:9090/oauth'; // Redirect URI
    const SCOPE = "email profile";
    // oauth 요청 URL
    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
    // 구글 로그인 페이지로 리다이렉션
    window.location.href = GOOGLE_AUTH_URL
  }

  // 입력값 업데이트
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault()

    // localStorage에서 유저 정보 가져오기
    const storedUser = JSON.parse(localStorage.getItem("user"))

    // 유저 정보 확인
    if (
      storedUser && 
      storedUser.username === formData.username && 
      storedUser.password === formData.password
    ) {
      // 로그인 성공 시
      setUser({ username: formData.username }) // 사용자 정보를 Context에 저장
      navigate("/") // MainScreen으로 이동
    } else {
      // 에러 메시지 출력
      setError("아이디 또는 비밀번호가 일치하지 않습니다.")
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>

        {/* 로그인 폼 */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              placeholder="아이디를 입력하세요"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        {/* 에러 메시지 */}
        {error && <p className="error-message">{error}</p>}

        {/* 소셜 로그인 섹션 */}
        <div className="social-login-section">
          <p className="social-login-title">소셜 로그인</p>
          <div className="social-login">
            <button className="social-button naver" onClick={hadnleNaverLogin}>네이버 로그인</button>
            <button className="social-button kakao" onClick={handleKakaoLogin}>카카오 로그인</button>
            <button className="social-button google" onClick={handleGoogleLogin}>구글 로그인</button>
          </div>
        </div>

        {/* 링크 섹션 */}
        <div className="links">
          <Link to="/find-id">아이디 찾기</Link>
          <Link to="/find-password">비밀번호 찾기</Link>
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
