/**
 * AppLayout Component
 * Main layout with navigation and header
 */

import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';
import { ROUTES } from '../../constants';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-twilio-gray-50">
      {/* Top Navigation */}
      <nav className="border-b border-twilio-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-twilio-blue">
                  CCAI Collections
                </h1>
              </div>
              {/* Navigation Links */}
              <div className="ml-10 flex items-baseline space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.FILES)}
                >
                  Files
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.MFA)}
                >
                  MFA Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/spacex')}
                >
                  SpaceX
                </Button>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium text-twilio-gray-900">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-xs text-twilio-gray-500">
                  {user?.roles.join(', ')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
