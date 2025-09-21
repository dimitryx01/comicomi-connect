import { batchMigrateRestaurants, batchMigrateUsers } from './locationMigration';

/**
 * Script to run the location migration
 * This should be called manually after the new location system is deployed
 */
export const runLocationMigration = async () => {
  console.log('🚀 Starting location migration process...');
  
  try {
    // Migrate restaurants first
    console.log('\n📍 Phase 1: Migrating restaurants...');
    const restaurantResults = await batchMigrateRestaurants();
    
    console.log(`\n✅ Restaurant migration complete:`);
    console.log(`   Total: ${restaurantResults.total}`);
    console.log(`   Successful: ${restaurantResults.successful}`);
    console.log(`   Failed: ${restaurantResults.failed}`);
    
    if (restaurantResults.failed > 0) {
      console.log('\n❌ Failed restaurant migrations:');
      restaurantResults.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.originalValue}: ${r.error}`));
    }

    // Migrate users
    console.log('\n👤 Phase 2: Migrating users...');
    const userResults = await batchMigrateUsers();
    
    console.log(`\n✅ User migration complete:`);
    console.log(`   Total: ${userResults.total}`);
    console.log(`   Successful: ${userResults.successful}`);
    console.log(`   Failed: ${userResults.failed}`);
    
    if (userResults.failed > 0) {
      console.log('\n❌ Failed user migrations:');
      userResults.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.originalValue}: ${r.error}`));
    }

    console.log('\n🎉 Location migration process completed successfully!');
    
    return {
      restaurants: restaurantResults,
      users: userResults,
      totalMigrated: restaurantResults.successful + userResults.successful,
      totalFailed: restaurantResults.failed + userResults.failed
    };
    
  } catch (error) {
    console.error('💥 Migration process failed:', error);
    throw error;
  }
};

// Helper function to run migration from console
if (typeof window !== 'undefined') {
  (window as any).runLocationMigration = runLocationMigration;
}