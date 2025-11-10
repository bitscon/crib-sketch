import { supabase } from '@/integrations/supabase/client';

export type BreedingEventType = 'heat_cycle' | 'breeding' | 'pregnancy_confirmation' | 'birth';

export interface BreedingEvent {
  id: string;
  user_id: string;
  animal_id: string;
  event_type: BreedingEventType;
  date: string;
  partner_animal_id?: string | null;
  partner_name?: string | null;
  expected_due_date?: string | null;
  actual_birth_date?: string | null;
  offspring_count?: number | null;
  notes?: string | null;
  property_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const getBreedingEvents = async (userId: string): Promise<BreedingEvent[]> => {
  const { data, error } = await (supabase as any)
    .from('breeding_events')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createBreedingEvent = async (event: Partial<BreedingEvent>): Promise<BreedingEvent> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a breeding event');
  }

  const { data, error } = await (supabase as any)
    .from('breeding_events')
    .insert([{ ...event, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBreedingEvent = async (id: string, event: Partial<BreedingEvent>): Promise<BreedingEvent> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a breeding event');
  }

  const { data, error } = await (supabase as any)
    .from('breeding_events')
    .update(event)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBreedingEvent = async (id: string): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a breeding event');
  }

  const { error } = await (supabase as any)
    .from('breeding_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};

export interface BreedingDashboardData {
  breedingFemales: number;
  pregnant: number;
  lactating: number;
  open: number;
}

export const getBreedingDashboardData = async (userId: string): Promise<BreedingDashboardData> => {
  try {
    const { data: events, error } = await (supabase as any)
      .from('breeding_events')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (!events || events.length === 0) {
      return { breedingFemales: 0, pregnant: 0, lactating: 0, open: 0 };
    }

    // Get unique animal IDs
    const uniqueAnimals = new Set(events.map((e: BreedingEvent) => e.animal_id));
    const breedingFemales = uniqueAnimals.size;

    // Count pregnant: animals with pregnancy_confirmation but no birth event after
    const pregnantAnimals = new Set<string>();
    events
      .filter((e: BreedingEvent) => e.event_type === 'pregnancy_confirmation')
      .forEach((pregEvent: BreedingEvent) => {
        const hasBirth = events.some(
          (e: BreedingEvent) =>
            e.event_type === 'birth' &&
            e.animal_id === pregEvent.animal_id &&
            new Date(e.date) > new Date(pregEvent.date)
        );
        if (!hasBirth) {
          pregnantAnimals.add(pregEvent.animal_id);
        }
      });

    // Count lactating: animals with birth events in last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const lactatingAnimals = new Set(
      events
        .filter(
          (e: BreedingEvent) =>
            e.event_type === 'birth' &&
            new Date(e.date) >= sixtyDaysAgo
        )
        .map((e: BreedingEvent) => e.animal_id)
    );

    const pregnant = pregnantAnimals.size;
    const lactating = lactatingAnimals.size;
    const open = Math.max(0, breedingFemales - pregnant - lactating);

    return { breedingFemales, pregnant, lactating, open };
  } catch (error) {
    console.error('Error fetching breeding dashboard data:', error);
    return { breedingFemales: 0, pregnant: 0, lactating: 0, open: 0 };
  }
};
