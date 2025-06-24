import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Share2, Users } from 'lucide-react';
import { events } from '../../data/events';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(events.find((e) => e.id === Number(id)));

  useEffect(() => {
    if (!event) {
      navigate('/events');
    }
    // In a real app, we would fetch event details from an API
  }, [id, navigate, event]);

  if (!event) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <button
            onClick={() => navigate('/events')}
            className="mb-4 flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Events
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
          <p className="text-xl text-white opacity-90">Organized by {event.organizer}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Event Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{event.type}</span>
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end">
                <div className="text-2xl font-bold text-gray-900 mb-4">{event.price}</div>
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/events/${event.id}/register`)}
                    className="px-6 py-3"
                  >
                    Register Now
                  </Button>
                  <Button variant="outline" onClick={shareEvent} className="px-4 py-3">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Agenda</h2>
              <ul className="space-y-3">
                {event.agenda.map((item, index) => (
                  <li key={index} className="text-gray-700 pb-3 border-b border-gray-100 last:border-0">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Speakers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={speaker.imageUrl}
                        alt={speaker.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{speaker.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {speaker.role}, {speaker.company}
                      </p>
                      <p className="text-gray-700 mt-1 text-sm line-clamp-3">{speaker.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Date</div>
                    <div className="text-gray-700">{formatDate(event.date)}</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Time</div>
                    <div className="text-gray-700">{event.time}</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Location</div>
                    <div className="text-gray-700">{event.location}</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Event Type</div>
                    <div className="text-gray-700">{event.type}</div>
                  </div>
                </li>
              </ul>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/events/${event.id}/register`)}
                  fullWidth
                >
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .filter((e) => e.id !== event.id && e.type === event.type)
              .slice(0, 3)
              .map((similarEvent) => (
                <div
                  key={similarEvent.id}
                  className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/events/${similarEvent.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="h-40">
                    <img
                      src={similarEvent.imageUrl}
                      alt={similarEvent.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{similarEvent.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(similarEvent.date)}</p>
                    <p className="text-sm text-gray-600 mt-1">{similarEvent.location}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-blue-600 font-medium">{similarEvent.price}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {similarEvent.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

EventDetailPage.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    organizer: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    agenda: PropTypes.arrayOf(PropTypes.string).isRequired,
    speakers: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        company: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        bio: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
};

export default EventDetailPage;