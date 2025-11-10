import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyForm } from '@/features/properties/PropertyForm';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  Property,
  PropertyInsert,
} from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyAssessment() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadProperties();
    }
  }, [user?.id]);

  const loadProperties = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getProperties(user.id);
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PropertyInsert) => {
    if (!user?.id) return;

    try {
      if (selectedProperty) {
        // Update existing property
        const updated = await updateProperty(selectedProperty.id, user.id, data);
        setProperties(properties.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Property updated successfully');
      } else {
        // Create new property
        const newProperty = await createProperty(user.id, data);
        setProperties([newProperty, ...properties]);
        toast.success('Property created successfully');
      }
      setIsCreating(true);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Failed to save property:', error);
      toast.error(selectedProperty ? 'Failed to update property' : 'Failed to create property');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await deleteProperty(id, user.id);
      setProperties(properties.filter((p) => p.id !== id));
      if (selectedProperty?.id === id) {
        setSelectedProperty(null);
        setIsCreating(true);
      }
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsCreating(false);
  };

  const handleNewProperty = () => {
    setSelectedProperty(null);
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Property Assessment
          </h1>
          <p className="text-muted-foreground">
            Map and analyze your homestead properties
          </p>
        </div>
        <Button onClick={handleNewProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Property Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg font-semibold">
              {isCreating ? 'New Property Assessment' : `Edit: ${selectedProperty?.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <PropertyForm
                property={selectedProperty || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsCreating(true);
                  setSelectedProperty(null);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Right: Property Details */}
        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg font-semibold">
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedProperty ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Property Name
                  </h3>
                  <p className="text-base font-semibold">{selectedProperty.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Size
                  </h3>
                  <p className="text-base">{selectedProperty.size_acres} acres</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Location
                  </h3>
                  <p className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedProperty.location}
                  </p>
                </div>
                {selectedProperty.climate_zone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Climate Zone
                    </h3>
                    <Badge variant="secondary">{selectedProperty.climate_zone}</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Select a property to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Properties List */}
      <Card>
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-lg font-semibold">
            Your Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No properties yet"
              description="Add your first property to start mapping your homestead"
              action={
                <Button onClick={handleNewProperty}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-lg">{property.name}</h3>
                      {property.climate_zone && (
                        <Badge variant="secondary">{property.climate_zone}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-semibold">
                        {property.size_acres} acres
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
