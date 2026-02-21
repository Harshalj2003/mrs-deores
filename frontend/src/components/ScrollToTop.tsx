import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on every route change.
 * Fixes the bug where navigating between pages always starts at the bottom.
 */
const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
