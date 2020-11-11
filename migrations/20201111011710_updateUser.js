
exports.up = function(knex) {
    return knex.schema.alterTable('user', (table)=>{
        table.string('email', 100)
    })
};

exports.down = function(knex) {
  
};
