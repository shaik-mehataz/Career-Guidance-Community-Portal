import { useState } from 'react';
import { Search, MapPin, Clock, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { events } from '../../data/events';
import { mentors } from '../../data/mentors';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const EventsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const { user } = useAuth();

  // Extract unique locations and event types
  const locations = Array.from(new Set(events.map((event) => event.location.split(',')[0].trim())));
  const eventTypes = Array.from(new Set(events.map((event) => event.type)));

  // User type options
  const userTypes = [
    { value: '', label: 'All Users' },
    { value: 'student', label: 'Student' },
    { value: 'jobseeker', label: 'Job Seeker' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'employer', label: 'Employer' }
  ];

  // Get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get recommended events for mentors based on their expertise
  const getRecommendedEvents = () => {
    if (!user || selectedUserType !== 'mentor') return [];

    // Find the mentor's expertise
    const mentor = mentors.find(m => m.name === user.name);
    if (!mentor) return [];

    // Match events with mentor's expertise
    return events.filter(event => {
      const matchesExpertise = mentor.expertise.some(skill =>
        event.description.toLowerCase().includes(skill.toLowerCase()) ||
        event.title.toLowerCase().includes(skill.toLowerCase())
      );
      const isTargetAudience = event.targetAudience.includes('mentor');
      return matchesExpertise || isTargetAudience;
    }).slice(0, 3);
  };

  // Filter events based on search, location, type, and user type
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.organizer.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = selectedLocation === '' || event.location.includes(selectedLocation);
    const matchesType = selectedType === '' || event.type === selectedType;
    const matchesUserType = selectedUserType === '' || event.targetAudience.includes(selectedUserType);
    return matchesSearch && matchesLocation && matchesType && matchesUserType;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const upcomingEvents = getUpcomingEvents();
  const recommendedEvents = getRecommendedEvents();

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Events & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Discover upcoming events, workshops, and networking opportunities.
          </p>
          <div className="mt-6">
            <Link to="/events/host">
              <Button variant="outline" className="inline-flex items-center">
                Host an Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Events in Next 30 Days</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 h-96"
              >
                <div className="h-48">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 h-48 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 truncate">{event.organizer}</p>
                  <div className="space-y-1 mb-3 flex-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-600 font-medium">{event.price}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                  </div>
                  
                  {/* Action Buttons - Fixed at Bottom */}
                  <div className="flex gap-3 mt-auto">
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full h-10 flex items-center justify-center"
                      >
                        <span className="whitespace-nowrap">View Details</span>
                      </Button>
                    </Link>
                    <Link to={`/events/${event.id}/register`} className="flex-1">
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="w-full h-10 flex items-center justify-center"
                      >
                        <span className="whitespace-nowrap">Register</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search events..."
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
              <option value="">All Event Types</option>
              {eventTypes.map((type) => (
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

        {/* Recommended Events for Mentors */}
        {selectedUserType === 'mentor' && recommendedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 h-96"
                >
                  <div className="h-48">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 h-48 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 truncate">{event.organizer}</p>
                    <div className="space-y-1 mb-3 flex-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-blue-600 font-medium">{event.price}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.type}
                      </span>
                    </div>
                    
                    {/* Action Buttons - Fixed at Bottom */}
                    <div className="flex gap-3 mt-auto">
                      <Link to={`/events/${event.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full h-10 flex items-center justify-center"
                        >
                          <span className="whitespace-nowrap">View Details</span>
                        </Button>
                      </Link>
                      <Link to={`/events/${event.id}/register`} className="flex-1">
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="w-full h-10 flex items-center justify-center"
                        >
                          <span className="whitespace-nowrap">Register</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Events List */}
        <div className="mt-8 space-y-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover md:w-48 md:h-full"
                    src={event.imageUrl}
                    alt={event.title}
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {event.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">{event.organizer}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {event.type}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-gray-600 line-clamp-2">{event.description}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">{event.price}</span>
                    <div className="flex space-x-2">
                      <Link to={`/events/${event.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-10 flex items-center justify-center"
                        >
                          <span className="whitespace-nowrap">View Details</span>
                        </Button>
                      </Link>
                      <Link to={`/events/${event.id}/register`}>
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="h-10 flex items-center justify-center"
                        >
                          <span className="whitespace-nowrap">Register</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No events found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;