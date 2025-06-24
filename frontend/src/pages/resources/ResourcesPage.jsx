import { useState } from 'react';
import { Search, Bookmark, BookmarkCheck, User, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resources } from '../../data/resources';
import { mentors } from '../../data/mentors';
import { jobs } from '../../data/jobs';
import { useAuth } from '../../context/AuthContext';

const ResourcesPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const { user, saveResource, unsaveResource } = useAuth();

  // Extract unique categories
  const categories = Array.from(new Set(resources.map((resource) => resource.category)));

  // User type options
  const userTypes = [
    { value: '', label: 'All Users' },
    { value: 'student', label: 'Student' },
    { value: 'jobseeker', label: 'Job Seeker' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'employer', label: 'Employer' }
  ];

  // Filter resources based on search, category, and user type
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase()) ||
      resource.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || resource.category === selectedCategory;
    const matchesUserType = selectedUserType === '' || resource.targetAudience.includes(selectedUserType);
    return matchesSearch && matchesCategory && matchesUserType;
  });

  // Get recommended resources based on user type
  const getRecommendedResources = () => {
    if (!selectedUserType) return [];

    const recommendations = {
      student: [
        'Programming Languages',
        'Interview Preparation',
        'Project Development'
      ],
      jobseeker: [
        'Resume Building',
        'Interview Preparation',
        'Career Development'
      ],
      mentor: [
        'Teaching Methodologies',
        'Leadership Skills',
        'Professional Development'
      ],
      employer: [
        'HR Management',
        'Team Leadership',
        'Recruitment Strategies'
      ]
    };

    const relevantTopics = recommendations[selectedUserType] || [];
    return resources.filter(resource =>
      relevantTopics.some(topic =>
        resource.title.toLowerCase().includes(topic.toLowerCase()) ||
        resource.description.toLowerCase().includes(topic.toLowerCase())
      )
    ).slice(0, 3);
  };

  // Get relevant mentors based on user type
  const getRelevantMentors = () => {
    if (!selectedUserType) return [];

    const expertiseMap = {
      student: ['Programming', 'Academic Guidance', 'Project Development'],
      jobseeker: ['Career Coaching', 'Interview Preparation', 'Industry Expertise'],
      mentor: ['Leadership', 'Teaching', 'Professional Development'],
      employer: ['HR Management', 'Team Leadership', 'Recruitment']
    };

    const relevantExpertise = expertiseMap[selectedUserType] || [];
    return mentors.filter(mentor =>
      mentor.expertise.some(skill =>
        relevantExpertise.some(exp => skill.toLowerCase().includes(exp.toLowerCase()))
      )
    ).slice(0, 3);
  };

  // Get relevant jobs based on user type
  const getRelevantJobs = () => {
    if (!selectedUserType) return [];

    const jobCategories = {
      student: ['Internship', 'Entry Level', 'Graduate'],
      jobseeker: ['Mid Level', 'Senior Level'],
      mentor: ['Teaching', 'Training', 'Mentorship'],
      employer: ['HR', 'Recruitment', 'Management']
    };

    const relevantCategories = jobCategories[selectedUserType] || [];
    return jobs.filter(job =>
      relevantCategories.some(category =>
        job.title.toLowerCase().includes(category.toLowerCase()) ||
        job.description.toLowerCase().includes(category.toLowerCase())
      )
    ).slice(0, 3);
  };

  const recommendedResources = getRecommendedResources();
  const relevantMentors = getRelevantMentors();
  const relevantJobs = getRelevantJobs();

  const handleSaveResource = (id) => {
    if (user?.savedResources.includes(id)) {
      unsaveResource(id);
    } else {
      saveResource(id);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Career Resources
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Explore our curated collection of career development resources to help you achieve your professional goals.
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
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
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

        {/* Recommended Resources */}
        {selectedUserType && recommendedResources.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for {selectedUserType}s</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="relative h-48">
                    <img
                      className="w-full h-full object-cover"
                      src={resource.imageUrl}
                      alt={resource.title}
                    />
                    {user && (
                      <button
                        onClick={() => handleSaveResource(resource.id)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all"
                        title={user.savedResources.includes(resource.id) ? "Unsave resource" : "Save resource"}
                      >
                        {user.savedResources.includes(resource.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Bookmark className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                      {resource.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <Link
                      to={`/resources/${resource.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relevant Mentors */}
        {selectedUserType && relevantMentors.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Mentors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relevantMentors.map((mentor) => (
                <Link
                  key={mentor.id}
                  to={`/mentors/${mentor.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={mentor.imageUrl}
                        alt={mentor.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                        <p className="text-sm text-gray-600">{mentor.title}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      {mentor.resources && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700">Featured Resources:</p>
                          <ul className="mt-2 space-y-2">
                            {mentor.resources.slice(0, 2).map((resource, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                • {resource.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Relevant Jobs */}
        {selectedUserType && relevantJobs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Opportunities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relevantJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          src={job.imageUrl}
                          alt={job.company}
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                      <p className="mt-2 text-sm font-medium text-blue-600">{job.salary}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Resources Grid */}
        <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src={resource.imageUrl}
                  alt={resource.title}
                />
                {user && (
                  <button
                    onClick={() => handleSaveResource(resource.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all"
                    title={user.savedResources.includes(resource.id) ? "Unsave resource" : "Save resource"}
                  >
                    {user.savedResources.includes(resource.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Bookmark className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                    )}
                  </button>
                )}
              </div>
              <div className="p-5">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                  {resource.category}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <Link
                  to={`/resources/${resource.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No resources found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;