const express = require("express");
const bodyParser = require("body-parser");
const {read, insert} =  require("./db/configurationDB");

// creamos el servidor
const server = express();

// configuración express con el frontend
server.set("view engine", "ejs");

server.use(bodyParser.urlencoded({ extended: true}));

// creamos un diccionario para asociar dbIs a su clave
let projectTypes = {};


//endpoint GET de "projects". API
server.get("/projects", async (request, response) => {

    //cargar todos los proyectos del DB
    let result = await read("projects");

    // por cada proyecto: leer del DB, crear una respuesta como objeto JSON cambiando las claves/nombres (de "title" a "projectTitle") y obtener el valor traducido para el projectType
    let payload = result.map(project => {
        //mapear el DB devuelve un resultado más comprensible, aplicando la lógica en la traducción de projectType
        return {
            id: project.id,
            projectTitle: project.title,
            introduction: project.intro,
            projectDescription: project.description,
            coverUrl: project.cover_url,
            // usamos la función translateProjectTypeValue para devolver la clave desde el dbId. Ej.: "projectType" = UX_UI devuelve "UX/UI designer"
            projectType: translateProjectTypeValue(projectTypes[project.project_type_id])
        }
    });

    // devolver la respuesta a la vista FE (frontend)
    // response.render("projects", { payload });
    // probamos send() en lugar de render() para comprobar la diferencia, aun sin tener FE
    response.send(payload);
});

server.post("/projects", async (request, response) => {
    let payload = request.body;
    let projectInsertResult = await insert("projects", ["cover_url", "intro", "title", "description", "project_type_id"], [payload.coverUrl, payload.intro, payload.title, payload.description, payload.projectTypeId]);
    if (projectInsertResult.status === "ok") {
        payload.toolsIds.array.forEach(async toolId => {
            await insert("project_tools", ["project_id", "tool_id"], [projectInsertResult.entity.id, toolId]);
        });
    }
    response.render({});
});


// Función para devolver la traducción de la clave de projectType
function translateProjectTypeValue(projectType) {
    if (projectType === "UX_UI") {
        return "UX/UI Designer";
    } else if (projectType === "WEB_DEV") {
        return "Web developer";
    } else if (projectType === "COMMUNICATION") {
        return "Communication";
    } else {
        return "Unknown";
    }
}

//Función lanzada cuando se inicia el servidor, extrae todas las claves del tipo de proyecto del DB y las almacena en la variable "projectTypes", ubicada al inicio del fichero
// Ahora podemos usar el diccionario dentro del fichero para cargar la clave asociada. LLamamos a projectTypes["1"] y devuelve "UX_UI"
async function loadProjectTypes() {
    let result = await read("project_type");
    result.forEach(projectType => {

        // almacenamos los valores dentro del diccionario, teniendo dbId como clave y typeKey como valor
        projectTypes[projectType.id] = projectType.value;
    });
    console.log("project types loaded!");
}

loadProjectTypes();

// test insert function
// insert("projects",["cover_url","intro","title","description","project_type_id"], ["text", "text1", "proyecto 1", "mi primer proyecto", 2]);

server.listen(7000);