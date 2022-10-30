const objectValidate = (args, msg) => ({args, msg});

const defaultValidate =
{
    notNull : objectValidate(true, `El campo no puede ser nulo.`),
    notEmpty : objectValidate(true, `El campo no puede estar vacío.`)
};

module.exports = 
{
    objectValidate,
    defaultValidate
}