import { Briefcase, Calendar, BookOpen, Users, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../common/Card';

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

const FeaturedSection = () => {
  return (
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
                <Card className="h-full transition-all duration-300 group-hover:shadow-lg">
                  <CardBody>
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
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;