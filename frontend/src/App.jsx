import AppProvider from './context/AppContext';
import AuthProvider from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
