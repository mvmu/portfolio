// importar bbdd
const mysql = require("mysql2/promise");

//creamos la conexion al db con try/catch 
function createConnection(){
    return new Promise(async callback => {
        try{
            let connection = await mysql.createConnection({
                host : "localhost",
                port : 8889,
                database : "portfolio",
                user : "root",
                password : "root"
            });
            callback([null,connection]);
        }catch(error){
            callback([error]);
        }
    }); 
}

// una funcion para leer con un solo parametro la tabla que nos interesa
function read(tableName) {
    return new Promise(async callback => {
        let [error, connection] = await createConnection();
        if(!error){
            let [data] = await connection.query(`SELECT * FROM ${tableName}`);
            connection.close(); 
            return callback(data);
        }
        callback([]);
    });
}