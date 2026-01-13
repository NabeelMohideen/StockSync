import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
    const location = useLocation();

    useEffect(() => {
        // Page navigation tracking - can be extended with analytics
    }, [location]);

    return null;
}