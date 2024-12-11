import dotenv from "dotenv";
dotenv.config();//lee el fichero .env y crea las variables de entorno
//-------------
import express from "express";
import cors from "cors";
import { leerTareas,crearTarea,borrarTarea,editarTarea,editarEstado } from "./db.js";

const servidor = express();

servidor.use(cors()); //middleware que irá primero

servidor.use(express.json()); //middleware que también irá arriba

if(process.env.PRUEBAS){
    servidor.use(express.static("./pruebas"));
}

servidor.get("/tareas", async (peticion,respuesta) => {
    try{
        let tareas = await leerTareas();

        respuesta.json(tareas);

    }catch(error){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.post("/tareas/nueva", async (peticion,respuesta,siguiente) => {
    
    let {tarea} = peticion.body;

    if(!tarea || tarea.trim() == ""){
        return siguiente(true);
    }

    try{

        let id = await crearTarea(tarea);

        respuesta.json({id});

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
    
});

servidor.delete("/tareas/borrar/:id([0-9a-f]{24})", async (peticion,respuesta) => {
    try{

        let {id} = peticion.params;

        let cantidad = await borrarTarea(id);

        respuesta.json({ resultado : cantidad ? "ok" : "ko" });

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.put("/tareas/actualizar/:id([0-9a-f]{24})/1", async (peticion, respuesta,siguiente) => {

    let {id} = peticion.params; //extraemos el id

    let {tarea} = peticion.body; //extraemos la peticion del body

    if(!tarea || tarea.trim() == ""){
        return siguiente(true);
    }

    try{

        let cantidad = await editarTarea(id, tarea);

        respuesta.json({ resultado : cantidad ? "ok" : "ko" });

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
})

servidor.put("/tareas/actualizar/:id([0-9a-f]{24})/2", async (peticion, respuesta) => {

    let {id} = peticion.params; //extraemos el id

    try{

        let cantidad = await editarEstado(id);

        respuesta.json({ resultado : cantidad ? "ok" : "ko" });

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
})


servidor.use((error,peticion,respuesta,siguiente) => {
    respuesta.status(400);
    respuesta.json({ error : "error en la petición" });
});

servidor.use((peticion,respuesta) => {
    respuesta.status(404);
    respuesta.json({ error : "recurso no encontrado" });
});


servidor.listen(process.env.PORT);