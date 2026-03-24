exports.up = async (pgm) => {
  pgm.createType('action_type_enum', ['log', 'uppercase', 'reverse']);

  pgm.createTable('pipelines', {
    pipeline_id: { type: 'serial', primaryKey: true },
    pipeline_name: { type: 'varchar(255)', notNull: true, unique: true },
    action_type: { type: 'action_type_enum', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('pipelines', 'pipeline_name');
};

exports.down = async (pgm) => {
  pgm.dropTable('pipelines');
  pgm.dropType('action_type_enum');
};