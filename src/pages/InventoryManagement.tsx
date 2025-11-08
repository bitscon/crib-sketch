import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryForm } from '@/features/inventory/InventoryForm';
import { InventoryList } from '@/features/inventory/InventoryList';
import { LowStockAlert } from '@/features/inventory/LowStockAlert';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  InventoryItem,
  InventoryItemInsert,
} from '@/features/inventory/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InventoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadInventory();
    }
  }, [user?.id]);

  const loadInventory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getInventory(user.id);
      setItems(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: InventoryItemInsert) => {
    if (!user?.id) return;

    try {
      const newItem = await createInventoryItem(user.id, data);
      setItems([newItem, ...items]);
      setIsCreating(false);
      setSelectedItem(newItem);
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdate = async (data: InventoryItemInsert) => {
    if (!user?.id || !selectedItem) return;

    try {
      const updated = await updateInventoryItem(selectedItem.id, user.id, data);
      setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      setSelectedItem(updated);
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteInventoryItem(id, user.id);
      setItems(items.filter((i) => i.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
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
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track supplies and materials</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="mb-6">
          <LowStockAlert
            items={items}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setIsCreating(false);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Items</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedItem(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <InventoryList
                items={items}
                selectedId={selectedItem?.id}
                onSelect={(item) => {
                  setSelectedItem(item);
                  setIsCreating(false);
                }}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {/* Inventory Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Add Item' : selectedItem ? 'Edit Item' : 'Item Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCreating || selectedItem ? (
                <InventoryForm
                  item={selectedItem || undefined}
                  onSubmit={isCreating ? handleCreate : handleUpdate}
                  onCancel={() => {
                    setIsCreating(false);
                    setSelectedItem(null);
                  }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select an item to view details or add a new one.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
