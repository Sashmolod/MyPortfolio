import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProjectSkillsSkillTable1781200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project_skills_skill',
        columns: [
          {
            name: 'project_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'skill_id',
            type: 'int',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['project_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'projects',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['skill_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'skills',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Add indices for faster lookups
    await queryRunner.createIndices('project_skills_skill', [
      new TableIndex({
        columnNames: ['skill_id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('project_skills_skill');
  }
}