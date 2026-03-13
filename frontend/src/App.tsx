import React from 'react';
import Home from './pages/Home';
import { RefineProvider } from './store/refineStore';

const App: React.FC = () => {
  return (
    <RefineProvider>
      <Home />
    </RefineProvider>
  );
};

export default App;

