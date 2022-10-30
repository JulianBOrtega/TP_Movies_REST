const path = require('path');
const db = require('../database/models');
const helpers = require('../helpers');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

module.exports = 
{
    list: async (req, res) => {

        const { limit, order, offset } = req.query;
        const fields = ['title', 'rating', 'id', 'release_date', 'length', 'awards'];

        try
        {
            if(order && !fields.includes(order)) 
                throw helpers.createError(400, 'Parámetro de orden incorrecto. Solo se puede usar ' + fields.join(', ') + '.');
                
            const total = await db.Movie.count();
            const movies = await db.Movie.findAll(
                {
                    attributes: 
                    {
                        exclude: ['created_at', 'updated_at']
                    },
                    include: 
                    [
                        {
                            association: 'genre',
                            attributes: 
                            {
                                exclude: ['created_at', 'updated_at']
                            }
                        },
                        {
                            association: 'actors',
                            attributes: 
                            {
                                exclude: ['created_at', 'updated_at']
                            }
                        }
                    ],
                    limit: limit ? +limit : 5,
                    offset: offset ? +offset : 0,
                    order: [ order ? order : 'id']
                });
            
            movies.forEach(movie =>
                {
                    movie.setDataValue('link', `${helpers.getUrl(req)}/${movie.id}`);
                });

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        perPage: movies.length,
                        total,
                        movies
                    }
                }
            );
        }
        catch(err)
        {
            console.log(err);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: err.message
                });
        }
    },
    getById: async (req, res) => {

        const { id } = req.params;

        try 
        {
            if(isNaN(id)) throw helpers.createError(400, 'El ID debe ser un número entero positivo.');

            const movie = await db.Movie.findByPk(id, 
                { 
                    include : 
                    [
                        {
                            association: 'genre',
                            attributes: 
                            {
                                exclude: ['created_at', 'updated_at']
                            }
                        },
                        {
                            association: 'actors',
                            attributes: 
                            {
                                exclude: ['created_at', 'updated_at']
                            }
                        }
                    ],
                    attributes: 
                    {
                        exclude: ['created_at', 'updated_at', 'genre_id']
                    } 
                });
            
            if(!movie) throw helpers.createError(404, 'No se encuentra una película con esa ID.');

            movie.release_date = moment(movie.release_date).format();

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        movie
                    }
                }
            );
        } 
        catch (err) 
        {
            console.log(err);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: err.message
                });
        }
    },
    newest: async (req, res) => {

        const { limit } = req.query;

        const ops = {
            order: [ ['release_date', 'DESC'] ],
            include:
                [
                    {
                        association: 'genre',
                        attributes: { exclude: ['created_at', 'updated_at'] }
                    },
                    {
                        association: 'actors',
                        attributes: { exclude: ['created_at', 'updated_at'] }
                    }
                ],
            attributes: { exclude: ['created_at', 'updated_at', 'genre_id']},
            limit: limit ? +limit : 5
        };

        try 
        {
            const movies = await db.Movie.findAll(ops);

            movies.forEach(movie =>
                {
                    movie.setDataValue('link', `${helpers.getUrl(req)}/${movie.id}`);
                });

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        movies
                    }
                }
            );
        } 
        catch (error) 
        {
            console.log(err);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: err.message
                });
        }
    },
    recommended: async (req, res) => {

        const { limit } = req.query;

        const ops = {
            where: { rating: {[db.Sequelize.Op.gte] : 8} },
            order: [ ['rating', 'DESC'] ],
            include:
                [
                    {
                        association: 'genre',
                        attributes: { exclude: ['created_at', 'updated_at'] }
                    },
                    {
                        association: 'actors',
                        attributes: { exclude: ['created_at', 'updated_at'] }
                    }
                ],
            attributes: { exclude: ['created_at', 'updated_at', 'genre_id']},
            limit: limit ? +limit : 5
        };

        try 
        {
            const movies = await db.Movie.findAll(ops); 
            
            movies.forEach(movie =>
                {
                    movie.setDataValue('link', `${helpers.getUrl(req)}/${movie.id}`);
                });

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        movies
                    }
                }
            );
        } 
        catch (err) 
        {
            console.log(err);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: err.message
                });
        }
    },
    create: async (req,res) => {

        try 
        {
            const movie = await db.Movie.create(
                {
                    title: req.body.title?.trim(),
                    rating: req.body.rating,
                    awards: req.body.awards,
                    release_date: req.body.release_date,
                    length: req.body.length,
                    genre_id: req.body.genre_id
                }
            );

            return res.status(201).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 201
                    },
                    data:
                    {
                        movie
                    }
                }
            );
        } 
        catch (err) 
        {
            const showErrors = err.errors.map(error =>
                {
                    return {path: error.path, message: error.message}
                })
                
            console.log(showErrors);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: showErrors
                });
        }
    },
    update: async (req,res) => {

        let movieId = req.params.id;
        let {title, rating, awards, release_date, length, genre_id} = req.body;

        try
        {
            let movie = await db.Movie.findByPk(movieId);
            if(!movie) throw helpers.createError(404, 'No se encuentra una película con esa ID.');
            movie.title = title?.trim() || movie.title;
            movie.rating = rating || movie.rating;
            movie.awards = awards || movie.awards;
            movie.release_date = release_date || movie.release_date;
            movie.length = length || movie.length;
            movie.genre_id = genre_id || movie.genre_id;
            
            await movie.save();

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        movie
                    }
                }
            );
        }
        catch(err)
        {
            console.log(err);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: err.message
                });
        }
    },
    destroy: async (req,res) => {
        let movieId = req.params.id;

        try 
        {
            const deletedMovie = await db.Movie.findByPk(movieId);

            if(!deletedMovie) throw helpers.createError(404, 'No se encuentra una película con esa ID.');

            await db.Actor.update(
                {
                    favorite_movie_id: null
                },
                {
                    where: { favorite_movie_id: movieId }
                }
            )

            await db.ActorMovie.destroy({
                where: { movie_id : movieId }
            });

            // force: true es para asegurar que se ejecute la acción
            await db.Movie.destroy({where: {id: movieId}, force: true});

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        deletedMovie
                    }
                }
            );
        } 
        catch (err) 
        {
            console.log(err);

            return res.status(err.status || 500).json(
                {
                    ok: false,
                    msg: err.message
                });
        }
    }
}