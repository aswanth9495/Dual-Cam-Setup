import React from 'react';

import { ToastContainer } from 'react-toastify';

export default function AppBase({ children }) {
  return (
    <div>
       {children}
       <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
