import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { jobs } from '../../data/jobs';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';
import { jobsAPI } from '../../services/api';

const JobApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(jobs.find((j) => j.id === id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    coverLetter: '',
    resume: null,
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!job) {
      navigate('/jobs');
    } else {
      // Check if user has already applied
      checkExistingApplication();
    }
  }, [id, navigate, job]);

  const checkExistingApplication = async () => {
    try {
      const response = await jobsAPI.checkApplication(id);
      if (response.hasApplied) {
        setHasExistingApplication(true);
        setSubmitError('You have already applied for this job');
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  if (!job) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, DOC, and DOCX files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size cannot exceed 2MB';
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const fileError = validateFile(file);
      if (fileError) {
        setErrors({ ...errors, resume: fileError });
        return;
      }
    }

    setFormData({ ...formData, resume: file });
    if (errors.resume) {
      setErrors({ ...errors, resume: '' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileError = validateFile(file);
      
      if (fileError) {
        setErrors({ ...errors, resume: fileError });
        return;
      }

      setFormData({ ...formData, resume: file });
      if (errors.resume) {
        setErrors({ ...errors, resume: '' });
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Phone number should be exactly 10 digits';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!formData.education.trim()) {
      newErrors.education = 'Education is required';
    }

    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    }

    if (formData.coverLetter && formData.coverLetter.length > 2000) {
      newErrors.coverLetter = 'Cover letter cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (hasExistingApplication) {
      setSubmitError('You have already applied for this job');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add job information
      formDataToSend.append('jobId', job.id);
      formDataToSend.append('jobTitle', job.title);
      formDataToSend.append('company', job.company);
      formDataToSend.append('location', job.location);
      
      // Add personal information
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phone', formData.phone.replace(/[^\d]/g, ''));
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('education', formData.education);
      
      // Add cover letter if provided
      if (formData.coverLetter.trim()) {
        formDataToSend.append('coverLetter', formData.coverLetter.trim());
      }
      
      // Add resume file
      formDataToSend.append('resume', formData.resume);

      // Submit to backend API
      const response = await fetch('http://localhost:3000/api/job-applications', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setHasExistingApplication(true);
        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          navigate('/jobs');
        }, 2000);
      } else {
        // Handle validation errors from backend
        if (result.details && Array.isArray(result.details)) {
          const backendErrors = {};
          result.details.forEach(error => {
            backendErrors[error.path || error.param] = error.msg || error.message;
          });
          setErrors(backendErrors);
        }
        
        setSubmitError(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success message component
  if (submitSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received.
              </p>
              <p className="text-sm text-gray-500">Redirecting you back to jobs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Job Details
        </button>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
            <p className="text-gray-600 mb-6">
              {job.company} • {job.location}
            </p>

            {hasExistingApplication && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">You have already applied for this job.</p>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="1234567890"
                        className={`block w-full px-3 py-2 border ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isSubmitting}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience*
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          errors.experience ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                      {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
                    </div>
                    <div>
                      <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                        Highest Education*
                      </label>
                      <select
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          errors.education ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume/CV*</h2>
                  <div 
                    className={`border-2 border-dashed rounded-md px-6 py-10 transition-colors ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : errors.resume 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="mt-4 flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="resume"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="resume"
                            name="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 2MB</p>
                    </div>
                    
                    {formData.resume && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-blue-700 font-medium truncate">
                            {formData.resume.name}
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatFileSize(formData.resume.size)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ml-2 text-red-600 hover:text-red-800 p-1"
                          onClick={() => setFormData({ ...formData, resume: null })}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.resume && <p className="mt-2 text-sm text-red-600">{errors.resume}</p>}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="coverLetter" className="block text-lg font-semibold text-gray-900 mb-4">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    rows={5}
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.coverLetter ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    disabled={isSubmitting}
                    maxLength={2000}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.coverLetter && <p className="text-sm text-red-600">{errors.coverLetter}</p>}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.coverLetter.length}/2000 characters
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    fullWidth
                    className="py-3"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

JobApplicationPage.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }),
};

export default JobApplicationPage;