import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayouth: React.FC = () => {
    return (
        <div className='bg-gray-100 min-h-screen flex items-center justify-center p-6'>
            <Outlet />
        </div>
    );
};

export default AuthLayouth;