// import React from 'react';
// import { useStreaming } from  '../../contexts/StreamingContext';
// import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
// import {type ToastType } from '../../types';

// const toastConfig = {
//   info: { icon: <FaInfoCircle />, className: 'bg-blue-500/20 border-blue-500/30' },
//   success: { icon: <FaCheckCircle />, className: 'bg-success/20 border-success/30' },
//   error: { icon: <FaExclamationCircle />, className: 'bg-danger/20 border-danger/30' },
//   warning: { icon: <FaExclamationTriangle />, className: 'bg-warning/20 border-warning/30' },
// };

// const Toast: React.FC = () => {
//   const { toastState } = useStreaming();
//   const { message, type, visible } = toastState;
  
//   if (!visible) return null;

//   const { icon, className } = toastConfig[type as ToastType];

//   return (
//     <div
//       className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-medium shadow-lg z-50 flex items-center gap-3 border transition-all duration-400 ease-in-out ${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
//     >
//       {icon} {message}
//     </div>
//   );
// };

// export default Toast;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCheckCircle, faExclamationTriangle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const toastConfig = {
  info: { icon: faInfoCircle, bg: 'bg-secondary/20', border: 'border-secondary/30' },
  success: { icon: faCheckCircle, bg: 'bg-success/20', border: 'border-success/30' },
  warning: { icon: faExclamationTriangle, bg: 'bg-warning/20', border: 'border-warning/30' },
  error: { icon: faExclamationCircle, bg: 'bg-danger/20', border: 'border-danger/30' },
};

export default function Toast({ message, type, visible, onHide }: {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  visible: boolean;
  onHide?: () => void;
}) {
  if (!visible) return null;

  const config = toastConfig[type] || toastConfig.info;

  return (
    <div
      className={`
        fixed bottom-5 left-1/2 -translate-x-1/2
        flex items-center gap-3 px-6 py-3 rounded-full
        font-medium shadow-2xl border backdrop-blur-sm z-50
        transition-all duration-300
        ${config.bg} ${config.border}
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
    >
      <FontAwesomeIcon icon={config.icon} />
      <span>{message}</span>
    </div>
  );
}