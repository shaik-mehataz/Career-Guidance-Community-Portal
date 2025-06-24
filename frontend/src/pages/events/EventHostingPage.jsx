import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';

const EventHostingPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    locationType: 'In-person',
    price: '',
    capacity: '',
    categories: '',
    image: null,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['title', 'organizer', 'description', 'date', 'startTime', 'endTime', 'location', 'locationType'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (!formData.image) {
      newErrors.image = 'Event image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        // Show success message and redirect
        navigate('/events');
      }, 1500);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/events')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Events
        </button>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Host an Event</h1>
            <p className="text-gray-600 mb-6">
              Fill out the form below to submit your event for approval. Our team will review your submission and get back to you within 48 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                      Organizer/Organization Name*
                    </label>
                    <input
                      type="text"
                      id="organizer"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.organizer ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.organizer && <p className="mt-1 text-sm text-red-600">{errors.organizer}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Provide a detailed description of your event..."
                    ></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Date and Time</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date*
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time*
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.startTime ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time*
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.endTime ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="locationType" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type*
                    </label>
                    <select
                      id="locationType"
                      name="locationType"
                      value={formData.locationType}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.locationType ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="In-person">In-person</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    {errors.locationType && <p className="mt-1 text-sm text-red-600">{errors.locationType}</p>}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.locationType === 'Virtual'
                        ? 'Virtual Meeting Link*'
                        : formData.locationType === 'Hybrid'
                        ? 'Venue Address & Virtual Link*'
                        : 'Venue Address*'}
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder={
                        formData.locationType === 'Virtual'
                          ? 'e.g., Zoom link, Google Meet, etc.'
                          : 'Full address with city and pincode'
                      }
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Price (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0 for free events"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Leave blank for unlimited"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                      Categories/Tags
                    </label>
                    <input
                      type="text"
                      id="categories"
                      name="categories"
                      value={formData.categories}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Technology, Career, Networking (comma separated)"
                    />
                  </div>
                </div>
              </div>

              {/* Event Image */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload an image</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  {formData.image && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-center">
                      <div className="text-sm text-blue-700 flex-1">{formData.image.name}</div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setFormData({ ...formData, image: null })}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      event hosting terms
                    </a>{' '}
                    and confirm that the information provided is accurate
                  </label>
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
                  {isSubmitting ? 'Submitting...' : 'Submit Event for Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

EventHostingPage.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string,
    organizer: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    location: PropTypes.string,
    locationType: PropTypes.oneOf(['In-person', 'Virtual', 'Hybrid']),
    price: PropTypes.string,
    capacity: PropTypes.string,
    categories: PropTypes.string,
    image: PropTypes.instanceOf(File),
  }),
};

export default EventHostingPage;