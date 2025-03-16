import { Navigate } from 'react-router-dom';
import { useSiteAuth } from '../contexts/SiteAuthContext';

const ProtectedRoute = ({ children }) => {
    const { siteIsLoggedIn } = useSiteAuth();

    if (!siteIsLoggedIn) {
        return <Navigate to="/LandingPage" replace />;
    }

    return children;
};

export default ProtectedRoute;
// JavaScript Document