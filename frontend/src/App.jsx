import AppProvider from './context/AppContext';
import AuthProvider from './context/AuthContext';
import LocationProvider from './context/LocationContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <LocationProvider>
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
