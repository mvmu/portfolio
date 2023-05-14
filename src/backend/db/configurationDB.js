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

// una funcion para leer la tabla que nos interesa, aplicable a cualquiera de ellas. Personalizable por columnas e incluye tambien la formula para obtener un elemento especifico(id)
function read(tableName, columns, id) {
    return new Promise(async callback => {
        let [error, connection] = await createConnection();
        if(!error){
            let query = `SELECT ${!columns ? "*" : columns.toString()} FROM ${tableName}`;
            // si se da el id como parametro, la query incluirá WHERE para identificar la fila de la tabla que nos interesa
            if (id) {
                query = query + ` WHERE id = ${id}`;
            }
            // si "columns" no existe, selecciona todo. Si no, selecciona todos los elementos del array "columns" separados por coma, con el método toString() 
            let [data] = await connection.query(query);
            connection.close(); 
            return callback(data);
        }
        callback([]);
    });
}

function insert(tableName, columnKeys, columnValues) {
    return new Promise(async callback => {
        let [error, connection] = await createConnection();
        if (!error) {
            let result = "ok";
            try {
                // la query se compone de los valores dinamicos nombre de tabla, los nombres de las columnas con toString() y sus valores relativos. Asi, se pueden añadir los valores necesarios a la tabla. 
                // se aplica el método map() para generar un array de interrogaciones por cada nombre de la columna. Forma de proteger los datos
                await connection.query(`INSERT INTO ${tableName} (${columnKeys.toString()}) VALUES (${columnKeys.map(_ => "?").toString()})`, columnValues);
            } catch(error) {
                result = "ko";
            } finally {
                connection.close();
                return callback( { result } );
            }
        }
        callback({ result: "connection refused" });
    });
}

//exportamos las funciones para usarlas en otros ficheros
module.exports = {read, insert}; 
