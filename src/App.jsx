import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LivePage } from './pages/meeting/LivePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          <Route path="/meetings/:meetingId/live" element={<LivePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
