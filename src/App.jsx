import React from 'react';
import AppRouter from './routers/AppRouter';
import { Provider } from 'react-redux';
import  store  from '../src/redux/store'; 
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Đảm bảo bạn đã import CSS của react-toastify
import { OrderedListProvider } from './context/OrderedListContext';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <OrderedListProvider >
        <AppRouter />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        </OrderedListProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
