import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import SetlistImport from './pages/SetlistImport';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setlist-import" element={<SetlistImport />} />
      </Routes>
    </Layout>
  );
}

export default App;
