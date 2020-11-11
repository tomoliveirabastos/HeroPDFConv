
exports.up = function(knex) {
    
    return knex.schema.createTable('user', (table) =>{
        table.increments('id').primary()
        table.string('name', 100)
        table.string('lastName', 100)
        table.string('hash', 100)
        table.dateTime('inserted')
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user')
};
