import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimalForm } from '@/features/animals/AnimalForm';
import { AnimalList } from '@/features/animals/AnimalList';
import {
  getAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  Animal,
  AnimalInsert,
} from '@/features/animals/api';
import { getProperties, Property } from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function HealthHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [animalsData, propertiesData] = await Promise.all([
        getAnimals(user.id),
        getProperties(user.id),
      ]);
      setAnimals(animalsData);
      setProperties(propertiesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: AnimalInsert) => {
    if (!user?.id) return;

    try {
      const newAnimal = await createAnimal(user.id, data);
      setAnimals([newAnimal, ...animals]);
      setIsCreating(false);
      setSelectedAnimal(newAnimal);
      toast({
        title: 'Success',
        description: 'Animal added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add animal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdate = async (data: AnimalInsert) => {
    if (!user?.id || !selectedAnimal) return;

    try {
      const updated = await updateAnimal(selectedAnimal.id, user.id, data);
      setAnimals(animals.map((a) => (a.id === updated.id ? updated : a)));
      setSelectedAnimal(updated);
      toast({
        title: 'Success',
        description: 'Animal updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update animal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this animal?')) return;

    try {
      await deleteAnimal(id, user.id);
      setAnimals(animals.filter((a) => a.id !== id));
      if (selectedAnimal?.id === id) {
        setSelectedAnimal(null);
      }
      toast({
        title: 'Success',
        description: 'Animal deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete animal',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Health Hub</h1>
          <p className="text-muted-foreground mt-1">Manage animal health and wellness</p>
        </div>

        <Tabs defaultValue="animals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="health-library">Health Library</TabsTrigger>
            <TabsTrigger value="grooming">Grooming</TabsTrigger>
          </TabsList>

          <TabsContent value="animals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Animal List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Animals</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsCreating(true);
                        setSelectedAnimal(null);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimalList
                    animals={animals}
                    selectedId={selectedAnimal?.id}
                    onSelect={(animal) => {
                      setSelectedAnimal(animal);
                      setIsCreating(false);
                    }}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>

              {/* Animal Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {isCreating ? 'Add Animal' : selectedAnimal ? 'Edit Animal' : 'Animal Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCreating || selectedAnimal ? (
                    <AnimalForm
                      animal={selectedAnimal || undefined}
                      properties={properties}
                      onSubmit={isCreating ? handleCreate : handleUpdate}
                      onCancel={() => {
                        setIsCreating(false);
                        setSelectedAnimal(null);
                      }}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Select an animal to view details or add a new one.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Medication tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health-library">
            <Card>
              <CardHeader>
                <CardTitle>Health Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Health resources coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grooming">
            <Card>
              <CardHeader>
                <CardTitle>Grooming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Grooming schedule coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
