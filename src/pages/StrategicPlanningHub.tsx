import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { useNavigate } from "react-router-dom";
import { MapPin, Sprout, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/features/properties/api";
import { getTasks } from "@/features/tasks/api";
import { getInfrastructureProjects } from "@/features/infrastructure/api";

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

export default function StrategicPlanningHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["properties", user?.id],
    queryFn: () => getProperties(user!.id),
    enabled: !!user,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => getTasks(user!.id),
    enabled: !!user,
  });

  const { data: infrastructureProjects = [] } = useQuery({
    queryKey: ["infrastructure", user?.id],
    queryFn: () => getInfrastructureProjects(user!.id),
    enabled: !!user,
  });

  const incompleteTasks = tasks.filter((task) => task.status !== "completed").length;
  const currentSeason = getCurrentSeason();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Strategic Planning Hub
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan, assess, and strategically manage your homestead's future
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/property-assessment")}
              variant="outline"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Assess Property
            </Button>
            <Button
              onClick={() => navigate("/crop-planner")}
              className="gap-2"
            >
              <Sprout className="h-4 w-4" />
              Plan Crops
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Properties"
            value={properties.length}
            description="Mapped areas"
            icon={MapPin}
            tone="blue"
          />
          <StatCard
            title="Planning Tasks"
            value={incompleteTasks}
            description="Strategic items"
            icon={Calendar}
            tone="amber"
          />
          <StatCard
            title="Projects"
            value={infrastructureProjects.length}
            description="In planning"
            icon={TrendingUp}
            tone="green"
          />
          <StatCard
            title="Season"
            value={currentSeason}
            description="Current growing"
            tone="neutral"
          />
        </div>
      </div>
    </div>
  );
}
