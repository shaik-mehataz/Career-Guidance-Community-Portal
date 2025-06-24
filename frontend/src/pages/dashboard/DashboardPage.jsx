import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Settings, BookOpen, Briefcase, Calendar, Users, LogOut, Edit, Lock, 
  Bell, Eye, Heart, MessageSquare, Share2, Bookmark, FileText, 
  CheckCircle, AlertCircle, Plus, Mail, Phone, Globe, Download,
  Activity, Clock, Star, MapPin, Building, X, Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { resources } from '../../data/resources';
import { jobs } from '../../data/jobs';
import { events } from '../../data/events';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile, changePassword, recentActivity, getCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Handle activity refresh when navigating from payment
  useEffect(() => {
    if (location.state?.refreshActivities) {
      getCurrentUser();
      // Clear the state after refreshing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, getCurrentUser, navigate]);

  // Set active tab to activities if coming from payment
  useEffect(() => {
    if (location.state?.newActivity) {
      setActiveTab('activities');
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setShowPaymentSuccess(true);
      // Optionally clear the state after showing the message
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Enhanced profile data with safe defaults
  const [profile, setProfile] = useState({
    name: user?.name || user?.fullName || 'User',
    email: user?.email || '',
    phone: '+91 9876543210',
    location: 'Bangalore, Karnataka',
    bio: 'Passionate software engineer with expertise in full-stack development. Always eager to learn new technologies and solve complex problems.',
    title: 'Software Engineer',
    company: 'TechCorp Solutions',
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience: '3+ years',
    education: 'B.Tech Computer Science, IIT Mumbai',
  });

  // Get saved and viewed items with safe defaults
  const savedResources = resources.filter(r => user?.savedResources?.includes(r.id)) || [];
  const viewedJobs = jobs.filter(j => user?.viewedJobs?.includes(j.id)) || [];
  const viewedEvents = events.filter(e => user?.viewedEvents?.includes(e.id)) || [];

  // Calculate completion percentage
  const profileCompletion = () => {
    const fields = [profile.name, profile.email, profile.phone, profile.location, profile.bio, profile.title, profile.company];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Show loading if user is not available yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Profile Tab Content
  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
              <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div className="pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center"
              >
                <Edit className="mr-1 h-4 w-4" /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="primary" onClick={handleProfileUpdate}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-lg text-gray-600">{profile.title}</p>
              <div className="flex items-center text-gray-500 mt-2 space-x-4">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {profile.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              </div>
              <p className="text-gray-700 mt-4">{profile.bio}</p>
              
              {/* Profile Completion */}
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                  <span className="text-sm text-blue-700">{profileCompletion()}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${profileCompletion()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-600">{profile.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Website</p>
                <a href={profile.website} className="text-sm text-blue-600 hover:text-blue-800">
                  {profile.website}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                <a href={profile.linkedin} className="text-sm text-blue-600 hover:text-blue-800">
                  View Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Skill
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Recent Activities Tab Content
  const renderActivitiesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" /> Recent Activities
          </h3>
          <p className="text-sm text-gray-600 mt-1">Track your recent actions and interactions</p>
        </div>
        <div className="p-6">
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'save' && <Bookmark className="h-4 w-4 text-green-600" />}
                      {activity.type === 'application' && <Briefcase className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'event' && <Calendar className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'mentor' && <MessageSquare className="h-4 w-4 text-indigo-600" />}
                      {activity.type === 'profile' && <User className="h-4 w-4 text-gray-600" />}
                      {activity.type === 'security' && <Lock className="h-4 w-4 text-red-600" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">No recent activities</p>
              <p className="text-gray-500">Start exploring to see your activities here</p>
              <div className="mt-6 space-x-4">
                <Button variant="primary" onClick={() => navigate('/resources')}>
                  Browse Resources
                </Button>
                <Button variant="outline" onClick={() => navigate('/jobs')}>
                  Find Jobs
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Saved Items Tab Content
  const renderSavedTab = () => (
    <div className="space-y-6">
      {/* Saved Resources */}
      {savedResources.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" /> Saved Resources
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32">
                    <img
                      src={resource.imageUrl}
                      alt={resource.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-md font-semibold text-gray-900 line-clamp-2">{resource.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {resource.category}
                      </span>
                      <button
                        onClick={() => navigate(`/resources/${resource.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recently Viewed Jobs */}
      {viewedJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-600" /> Recently Viewed Jobs
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {viewedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          src={job.imageUrl}
                          alt={job.company}
                          className="h-full w-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-md font-semibold text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        <p className="text-sm text-blue-600 mt-1">{job.salary}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {savedResources.length === 0 && viewedJobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-2">No saved items yet</p>
          <p className="text-gray-500">Start exploring resources and jobs to save them here</p>
          <div className="mt-6 space-x-4">
            <Button variant="primary" onClick={() => navigate('/resources')}>
              Browse Resources
            </Button>
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              Find Jobs
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Settings Tab Content
  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          {/* Password Change Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Password</h4>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center"
              >
                <Lock className="mr-2 h-4 w-4" />
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {isChangingPassword && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    {passwordSuccess}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your new password"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="primary" 
                    onClick={handlePasswordChange}
                    disabled={isPasswordLoading}
                    className="flex items-center"
                  >
                    {isPasswordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { id: 'email', label: 'Email Notifications', description: 'Receive emails about new opportunities' },
            { id: 'job', label: 'Job Alerts', description: 'Receive notifications about matching jobs' },
            { id: 'event', label: 'Event Reminders', description: 'Receive reminders before registered events' },
            { id: 'mentor', label: 'Mentor Messages', description: 'Receive notifications for mentor communications' },
          ].map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                <p className="text-xs text-gray-500">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Export Data</p>
              <p className="text-xs text-gray-500">Download a copy of your account data</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Sign Out</p>
              <p className="text-xs text-gray-500">Sign out from your account</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium text-red-600">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'activities':
        return renderActivitiesTab();
      case 'saved':
        return renderSavedTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                {recentActivity && recentActivity.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {Math.min(recentActivity.length, 9)}
                  </span>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Fixed positioning to prevent overlap */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 lg:sticky lg:top-8">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.name || user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <nav className="space-y-1">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'activities', label: 'Recent Activities', icon: Activity },
                    { id: 'saved', label: 'Saved Items', icon: Bookmark },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="mr-3 h-5 w-5" />
                      {tab.label}
                      {tab.id === 'activities' && recentActivity && recentActivity.length > 0 && (
                        <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                          {recentActivity.length}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content - Proper spacing to prevent overlap */}
          <div className="flex-1 min-w-0">
            {showPaymentSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Payment Successful! </strong>
                <span className="block sm:inline">
                  Your registration for <b>{location.state?.eventTitle || 'the event'}</b> has been confirmed.
                </span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setShowPaymentSuccess(false)}
                >
                  <span className="text-green-800">&times;</span>
                </button>
              </div>
            )}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;