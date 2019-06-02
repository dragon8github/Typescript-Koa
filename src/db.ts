import { Sequelize, DataTypes, Model } from 'sequelize'
import * as ph from 'password-hash'
import { resolve } from 'path'

const sequelize = new Sequelize('db', null, null, {
    dialect: 'sqlite',
    storage: resolve(__dirname, '../storage/db.sqlite3')
})

class User extends Model {
    public id!: number;
    public usernmae!: string;
    public email!: string;
    public password!: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    timestamps: false,
    tableName: 'user',
})

User.create({
    username: 'yugo',
    email: 'belovedyogurt@gmail.com',
    password: ph.generate('123456')
}).then(console.log)

