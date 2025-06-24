import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshUserData();
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.user);
      setRecentActivity(response.user.recentActivity || []);
    } catch (error) {
      console.error('Get current user error:', error);
      if (error.message.includes('Token') || error.message.includes('401')) {
        localStorage.removeItem('token');
        setUser(null);
        setRecentActivity([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.user);
      setRecentActivity(response.user.recentActivity || []);
    } catch (error) {
      console.error('Refresh user data error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const response = await authAPI.login({ email, password });
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setRecentActivity(response.user.recentActivity || []);
      
      // Track login activity
      addLocalActivity('security', 'Logged In', 'Successfully logged into account');
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (fullName, email, password, role) => {
    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const response = await authAPI.register({
        fullName,
        email,
        password,
        role
      });

      localStorage.setItem('token', response.token);
      setUser(response.user);
      setRecentActivity(response.user.recentActivity || []);
      
      // Track signup activity
      addLocalActivity('security', 'Account Created', 'Successfully created new account');
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data) => {
    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Create FormData if there are files
      let formData;
      if (data.avatar && data.avatar instanceof File) {
        formData = new FormData();
        Object.keys(data).forEach(key => {
          if (key === 'avatar') {
            formData.append('avatar', data[key]);
          } else if (key === 'skills' && Array.isArray(data[key])) {
            data[key].forEach(skill => formData.append('skills[]', skill));
          } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
      } else {
        formData = data;
      }

      const response = await userAPI.updateProfile(formData);
      setUser(response.user);
      
      // Track profile update activity
      addLocalActivity('security', 'Profile Updated', 'Successfully updated profile information');
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }
      
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      const response = await authAPI.changePassword({
        currentPassword,
        newPassword
      });
      
      // Refresh user activity
      await getCurrentUser();
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const saveResource = async (resourceId) => {
    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      await userAPI.saveResource(resourceId);
      
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          savedResources: [...(prev.savedResources || []), resourceId],
        };
      });
      
      // Track save activity locally
      addLocalActivity('save', 'Resource Saved', `Saved resource #${resourceId}`);
      
      // Refresh activity from server
      setTimeout(() => getCurrentUser(), 1000);
    } catch (error) {
      console.error('Save resource error:', error);
      throw error;
    }
  };

  const unsaveResource = async (resourceId) => {
    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      await userAPI.unsaveResource(resourceId);
      
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          savedResources: (prev.savedResources || []).filter(id => id !== resourceId),
        };
      });
      
      // Track unsave activity locally
      addLocalActivity('save', 'Resource Unsaved', `Removed resource #${resourceId} from saved items`);
    } catch (error) {
      console.error('Unsave resource error:', error);
      throw error;
    }
  };

  const addToViewed = async (type, id, title = '') => {
    try {
      if (!isOnline) {
        console.warn('Offline: Cannot track view activity');
        return;
      }

      if (type === 'resources') {
        await userAPI.viewResource(id);
        // Track view activity locally
        addLocalActivity('view', 'Resource Viewed', title ? `Viewed "${title}"` : `Viewed resource #${id}`);
        
        // Refresh activity from server
        setTimeout(() => getCurrentUser(), 1000);
      }
    } catch (error) {
      console.error('Add to viewed error:', error);
    }
  };

  const addLocalActivity = (type, title, description) => {
    const newActivity = {
      id: Date.now(),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleString()
    };
    
    setRecentActivity(prev => [newActivity, ...(prev || []).slice(0, 19)]); // Keep last 20 activities
  };

  const clearActivity = () => {
    setRecentActivity([]);
  };

  const getActivityStats = () => {
    const stats = {
      total: recentActivity.length,
      byType: {},
      recent: recentActivity.slice(0, 5),
      today: 0
    };

    const today = new Date().toDateString();
    
    recentActivity.forEach(activity => {
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      
      // Count today's activities
      const activityDate = new Date(activity.timestamp).toDateString();
      if (activityDate === today) {
        stats.today++;
      }
    });

    return stats;
  };

  const logout = async () => {
    try {
      if (isOnline) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setRecentActivity([]);
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const getUserDisplayName = () => {
    return user?.fullName || user?.name || user?.email || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (user?.avatar?.url) {
      return user.avatar.url;
    }
    if (user?.avatar && typeof user.avatar === 'string') {
      return user.avatar;
    }
    return null;
  };

  const value = {
    // State
    user,
    recentActivity: recentActivity || [],
    loading,
    isOnline,
    
    // Authentication methods
    login,
    signup,
    logout,
    getCurrentUser,
    refreshUserData,
    
    // Profile methods
    updateProfile,
    changePassword,
    
    // Resource methods
    saveResource,
    unsaveResource,
    addToViewed,
    
    // Activity methods
    addLocalActivity,
    clearActivity,
    getActivityStats,
    
    // Utility methods
    isAuthenticated,
    hasRole,
    hasAnyRole,
    getUserDisplayName,
    getUserInitials,
    getAvatarUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hooks for specific auth features
export const useAuthUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

export const useAuthActions = () => {
  const { login, signup, logout, updateProfile, changePassword } = useAuth();
  return { login, signup, logout, updateProfile, changePassword };
};

export const useUserActivity = () => {
  const { recentActivity, addLocalActivity, clearActivity, getActivityStats } = useAuth();
  return { recentActivity, addLocalActivity, clearActivity, getActivityStats };
};

export const useUserResources = () => {
  const { saveResource, unsaveResource, addToViewed, user } = useAuth();
  return { 
    saveResource, 
    unsaveResource, 
    addToViewed, 
    savedResources: user?.savedResources || [] 
  };
};