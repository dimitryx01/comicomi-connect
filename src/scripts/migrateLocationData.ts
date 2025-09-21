/**
 * Script to migrate existing location data to the new centralized system
 * Run this in the browser console after deployment
 */

import { runLocationMigration } from '../utils/runLocationMigration';

// Make it available globally for manual execution
if (typeof window !== 'undefined') {
  (window as any).migrateLocationData = async () => {
    console.log('🚀 Starting location migration...');
    console.log('This will migrate existing restaurants and users to the new centralized location system.');
    
    try {
      const results = await runLocationMigration();
      
      console.log('\n📊 Migration Summary:');
      console.log(`   Total items migrated: ${results.totalMigrated}`);
      console.log(`   Total items failed: ${results.totalFailed}`);
      console.log(`   Restaurants: ${results.restaurants.successful}/${results.restaurants.total}`);
      console.log(`   Users: ${results.users.successful}/${results.users.total}`);
      
      if (results.totalFailed === 0) {
        console.log('\n🎉 ¡Migration completed successfully!');
      } else {
        console.log('\n⚠️ Migration completed with some failures. Check the detailed logs above.');
      }
      
      return results;
    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    }
  };
  
  console.log('📍 Location migration script loaded!');
  console.log('To run the migration, execute: migrateLocationData()');
}