
localStorage.setItem("usuario","Juan")
//obtener
const nombre = localStorage.getItem("usuario")
console.log(nombre);
//elimina
localStorage.removeItem("usuario");
//comprobar existencia 
console.log(localStorage.getItem("usuario"));
//convertir valores compatibles con json en una carpeta
JSON.stringify()
JSON.parse()// convierte una cadena json en datos para js

const teras=[
    {
        id:1,
        titulo:"tarea de ingles",
        completada:false
    },
    {
        id:1,
        titulo:"ver serie",
        completada:false,
    },
    {
        id:1,
        titulo:"limpiar el cuarto",
        completada:false,
    }
]

localStorage.setItem('tareas',JSON.stringify(tareas));

const tareasGuardadas = localStorage.getItem('tareas');
const tareasRecuperadas = tareasGuardadas ? json.parse(tareasGuardadas):[]
console.table(tareasRecuperadas)


//watch observa los cambios de una valiable 