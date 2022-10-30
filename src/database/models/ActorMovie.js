// const { TINYINT, INTEGER } = require("sequelize/types");

module.exports = (sequelize, dataTypes) => {
    let alias = 'ActorMovie';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        // created_at: dataTypes.TIMESTAMP,
        // updated_at: dataTypes.TIMESTAMP,
        movie_id: {
            type: dataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        actor_id: {
            type: dataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    };

    let config = {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: false,
        tableName: 'actor_movie'
    }

    const ActorMovie = sequelize.define(alias, cols, config);

    return ActorMovie
};