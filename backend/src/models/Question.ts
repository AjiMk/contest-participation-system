import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface QuestionAttributes {
  id: string;
  contest_id: string;
  prompt: string;
  type: 'single' | 'multi' | 'boolean' | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionInput extends Omit<QuestionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface QuestionOutput extends Required<QuestionAttributes> {}

export class Question extends Model<QuestionAttributes, QuestionInput> implements QuestionAttributes {
  declare id: string;
  declare contest_id: string;
  declare prompt: string;
  declare type: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contest_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'single',
    },
  },
  {
    sequelize,
    tableName: 'questions',
  }
);

export default Question;
