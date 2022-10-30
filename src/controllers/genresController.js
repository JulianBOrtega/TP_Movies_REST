const { Op } = require('sequelize');
const db = require('../database/models');
const helpers = require('../helpers');
const sequelize = db.sequelize;

module.exports = 
{
    list: async (req, res) => 
    {
        let { limit, order } = req.query;
        const fields = ['name', 'ranking', 'id'];

        try
        {
            if(order && !fields.includes(order)) 
                throw helpers.createError(400, 'Parámetro de orden incorrecto. Solo se puede usar ' + fields.join(', ') + '.');

            let total = await db.Genre.count();
            let genres = await db.Genre.findAll(
                {
                    attributes:
                    {   
                        exclude : ['created_at', 'updated_at']
                    },
                    limit: limit ? +limit : 5,
                    order: [ order ? order : 'id']
                }
            );

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200
                    },
                    data:
                    {
                        perPage: genres.length,
                        total,
                        genres
                    }
                });
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
    getById: async (req, res) => 
    {
        const { id } = req.params;

        try
        {
            if(isNaN(id)) throw helpers.createError(400, 'El ID debe ser un número entero positivo.');

            const genre = await db.Genre.findByPk(req.params.id);
            
            if(!genre) throw helpers.createError(404, 'No se encuentra un género con esa ID.');
            
            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200,
                    },
                    data: 
                    {
                        genre,
                        total: 1
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
                    msg: err.message,
                }
            );
        }
    },
    getByName: async(req, res) =>
    {
        const {name} = req.params;
        try 
        {
            if(!name) throw helpers.createError(400, 'Debe introducir un nombre a buscar.')

            const genre = await db.Genre.findOne(
                {
                    where:
                    {
                        name:
                        {
                            [Op.substring]: name
                        }
                    }
                }
            )

            if(!genre) throw helpers.createError(404, 'No se encuentra un género con ese nombre.');

            return res.status(200).json(
                {
                    ok: true,
                    meta:
                    {
                        status: 200,
                    },
                    data: 
                    {
                        genre,
                        total: 1
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
                    msg: err.message,
                }
            );
        }
    }

}