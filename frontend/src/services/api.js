// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
};

// Helper function for file uploads
const uploadRequest = async (endpoint, formData) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  };

  try {
    console.log(`Making upload request to: ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/test`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw new Error('Backend server is not reachable');
  }
};

// Auth API
export const authAPI = {
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  getCurrentUser: () => 
    apiRequest('/auth/me'),
  
  changePassword: (passwordData) => 
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    }),
  
  logout: () => 
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

// User API
export const userAPI = {
  getProfile: () => 
    apiRequest('/users/profile'),
  
  updateProfile: (profileData) => {
    // Check if profileData contains files
    if (profileData instanceof FormData) {
      return uploadRequest('/users/profile', profileData);
    }
    
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  saveResource: (resourceId) => 
    apiRequest(`/users/save-resource/${resourceId}`, {
      method: 'POST',
    }),
  
  unsaveResource: (resourceId) => 
    apiRequest(`/users/save-resource/${resourceId}`, {
      method: 'DELETE',
    }),
  
  viewResource: (resourceId) => 
    apiRequest(`/users/view-resource/${resourceId}`, {
      method: 'POST',
    }),
  
  getActivity: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users/activity${queryString ? `?${queryString}` : ''}`);
  },
};

// Resources API
export const resourcesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/resources${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => 
    apiRequest(`/resources/${id}`),
  
  getRelated: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/resources/${id}/related${queryString ? `?${queryString}` : ''}`);
  },
  
  getCategories: () => 
    apiRequest('/resources/categories'),
  
  getRecommended: (userType, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/resources/recommended/${userType}${queryString ? `?${queryString}` : ''}`);
  },
  
  create: (resourceData) => {
    // Check if resourceData contains files
    if (resourceData instanceof FormData) {
      return uploadRequest('/resources', resourceData);
    }
    
    return apiRequest('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  },
  
  update: (id, resourceData) => {
    // Check if resourceData contains files
    if (resourceData instanceof FormData) {
      return uploadRequest(`/resources/${id}`, resourceData);
    }
    
    return apiRequest(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },
  
  delete: (id) => 
    apiRequest(`/resources/${id}`, {
      method: 'DELETE',
    }),
};

// Jobs API
export const jobsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/jobs${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => 
    apiRequest(`/jobs/${id}`),
  
  apply: (jobId, applicationData) => {
    // Job applications always contain files (resume)
    return uploadRequest(`/jobs/${jobId}/apply`, applicationData);
  },
  
  checkApplication: (jobId) => 
    apiRequest(`/jobs/${jobId}/check-application`),
  
  getUserApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/jobs/user/applications${queryString ? `?${queryString}` : ''}`);
  },

  create: (jobData) => 
    apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),
};

// Events API
export const eventsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events${queryString ? `?${queryString}` : ''}`);
  },
  
  getUpcoming: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events/upcoming${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => 
    apiRequest(`/events/${id}`),
  
  create: (eventData) => {
    // Check if eventData contains files (featured image)
    if (eventData instanceof FormData) {
      return uploadRequest('/events', eventData);
    }
    
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
  
  register: (eventId, registrationData) => 
    apiRequest(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    }),
  
  checkRegistration: (eventId) => 
    apiRequest(`/events/${eventId}/check-registration`),
  
  getUserRegistrations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events/user/registrations${queryString ? `?${queryString}` : ''}`);
  },
  
  getHostedEvents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events/user/hosted${queryString ? `?${queryString}` : ''}`);
  },
  
  getEventRegistrations: (eventId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events/${eventId}/registrations${queryString ? `?${queryString}` : ''}`);
  },
};

// Mentors API
export const mentorsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/mentors${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => 
    apiRequest(`/mentors/${id}`),
  
  create: (mentorData) => 
    apiRequest('/mentors', {
      method: 'POST',
      body: JSON.stringify(mentorData),
    }),
  
  update: (id, mentorData) => 
    apiRequest(`/mentors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mentorData),
    }),
};

// Chats API
export const chatsAPI = {
  getAll: () => 
    apiRequest('/chats'),
  
  getOrCreate: (mentorId) => 
    apiRequest(`/chats/${mentorId}`),
  
  getMessages: (chatId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/chats/${chatId}/messages${queryString ? `?${queryString}` : ''}`);
  },
  
  sendMessage: (chatId, messageData) => {
    // Check if messageData contains files (attachments)
    if (messageData instanceof FormData) {
      return uploadRequest(`/chats/${chatId}/messages`, messageData);
    }
    
    return apiRequest(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },
  
  markAsRead: (chatId, messageId) => 
    apiRequest(`/chats/${chatId}/messages/${messageId}/read`, {
      method: 'PUT',
    }),
  
  editMessage: (chatId, messageId, content) => 
    apiRequest(`/chats/${chatId}/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  
  deleteMessage: (chatId, messageId) => 
    apiRequest(`/chats/${chatId}/messages/${messageId}`, {
      method: 'DELETE',
    }),
  
  addReaction: (chatId, messageId, emoji) => 
    apiRequest(`/chats/${chatId}/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),
};

// Files API (GridFS file operations)
export const filesAPI = {
  // Get file by filename (public access for images, private for documents)
  getFile: (filename) => `${API_BASE_URL}/files/${filename}`,
  
  // Download file by ID (requires authentication)
  downloadFile: (fileId) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  
  // Delete file by ID
  deleteFile: (fileId) => 
    apiRequest(`/files/${fileId}`, {
      method: 'DELETE',
    }),
  
  // Get all files uploaded by a user
  getUserFiles: (userId) => 
    apiRequest(`/files/user/${userId}`),
  
  // Get file URL for display
  getFileUrl: (filename) => `${API_BASE_URL}/files/${filename}`,
};

export default {
  authAPI,
  userAPI,
  resourcesAPI,
  jobsAPI,
  eventsAPI,
  mentorsAPI,
  chatsAPI,
  filesAPI,
  testConnection, // Export test function
};