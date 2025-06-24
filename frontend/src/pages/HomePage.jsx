import { Briefcase, BookOpen, Calendar, Users, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';

const HomePage = () => {
  const features = [
    {
      name: 'Career Resources',
      description:
        'Access a vast library of career development resources, including guides, templates, and courses.',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
      link: '/resources',
    },
    {
      name: 'Job Opportunities',
      description:
        'Discover job openings across India that match your skills and experience.',
      icon: Briefcase,
      color: 'bg-green-100 text-green-600',
      link: '/jobs',
    },
    {
      name: 'Industry Events',
      description:
        'Stay updated with the latest industry events, workshops, and networking opportunities.',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
      link: '/events',
    },
    {
      name: 'Expert Mentorship',
      description:
        'Connect with industry professionals who can guide you through your career journey.',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      link: '/mentors',
    },
    {
      name: 'Resume Builder',
      description:
        'Create professional resumes with our easy-to-use builder and beautiful templates.',
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-600',
      link: '/tools/resume-builder',
    },
  ];

  return (
    <div>
      <HeroSection />

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Accelerate Your Career Growth
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Everything you need to succeed in your professional journey, all in one place.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {features.map((feature) => (
                <Link key={feature.name} to={feature.link} className="group">
                  <div className="h-full border border-gray-200 bg-white rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                    <div>
                      <div className={`p-3 rounded-md inline-flex items-center justify-center ${feature.color}`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {feature.name}
                      </h3>
                      <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                    </div>
                    <div className="mt-4 flex text-blue-600 font-medium items-center">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:ml-2 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Success Stories
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Hear from professionals who have accelerated their career growth with CareerCompass.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg`}
                        alt="User"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {i === 1 ? 'Priya Sharma' : i === 2 ? 'Raj Kumar' : 'Ananya Patel'}
                      </h4>
                      <p className="text-gray-500">
                        {i === 1 ? 'Software Engineer' : i === 2 ? 'UX Designer' : 'Data Analyst'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">
                    {i === 1
                      ? "CareerCompass helped me find the perfect mentor who guided me through my career transition. The resources were invaluable and I landed my dream job within 3 months!"
                      : i === 2
                      ? "The events hosted through this platform gave me networking opportunities I couldn't have found elsewhere. I've grown my professional circle and found collaborators for my projects."
                      : "The structured resources and job listings tailored to my skills made my job search efficient and targeted. I'm now working at a top company in Bangalore!"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to accelerate your career?</span>
            <span className="block text-blue-200">Start your journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/resources"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                Explore resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;