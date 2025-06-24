import { useState } from 'react';
import { Search, Filter, Star, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mentors } from '../../data/mentors';
import PropTypes from 'prop-types';

const MentorsPage = () => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  // Extract unique expertise areas
  const expertiseAreas = Array.from(
    new Set(mentors.flatMap((mentor) => mentor.expertise))
  ).sort();

  // Experience ranges
  const experienceRanges = [
    { value: '', label: 'All Experience Levels' },
    { value: '0-5', label: '0-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' },
  ];

  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.title.toLowerCase().includes(search.toLowerCase()) ||
      mentor.company.toLowerCase().includes(search.toLowerCase()) ||
      mentor.expertise.some((skill) => skill.toLowerCase().includes(search.toLowerCase()));

    const matchesExpertise =
      selectedExpertise === '' ||
      mentor.expertise.some((skill) => skill === selectedExpertise);

    const matchesExperience =
      selectedExperience === '' ||
      (selectedExperience === '0-5' && mentor.experience < 5) ||
      (selectedExperience === '5-10' && mentor.experience >= 5 && mentor.experience < 10) ||
      (selectedExperience === '10+' && mentor.experience >= 10);

    return matchesSearch && matchesExpertise && matchesExperience;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find a Mentor
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Connect with experienced professionals who can guide you through your career journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search mentors by name, title, company, or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">
                  Area of Expertise
                </label>
                <select
                  id="expertise"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                >
                  <option value="">All Expertise Areas</option>
                  {expertiseAreas.map((expertise) => (
                    <option key={expertise} value={expertise}>
                      {expertise}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  id="experience"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                >
                  {experienceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Mentors Grid */}
        <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <Link
              key={mentor.id}
              to={`/mentors/${mentor.id}`}
              className="group bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-16 w-16 mr-4">
                    <img
                      src={mentor.imageUrl}
                      alt={mentor.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {mentor.name}
                    </h2>
                    <p className="text-gray-600">{mentor.title}</p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {mentor.company}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {mentor.location}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(mentor.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-600">
                      {mentor.rating} ({mentor.reviews} reviews)
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">Expertise:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {mentor.experience} years experience
                  </span>
                  <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-800">
                    View Profile
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No mentors found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

MentorsPage.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.number.isRequired,
    experience: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired,
  }),
};

export default MentorsPage;