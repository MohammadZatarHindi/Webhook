/* Migration: Add updated_at columns and triggers
   - Adds updated_at to pipelines, subscribers, and subscriptions tables
   - Creates a reusable trigger function update_updated_at_column
   - Attaches triggers to tables with updated_at so they auto-update on row updates
   - Jobs and deliveries are left untouched (jobs already has updated_at, deliveries uses attempted_at)
*/

exports.up = async (pgm) => {
  // -----------------------------
  // Add updated_at columns
  // -----------------------------
  pgm.alterTable('pipelines', {
    addColumns: { 
      updated_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') } 
    }
  });

  pgm.alterTable('subscribers', {
    addColumns: { 
      updated_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') } 
    }
  });

  pgm.alterTable('subscriptions', {
    addColumns: { 
      updated_at: { type: 'timestamp', default: pgm.func('CURRENT_TIMESTAMP') } 
    }
  });

  // -----------------------------
  // Create trigger function
  // -----------------------------
  // This function sets updated_at = NOW() automatically before any update
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // -----------------------------
  // Add triggers to tables
  // -----------------------------
  // Triggers will call the function on each row update
  pgm.sql(`
    CREATE TRIGGER trigger_update_pipelines
    BEFORE UPDATE ON pipelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER trigger_update_subscribers
    BEFORE UPDATE ON subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER trigger_update_subscriptions
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = async (pgm) => {
  // -----------------------------
  // Drop triggers
  // -----------------------------
  pgm.sql(`
    DROP TRIGGER IF EXISTS trigger_update_pipelines ON pipelines;
    DROP TRIGGER IF EXISTS trigger_update_subscribers ON subscribers;
    DROP TRIGGER IF EXISTS trigger_update_subscriptions ON subscriptions;

    DROP FUNCTION IF EXISTS update_updated_at_column();
  `);

  // -----------------------------
  // Drop updated_at columns
  // -----------------------------
  pgm.alterTable('pipelines', { dropColumns: ['updated_at'] });
  pgm.alterTable('subscribers', { dropColumns: ['updated_at'] });
  pgm.alterTable('subscriptions', { dropColumns: ['updated_at'] });
};