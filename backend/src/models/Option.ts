import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface OptionAttributes {
  id: string;
  question_id: string;
  label: string;
  is_correct: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OptionInput extends Omit<OptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface OptionOutput extends Required<OptionAttributes> {}

export class Option extends Model<OptionAttributes, OptionInput> implements OptionAttributes {
  declare id: string;
  declare question_id: string;
  declare label: string;
  declare is_correct: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Option.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'options',
  }
);

export default Option;
