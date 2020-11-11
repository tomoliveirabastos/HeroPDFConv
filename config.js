module.exports = {
    client: 'sqlite3',

    connection: {

        filename: './database.sqlite'

    },

    migration:{

        directory: './migrations'

    },

    migrations: {

        tableName: 'migrations'

    },

    useNullAsDefault: true

};