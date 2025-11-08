import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryManager } from '@/features/finance/CategoryManager';
import { TransactionTable } from '@/features/finance/TransactionTable';
import { TransactionForm } from '@/features/finance/TransactionForm';
import { FinanceDashboard } from '@/features/finance/FinanceDashboard';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  FinancialCategory,
  Transaction,
  CategoryInsert,
  TransactionInsert,
  TransactionFilters,
} from '@/features/finance/api';
import { getProperties, Property } from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function HomesteadBalance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({});

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [filters, user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [categoriesData, transactionsData, propertiesData] = await Promise.all([
        getCategories(user.id),
        getTransactions(user.id),
        getProperties(user.id),
      ]);
      setCategories(categoriesData);
      setTransactions(transactionsData);
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

  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      const data = await getTransactions(user.id, filters);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // Category handlers
  const handleCreateCategory = async (data: CategoryInsert) => {
    if (!user?.id) return;

    try {
      const newCategory = await createCategory(user.id, data);
      setCategories([...categories, newCategory]);
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateCategory = async (id: string, data: CategoryInsert) => {
    if (!user?.id) return;

    try {
      const updated = await updateCategory(id, user.id, data);
      setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id, user.id);
      setCategories(categories.filter((c) => c.id !== id));
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  // Transaction handlers
  const handleCreateTransaction = async (data: TransactionInsert) => {
    if (!user?.id) return;

    try {
      const newTransaction = await createTransaction(user.id, data);
      setTransactions([newTransaction, ...transactions]);
      setIsTransactionDialogOpen(false);
      setSelectedTransaction(null);
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateTransaction = async (data: TransactionInsert) => {
    if (!user?.id || !selectedTransaction) return;

    try {
      const updated = await updateTransaction(selectedTransaction.id, user.id, data);
      setTransactions(transactions.map((t) => (t.id === updated.id ? updated : t)));
      setIsTransactionDialogOpen(false);
      setSelectedTransaction(null);
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteTransaction(id, user.id);
      setTransactions(transactions.filter((t) => t.id !== id));
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDialogOpen(true);
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
          <h1 className="text-3xl font-bold text-foreground">Homestead Balance</h1>
          <p className="text-muted-foreground mt-1">Track income and expenses</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FinanceDashboard transactions={transactions} />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={transactions.slice(0, 10)}
                  categories={categories}
                  properties={properties}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setSelectedTransaction(null);
                  setIsTransactionDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={transactions}
                  categories={categories}
                  properties={properties}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  onFilterChange={(newFilters) => {
                    setFilters({
                      type: newFilters.type as 'income' | 'expense' | undefined,
                      property_id: newFilters.property_id,
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager
              categories={categories}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={selectedTransaction || undefined}
              categories={categories}
              properties={properties}
              onSubmit={selectedTransaction ? handleUpdateTransaction : handleCreateTransaction}
              onCancel={() => {
                setIsTransactionDialogOpen(false);
                setSelectedTransaction(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
