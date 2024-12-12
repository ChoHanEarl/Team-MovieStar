import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/login/Signup.css"
import logo from "../../logo/logo.png"

const Signup = () => {
  const [formData, setFormData] = useState({
    userNick: "",
    userEmail: "",
    userName: "",
    userPwd: "",
    userPwdCheck: "",
    // userLikeList: [],
  })

  const [message, setMessage] = useState("")
  // 중복된 아이디로 로그인 시도할 경우
  const [userNameError, setUserNameError] = useState("")

  const [disabled, setDisabled] = useState(true)

  // 화면이동 함수
  const navigate = useNavigate()

  useEffect(() => {
    // 이메일 식별 정규식
    const emailCheck = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/
    
    // 비밀번호 정규식
    const passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    // 서버 요청 또는 로직 추가
    if (!formData.userNick) {
      setMessage("닉네임을 입력해주세요")
      setDisabled(true)
    } else if (!formData.userEmail) {
      setMessage("이메일을 입력해주세요.");
      setDisabled(true)
    } else if (!emailCheck.test(formData.userEmail)) {
      setMessage("이메일 형식을 확인해주세요.");
      setDisabled(true)
    } else if (!formData.userName) {
      setMessage("아이디를 입력해주세요.");
      setDisabled(true)
    } else if (!formData.userPwd) {
      setMessage("비밀번호를 입력해주세요.");
      setDisabled(true)
    } else if(!passwordCheck.test(formData.userPwd)) {
      setMessage("비밀번호는 최소 8자이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.")
      setDisabled(true)
    } else if (formData.userPwd !== formData.userPwdCheck) {
      setMessage("비밀번호가 일치하지 않습니다.")
      setDisabled(true)
    } else{
      setMessage("")
      setDisabled(false)
    }
  }, [formData])

  const handleLogoClick = () => {
    navigate("/Home")
  }

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
      try {
        const response = await fetch("/user/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if(!response.ok) {
          const errorData = await response.json()
          if(errorData.message) {
            setMessage(errorData.message)
          }
          return;
        }

        const data = await response.json()

        if (!data.success) {
          setMessage(data.message)
          return;
        } 
          alert("회원가입 완료");
          navigate("/login");
      } catch(error) {
        console.error("Error during signup:", error)
        setMessage("회원가입 중 오류가 발생했습니다.")
      }
    }

  return (
      <div className="signup-page">
        <header className="signup-header">
          <img src={logo} className="signup-logo" onClick={handleLogoClick} />
        </header>
        <div className="signup-body">
          <div className="signup-box">
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
              {Object.entries(formData).map(([key, value]) => {
                const labels = {
                  userNick: "닉네임",
                  userEmail: "이메일",
                  userName: "아이디",
                  userPwd: "비밀번호",
                  userPwdCheck: "비밀번호 확인",
                }

                // key에 Pwd가 포함되어 있으면 타입을 password, 아니면 text
                const inputType = key.includes("Pwd") ? "password" : "text"

                // placeholder 설정
                const placeholder = 
                  key === "userPwdCheck" 
                  ? "비밀번호 한번 더 입력" 
                  : `${labels[key]} 입력`
                  
                return (
                <label key={key}>
                  {labels[key]}
                  <input 
                    type={inputType} //비밀번호는 password, 나머지는 text
                    name={key} 
                    onChange={handleChange}
                    placeholder={placeholder}
                    value={value}
                  />
                  {userNameError && <p style={{ color: "red", fontSize: "0.8rem"}}>{userNameError}</p>}
                </label>
              )
            })}

            <button type="submit" disabled={disabled}>회원가입</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Signup;
