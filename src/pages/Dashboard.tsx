import { Link } from 'react-router-dom';
import { 
  Target, 
  BookOpen, 
  DollarSign, 
  Package, 
  Heart, 
  Calendar, 
  MapPin 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'there';

  const features = [
    {
      title: 'Property Assessment',
      description: 'Manage and assess your properties',
      icon: MapPin,
      href: '/property-assessment',
      color: 'text-blue-500',
    },
    {
      title: 'Seasonal Calendar',
      description: 'Track seasonal activities and tasks',
      icon: Calendar,
      href: '/seasonal-calendar',
      color: 'text-green-500',
    },
    {
      title: 'Health Hub',
      description: 'Monitor animal health and records',
      icon: Heart,
      href: '/health-hub',
      color: 'text-red-500',
    },
    {
      title: 'Inventory Management',
      description: 'Track supplies and stock levels',
      icon: Package,
      href: '/inventory',
      color: 'text-orange-500',
    },
    {
      title: 'Homestead Balance',
      description: 'Manage finances and transactions',
      icon: DollarSign,
      href: '/homestead-balance',
      color: 'text-yellow-500',
    },
    {
      title: 'Homestead Journal',
      description: 'Document your homestead journey',
      icon: BookOpen,
      href: '/homestead-journal',
      color: 'text-purple-500',
    },
    {
      title: 'Homestead Goals',
      description: 'Set and track your homestead goals',
      icon: Target,
      href: '/homestead-goals',
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your homestead from your dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} to={feature.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
