import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { MainPage } from './pages/before/MainPage/MainPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모바일 레이아웃 설정 */}
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
