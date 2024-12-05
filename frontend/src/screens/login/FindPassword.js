import React, { useState } from "react";
import "../../css/login/LoginScreen.css"

const FindPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 서버 요청 또는 로직 추가
    if (email === "example@example.com") {
      setMessage("입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.");
    } else {
      setMessage("입력하신 정보와 일치하는 계정을 찾을 수 없습니다.");
    }
  };

  return (
    <div className="find-password-container">
      <h2>비밀번호 찾기</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">이메일 주소</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="가입한 이메일을 입력하세요"
          required
        />
        <button type="submit">비밀번호 찾기</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FindPassword;
