import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div
      style={{
        // 작은 폰(360px)에서는 꽉 차고, 아이폰 14(390px)보다 큰 화면에서는 390px에서 멈춤
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
