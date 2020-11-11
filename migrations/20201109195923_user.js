
exports.up = function(knex) {
    
    return knex.schema.createTable('user', table =>{
        table.increments('id').primary()
        table.string('name', 100)
        table.string('lastName', 100)
        table.string('hash', 100)
        table.dateTime('inserted')
        table.string('email', 100)
        table.string('password', 255)
        table.unique('email')
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user')
};
