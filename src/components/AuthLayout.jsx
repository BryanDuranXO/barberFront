import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header .jsx';

const AuthLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default AuthLayout;
