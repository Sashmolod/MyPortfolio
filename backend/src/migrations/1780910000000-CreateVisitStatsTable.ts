import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVisitStatsTable1780910000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'visit_stats',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'path',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'referrer',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'browser',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'os',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'device_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'visited_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Индекс для агрегации по дате
    await queryRunner.createIndex(
      'visit_stats',
      new TableIndex({
        name: 'IDX_visited_at',
        columnNames: ['visited_at'],
      }),
    );

    // Индекс для уникальных визитов (IP + path + дата-букет)
    await queryRunner.createIndex(
      'visit_stats',
      new TableIndex({
        name: 'IDX_ip_path_day',
        columnNames: ['ip_address', 'path', 'visited_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('visit_stats');
  }
}