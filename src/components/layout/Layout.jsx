import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '390px',
        minHeight: '100dvh',
        margin: '0 auto',
        position: 'relative',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Outlet />
    </div>
  );
};
