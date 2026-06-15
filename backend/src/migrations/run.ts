import dataSource from '../data-source';


async function main() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const pendingMigrations = dataSource.migrations.filter(m => !(m as any).isExecuted);

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    await dataSource.destroy();
    return;
  }

  console.log(`Running ${pendingMigrations.length} pending migrations...`);
  await dataSource.runMigrations();
  console.log('Migrations completed successfully');

  await dataSource.destroy();
}

main().catch(err => {
  console.error('Error running migrations:', err);
  process.exit(1);
});
