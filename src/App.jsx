import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LivePage } from './pages/meeting/LivePage';
import { ExpiredLinkPage } from './pages/after/ExpiredLinkPage/ExpiredLinkPage';
import { ResultPage } from './pages/after/ResultPage/ResultPage';
import { JoinPage } from './pages/before/JoinPage/JoinPage';
import { MainPage } from './pages/before/MainPage/MainPage';
import { SetupPage } from './pages/before/SetupPage/SetupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          <Route path="/meetings/:meetingId/live" element={<LivePage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/m/:code" element={<JoinPage />} />
          <Route path="/result/:meetingId" element={<ResultPage />} />
          <Route path="/share/:shareCode" element={<ResultPage readOnly />} />
          <Route path="/invalid-link" element={<ExpiredLinkPage />} />
          {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
