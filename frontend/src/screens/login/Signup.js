import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/login/LoginScreen.css"

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 화면이동 함수
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    // 서버 요청 또는 로직 추가
    if(!formData.email){
      setMessage("이메일을 입력해주세요.");
    } else if(!formData.password){
      setMessage("비밀번호를 입력해주세요.");
    } else if(formData.password !== formData.confirmPassword){
      setMessage("비밀번호가 일치하지 않습니다.")
    } else{
      // 회원가입 정보를 localStorage에 저장
      const newUser = {
        username: formData.email,
        password: formData.password,
      };
      localStorage.setItem("user", JSON.stringify(newUser));

      alert("회원가입 완료")
      navigate("/login")
    }
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        {/* <label htmlFor="nickname">닉네임</label> */}
        {/* <input
          type="text"
          id="nickname"
          value={formData.nickname}
          onChange={handleChange}
          placeholder="닉네임을 입력하세요"
          required
        /> */}

        <label htmlFor="email">이메일(ID)</label>
        <input
          type="text"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="이메일을 입력하세요"
          required
        />

        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호를 입력하세요"
          required
        />

        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="비밀번호를 다시 입력하세요"
          required
        />

        <button type="submit">회원가입</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
