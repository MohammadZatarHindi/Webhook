exports.up = async (pgm) => {
  // --------------------------------------------------------
  // 1. Action Types (Enum)
  // --------------------------------------------------------
  pgm.createType('action_type_enum', ['log', 'uppercase', 'reverse']);
  pgm.createType('job_status_enum', ['pending', 'processing', 'completed', 'failed']);
  pgm.createType('delivery_status_enum', ['pending', 'success', 'failed']);

  // --------------------------------------------------------
  // 2. Pipelines
  // --------------------------------------------------------
  pgm.createTable('pipelines', {
    pipeline_id: { type: 'serial', primaryKey: true },
    pipeline_name: { type: 'text', notNull: true, unique: true },
    action_type: { type: 'action_type_enum', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    // updated_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  // --------------------------------------------------------
  // 3. Subscribers
  // --------------------------------------------------------
  pgm.createTable('subscribers', {
    subscriber_id: { type: 'serial', primaryKey: true },
    url: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  // --------------------------------------------------------
  // 4. Subscribtions (Many-to-Many)
  // --------------------------------------------------------
  pgm.createTable('subscribtions', {
    subscribtion_id: { type: 'serial', primaryKey: true },
    subscriber_id: {
      type: 'integer',
      notNull: true,
      references: '"subscribers"',
      onDelete: 'CASCADE',
    },
    pipeline_id: {
      type: 'integer',
      notNull: true,
      references: '"pipelines"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('subscribtions', 'unique_subscriber_pipeline', {
    unique: ['subscriber_id', 'pipeline_id'],
  });
  pgm.createIndex('subscribtions', 'pipeline_id');

  // --------------------------------------------------------
  // 5. Jobs
  // --------------------------------------------------------
  pgm.createTable('jobs', {
    job_id: { type: 'serial', primaryKey: true },
    pipeline_id: {
      type: 'integer',
      notNull: true,
      references: '"pipelines"',
      onDelete: 'CASCADE',
    },
    payload: { type: 'jsonb', notNull: true },
    status: { type: 'job_status_enum', notNull: true, default: 'pending' },
    attempts: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
  pgm.createIndex('jobs', 'pipeline_id');

  // --------------------------------------------------------
  // 6. Deliveries
  // --------------------------------------------------------
  pgm.createTable('deliveries', {
    delivery_id: { type: 'serial', primaryKey: true },
    job_id: {
      type: 'integer',
      notNull: true,
      references: '"jobs"',
      onDelete: 'CASCADE',
    },
    subscriber_id: {
      type: 'integer',
      notNull: true,
      references: '"subscribers"',
      onDelete: 'CASCADE',
    },
    status: { type: 'delivery_status_enum', notNull: true, default: 'pending' },
    attempts: { type: 'integer', notNull: true, default: 0 },
    response_code: { type: 'integer' },
    response_body: { type: 'text' },
    attempted_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  // Indexes for faster lookups
  pgm.createIndex('deliveries', 'job_id');
  pgm.createIndex('deliveries', 'subscriber_id');
  pgm.createIndex('deliveries', 'status');
  pgm.createIndex('deliveries', ['job_id', 'subscriber_id']);
};

exports.down = async (pgm) => {
  pgm.dropTable('deliveries');
  pgm.dropTable('jobs');
  pgm.dropTable('subscribtions');
  pgm.dropTable('subscribers');
  pgm.dropTable('pipelines');

  pgm.dropType('delivery_status_enum');
  pgm.dropType('job_status_enum');
  pgm.dropType('action_type_enum');
};