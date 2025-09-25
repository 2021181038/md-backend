// src/AuthWrapper.js
import React, { useState } from "react";

const AuthWrapper = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const correctPassword = "2024"; // ✅ 원하는 비번 입력

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔒 비공개 페이지</h2>
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", marginRight: "10px" }}
        />
        <button
          style={{ padding: "8px 12px", fontSize: "16px" }}
          onClick={() => {
            if (password === correctPassword) {
              setIsAuthorized(true);
            } else {
              alert("❌ 비밀번호가 틀렸습니다!");
            }
          }}
        >
          접속
        </button>
      </div>
    );
  }

  // ✅ 인증 성공 → children(=App) 보여줌
  return <>{children}</>;
};

export default AuthWrapper;
