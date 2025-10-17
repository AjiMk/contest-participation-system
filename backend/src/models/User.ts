import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInput extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UserOutput extends Required<UserAttributes> {}

export class User extends Model<UserAttributes, UserInput> implements UserAttributes {
  // use `declare` so TypeScript knows the shape but no runtime class fields are emitted
  declare id: string;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare role: 'user' | 'admin';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);
