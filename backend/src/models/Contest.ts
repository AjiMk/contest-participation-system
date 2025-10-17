import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface ContestAttributes {
  id: string;
  name: string;
  description?: string | null;
  access_level: 'normal' | 'vip';
  starts_at?: Date | null;
  ends_at?: Date | null;
  prize_title?: string | null;
  prize_details?: string | null;
  created_by?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContestInput extends Omit<ContestAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface ContestOutput extends Required<ContestAttributes> {}

export class Contest extends Model<ContestAttributes, ContestInput> implements ContestAttributes {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare access_level: 'normal' | 'vip';
  declare starts_at: Date | null;
  declare ends_at: Date | null;
  declare prize_title: string | null;
  declare prize_details: string | null;
  declare created_by: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Contest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    access_level: {
      type: DataTypes.ENUM('normal', 'vip'),
      allowNull: false,
      defaultValue: 'normal',
    },
    starts_at: {
      type: DataTypes.DATE,
    },
    ends_at: {
      type: DataTypes.DATE,
    },
    prize_title: {
      type: DataTypes.STRING,
    },
    prize_details: {
      type: DataTypes.TEXT,
    },
    created_by: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    tableName: 'contests',
  }
);

export default Contest;
