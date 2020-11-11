
exports.up = function(knex) {
    return knex.schema.createTable('history', table =>{
        table.increments('id').primary()
        table.integer('user_id')
        table.string('description', 100).unsigned()
        table.foreign('user_id').references('user.id')
        table.timestamps()
    })
};

exports.down = function(knex) {
  
};
