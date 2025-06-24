import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { from } = location.state || { from: '/dashboard' };

  const userTypes = [
    { value: 'student', label: 'Student', description: 'Learning and exploring career options' },
    { value: 'jobseeker', label: 'Job Seeker', description: 'Looking for new opportunities' },
    { value: 'mentor', label: 'Mentor', description: 'Guiding others in their careers' },
    { value: 'employer', label: 'Employer', description: 'Hiring and recruiting talent' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!userType) {
      setError('Please select your user type');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Check if it's a user not found error
      if (error.message.includes('Invalid credentials') || error.message.includes('User not found')) {
        setError('Account not found. Please create an account first.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Create one here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 flex items-center bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">{error}</span>
                {error.includes('Account not found') && (
                  <div className="mt-2">
                    <Link 
                      to="/signup" 
                      className="text-blue-600 hover:text-blue-500 underline font-medium"
                    >
                      Click here to create an account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am signing in as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {userTypes.map((type) => (
                  <div key={type.value} className="relative">
                    <input
                      type="radio"
                      id={type.value}
                      name="userType"
                      value={type.value}
                      checked={userType === type.value}
                      onChange={(e) => setUserType(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={type.value}
                      className={`block h-24 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        userType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="font-medium text-sm">{type.label}</div>
                        </div>
                        <div className="text-xs text-gray-500 leading-tight flex-1">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-4 text-base border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-4 text-base border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
                className="py-4 text-base"
              >
                {isLoading ? 'Signing in...' : `Sign in as ${userTypes.find(t => t.value === userType)?.label}`}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to CareerCompass?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-4 px-4 border border-blue-600 rounded-md shadow-sm bg-white text-base font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;