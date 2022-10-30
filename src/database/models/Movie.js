const { objectValidate, defaultValidate } = require('../resources');
const currentDate = new Date();

module.exports = (sequelize, dataTypes) => {
    let alias = 'Movie'; // esto debería estar en singular
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        // created_at: dataTypes.TIMESTAMP,
        // updated_at: dataTypes.TIMESTAMP,
        title: {
            type: dataTypes.STRING(500),
            allowNull: false,
            validate : 
            {
                ...defaultValidate
            }
        },
        rating: {
            type: dataTypes.DECIMAL(3, 1).UNSIGNED,
            allowNull: false,
            validate : 
            {
                ...defaultValidate
            }
        },
        awards: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            allowNull: false,
            validate : 
            {
                ...defaultValidate
            }
        },
        release_date: {
            type: dataTypes.DATEONLY,
            allowNull: false,
            validate : 
            {
                ...defaultValidate,
                isBefore : 
                {
                    args: `${currentDate.getFullYear()}/${currentDate.getMonth()}/${currentDate.getDate()}`,
                    msg: 'La fecha debe ser anterior a la actual'
                }
            }
        },
        length: dataTypes.BIGINT(10),
        genre_id: dataTypes.BIGINT(10)
    };
    let config = {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: false
    }
    const Movie = sequelize.define(alias,cols,config);

    Movie.associate = function (models) {
        Movie.belongsTo(models.Genre, { // models.Genre -> Genres es el valor de alias en genres.js
            as: "genre",
            foreignKey: "genre_id"
        })

        Movie.belongsToMany(models.Actor, { // models.Actor -> Actors es el valor de alias en actor.js
            as: "actors",
            through: 'actor_movie',
            foreignKey: 'movie_id',
            otherKey: 'actor_id',
            timestamps: false
        })
    }

    return Movie
};