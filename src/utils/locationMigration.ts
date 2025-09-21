import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for migrating existing location data to the new centralized system
 */

export interface LocationMigrationResult {
  success: boolean;
  locationId?: string;
  originalValue: string;
  error?: string;
}

/**
 * Find best matching location for a given city/location string
 */
export const findBestLocationMatch = async (cityString: string): Promise<LocationMigrationResult> => {
  if (!cityString || cityString.trim() === '') {
    return {
      success: false,
      originalValue: cityString,
      error: 'Empty city string'
    };
  }

  try {
    // Use the intelligent search function to find matches
    const { data, error } = await supabase.rpc('search_locations_intelligent', {
      search_query: cityString.trim(),
      p_limit: 5
    });

    if (error) throw error;

    if (data && data.length > 0) {
      // Take the best match (highest relevance score)
      const bestMatch = data[0];
      
      return {
        success: true,
        locationId: bestMatch.id,
        originalValue: cityString,
      };
    }

    return {
      success: false,
      originalValue: cityString,
      error: 'No matching location found'
    };
  } catch (error) {
    console.error('Error finding location match:', error);
    return {
      success: false,
      originalValue: cityString,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Migrate a restaurant's location to the new system
 */
export const migrateRestaurantLocation = async (
  restaurantId: string, 
  currentLocation?: string,
  currentAddress?: string
): Promise<LocationMigrationResult> => {
  // Try to find a match using location first, then address
  const searchString = currentLocation || currentAddress || '';
  
  if (!searchString) {
    return {
      success: false,
      originalValue: '',
      error: 'No location or address data available'
    };
  }

  const matchResult = await findBestLocationMatch(searchString);
  
  if (matchResult.success && matchResult.locationId) {
    try {
      // Update the restaurant with the new location_id
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ 
          location_id: matchResult.locationId,
          street_address: currentAddress // Preserve specific address
        })
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      console.log(`✅ Restaurant ${restaurantId} migrated to location ${matchResult.locationId}`);
      return matchResult;
    } catch (error) {
      console.error('Error updating restaurant location:', error);
      return {
        success: false,
        originalValue: searchString,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  return matchResult;
};

/**
 * Migrate a user's city to the new system
 */
export const migrateUserLocation = async (
  userId: string, 
  currentCity?: string
): Promise<LocationMigrationResult> => {
  if (!currentCity) {
    return {
      success: false,
      originalValue: '',
      error: 'No city data available'
    };
  }

  const matchResult = await findBestLocationMatch(currentCity);
  
  if (matchResult.success && matchResult.locationId) {
    try {
      // Update the user with the new home_location_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ home_location_id: matchResult.locationId })
        .eq('id', userId);

      if (updateError) throw updateError;

      console.log(`✅ User ${userId} migrated to location ${matchResult.locationId}`);
      return matchResult;
    } catch (error) {
      console.error('Error updating user location:', error);
      return {
        success: false,
        originalValue: currentCity,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  return matchResult;
};

/**
 * Batch migrate all restaurants
 */
export const batchMigrateRestaurants = async (): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: LocationMigrationResult[];
}> => {
  try {
    // Get all restaurants without location_id
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, location, address')
      .is('location_id', null);

    if (error) throw error;

    const results: LocationMigrationResult[] = [];
    let successful = 0;
    let failed = 0;

    console.log(`🔄 Starting migration of ${restaurants?.length || 0} restaurants...`);

    if (restaurants) {
      for (const restaurant of restaurants) {
        console.log(`🏪 Migrating restaurant: ${restaurant.name}`);
        
        const result = await migrateRestaurantLocation(
          restaurant.id,
          restaurant.location,
          restaurant.address
        );

        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
          console.warn(`❌ Failed to migrate restaurant ${restaurant.name}: ${result.error}`);
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Migration complete: ${successful} successful, ${failed} failed`);

    return {
      total: restaurants?.length || 0,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('Error in batch restaurant migration:', error);
    throw error;
  }
};

/**
 * Batch migrate all users
 */
export const batchMigrateUsers = async (): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: LocationMigrationResult[];
}> => {
  try {
    // Get all users without home_location_id but with city data
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, city')
      .is('home_location_id', null)
      .not('city', 'is', null);

    if (error) throw error;

    const results: LocationMigrationResult[] = [];
    let successful = 0;
    let failed = 0;

    console.log(`🔄 Starting migration of ${users?.length || 0} users...`);

    if (users) {
      for (const user of users) {
        console.log(`👤 Migrating user: ${user.full_name || user.id}`);
        
        const result = await migrateUserLocation(user.id, user.city);

        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
          console.warn(`❌ Failed to migrate user ${user.full_name || user.id}: ${result.error}`);
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ User migration complete: ${successful} successful, ${failed} failed`);

    return {
      total: users?.length || 0,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('Error in batch user migration:', error);
    throw error;
  }
};