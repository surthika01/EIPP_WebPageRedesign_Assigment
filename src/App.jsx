import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import ConfigurationForm from './ConfigurationForm';

function App() {
  return (
    <div className="flex h-screen w-screen bg-gray-50 font-sans overflow-hidden">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/configuration/category" replace />} />
            
            <Route path="/configuration/category" element={<ConfigurationForm />} />
            
            <Route path="*" element={<PlaceholderContent />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PlaceholderContent() {
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean).join(' > ');
  
  return (
    <div className="min-h-full flex items-center justify-center text-gray-400 flex-col gap-4 p-8">
       <div className="text-2xl font-semibold capitalize">Content for {path || 'Home'}</div>
       <p className="text-gray-500">This section is currently being configured.</p>
    </div>
  );
}

export default App;
