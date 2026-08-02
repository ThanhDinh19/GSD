const {getPool, sql} = require('../database/connection');

async function addUser(payload){
    const pool = getPool();

    try{
        await pool.request()
            .input('name', sql.NVarChar, payload.name)
            .input('age', sql.Int, payload.age)
            .query(`
                insert into users (name, age) 
                values (@name, @age)
            `);
    }catch(err){
        throw err;
    }
}

async function getUser() {
    const pool = getPool();
    const data = await pool.request().query(
        `select 
            id,
            name,
            age
        from users`);

    return data.recordset;
}

module.exports = { 
    addUser,
    getUser,
}