import { toast } from 'react-toastify';

/**
 * 성공 메시지를 Toast로 표시
 * @param {string} message - 표시할 메시지
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * 에러 메시지를 Toast로 표시
 * @param {string} message - 표시할 메시지
 */
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * 정보 메시지를 Toast로 표시
 * @param {string} message - 표시할 메시지
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * 경고 메시지를 Toast로 표시
 * @param {string} message - 표시할 메시지
 */
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * 일반 알림 메시지를 Toast로 표시 (alert 대체용)
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'warning', 'info')
 */
export const showAlert = (message, type = 'info') => {
  switch (type) {
    case 'success':
      showSuccess(message);
      break;
    case 'error':
      showError(message);
      break;
    case 'warning':
      showWarning(message);
      break;
    default:
      showInfo(message);
  }
};

