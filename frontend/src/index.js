import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { validateAndHandleEnvVars } from './utils/envValidator';

// 환경 변수 검증
try {
  validateAndHandleEnvVars();
} catch (error) {
  // 환경 변수 오류 시 앱을 렌더링하지 않음
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #d32f2f;">환경 변수 설정 오류</h1>
        <p>필수 환경 변수가 설정되지 않았습니다.</p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">${error.message}</pre>
        <p style="margin-top: 20px; color: #666;">
          개발 환경에서는 콘솔을 확인하세요.
        </p>
      </div>
    `;
  }
  throw error;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);

reportWebVitals();
