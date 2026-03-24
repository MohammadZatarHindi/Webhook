exports.up = async (pgm) => {
  // Create function and trigger to auto-update updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = async (pgm) => {
  // Drop trigger and function on rollback
  pgm.sql(`
    DROP TRIGGER IF EXISTS trigger_update_updated_at ON jobs;
    DROP FUNCTION IF EXISTS update_updated_at_column();
  `);
};