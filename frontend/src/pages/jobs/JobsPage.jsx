import { useState } from 'react';
import { Search, MapPin, Clock, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobs } from '../../data/jobs';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';

const JobsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const { user } = useAuth();

  // Extract unique locations and job types
  const locations = Array.from(new Set(jobs.map((job) => job.location.split(',')[0].trim())));
  const jobTypes = Array.from(new Set(jobs.map((job) => job.type)));

  // User type options
  const userTypes = [
    { value: '', label: 'All Users' },
    { value: 'student', label: 'Student' },
    { value: 'jobseeker', label: 'Job Seeker' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'employer', label: 'Employer' }
  ];

  // Filter jobs based on search, location, type, and user type
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = selectedLocation === '' || job.location.includes(selectedLocation);
    const matchesType = selectedType === '' || job.type === selectedType;
    const matchesUserType = selectedUserType === '' || job.category === selectedUserType;
    return matchesSearch && matchesLocation && matchesType && matchesUserType;
  });

  // Calculate days ago for posted date
  const getDaysAgo = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Job Opportunities
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Find your next career opportunity from our curated list of openings across India.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search jobs by title, company, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Job Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
            >
              {userTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs Grid - Uniform Card Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md h-80"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex gap-4 flex-1">
                  {/* Job Image - Fixed Size */}
                  <div className="flex-shrink-0">
                    <img
                      src={job.imageUrl}
                      alt={job.company}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>

                  {/* Job Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Header with Title and Tag */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {job.title}
                      </h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        {job.type}
                      </span>
                    </div>
                    
                    {/* Company */}
                    <p className="text-base text-gray-600 mb-2 truncate">{job.company}</p>
                    
                    {/* Location and Date */}
                    <div className="flex flex-col gap-1 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Posted {getDaysAgo(job.postedDate)} days ago</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
                      {job.description}
                    </p>
                    
                    {/* Salary */}
                    <div className="mb-4">
                      <p className="text-lg font-medium text-gray-900">{job.salary}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Fixed at Bottom */}
                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                  <Link to={`/jobs/${job.id}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full h-10 flex items-center justify-center"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span className="whitespace-nowrap">View Details</span>
                    </Button>
                  </Link>
                  <Link to={`/jobs/${job.id}/apply`} className="flex-1">
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="w-full h-10 flex items-center justify-center"
                    >
                      <span className="whitespace-nowrap">Apply Now</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No jobs found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

JobsPage.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    salary: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    postedDate: PropTypes.string.isRequired,
    category: PropTypes.oneOf(['student', 'jobseeker', 'mentor', 'employer']).isRequired,
  }),
};

export default JobsPage;