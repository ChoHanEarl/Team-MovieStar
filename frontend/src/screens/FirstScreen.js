import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/main/FirstPage.css"


const FirstPage = ()=> {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login')
  }

  const handleClick2 = () => {
    navigate('/home')
  }

  return (
    <div className="App">
      <div className="content">
        <h1>movie recommendation</h1>
        <p>보고싶은 영화의 평점과 리뷰를 미리 확인하고 선택해 보세요!</p>
        <button className="btn" onClick={handleClick}>login</button>
        <button className="btn" onClick={handleClick2}>home</button>
      </div>
    </div>
  );
}


export default FirstPage;