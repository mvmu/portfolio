const express = require("express");
const bodyParser = require("body-parser");
const {read, insert} =  require("./db/configurationDB");

//a dictionary to associate dbId to its key. 
let projectTypes = {};

// creamos el servidor
const server = express();

// configuración express con el frontend
server.set("view engine", "ejs");

server.use(bodyParser.urlencoded({ extended: true}));

//endpoint GET de "projects". API
server.get("/projects", async (request, response) => {

    //load all projects from DB
    let result = await read("projects");

    //for each project read from DB, create a JSON response object, changing the keys (from "title" to "projectTitle") and getting the translation value for the projectType
    let payload = result.map(project => {
        //mapping the DB result to something nicer, applying some extra logic such as projectType translation
        return {
            id: project.id,
            projectTitle: project.title,
            introduction: project.intro,
            projectDescription: project.description,
            coverUrl: project.cover_url,
            //using the getProjectTypeValue function to return the value key from the dbId e.g. passing "projectType" = UX_UI it returns "UX/UI designer"
            projectType: getProjectTypeValue(projectTypes[project.project_type_id])
        }
    });

    //return the response to the FE view
    response.render("projects", { payload });
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


//Function that, given a key value for the projectType, returns the associated translation
function getProjectTypeValue(projectType) {
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

//Function launched when the server starts, it fetches all the project type values from the DB and store it into the "projectTypes" variable set at the top of the file
// The dictionary can then be used inside the file to load the associated key! e.g. calling projectTypes["1"] it returns "UX_UI"
async function loadProjectTypes() {
    let result = await read("project_type");
    result.forEach(projectType => {

        //store the values inside a dictionary having the dbId as key, and the typeKey as value
        projectTypes[projectType.id] = projectType.value;
    });
    console.log("project types loaded!")
}

loadProjectTypes();

server.listen(7000);