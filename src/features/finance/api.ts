import { supabase } from '@/integrations/supabase/client';

export interface FinancialCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at?: string;
}

export interface CategoryInsert {
  name: string;
  type: 'income' | 'expense';
}

export interface CategoryUpdate {
  name?: string;
  type?: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  notes: string | null;
  category_id: string | null;
  property_id: string | null;
  created_at?: string;
}

export interface TransactionInsert {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  notes?: string | null;
  category_id?: string | null;
  property_id?: string | null;
}

export interface TransactionUpdate {
  date?: string;
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  notes?: string | null;
  category_id?: string | null;
  property_id?: string | null;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  property_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}

// Category API
export async function getCategories(userId: string) {
  const { data, error } = await (supabase as any)
    .from('financial_categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as FinancialCategory[];
}

export async function createCategory(userId: string, category: CategoryInsert) {
  const { data, error } = await (supabase as any)
    .from('financial_categories')
    .insert({
      ...category,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FinancialCategory;
}

export async function updateCategory(id: string, userId: string, category: CategoryUpdate) {
  const { data, error } = await (supabase as any)
    .from('financial_categories')
    .update(category)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as FinancialCategory;
}

export async function deleteCategory(id: string, userId: string) {
  const { error } = await (supabase as any)
    .from('financial_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// Transaction API
export async function getTransactions(userId: string, filters?: TransactionFilters) {
  let query = (supabase as any)
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.property_id) {
    query = query.eq('property_id', filters.property_id);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.start_date) {
    query = query.gte('date', filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte('date', filters.end_date);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Transaction[];
}

export async function createTransaction(userId: string, transaction: TransactionInsert) {
  const { data, error } = await (supabase as any)
    .from('transactions')
    .insert({
      ...transaction,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function updateTransaction(id: string, userId: string, transaction: TransactionUpdate) {
  const { data, error } = await (supabase as any)
    .from('transactions')
    .update(transaction)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string, userId: string) {
  const { error } = await (supabase as any)
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
