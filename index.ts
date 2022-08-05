import * as express from "express";
import { firestore, rtdb } from "./db";
import * as cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { database } from "firebase-admin";

const port = process.env.PORT || 3000;
const app = express();

//hola
//la app(api) tiene incluido la funcion json de express, por
//lo tanto se podra usar en toda la api y enviar objetos del body
//mediante postman, el cors y este .json() se llaman midleware
app.use(express.json());
app.use(cors());

app.use(express.static("dist"));

//en esta api vamos a introducir los conceptos de:
//-signup
//-authentication(ver que el usuario exista)
//-authorization (este vendria a ser los permisos que tiene el usuario)
//por ahora este ultimo no lo vamos a incorporar

//usersCollectio van a ser todos los usuarios que tenemos
const usersCollection = firestore.collection("users");
const roomsCollection = firestore.collection("rooms");

//En este signup vamos a chequear si existe el usuario o si todavia
//no fue registrado, en caso de estar registrado avisa que ya esta
//registrado
app.post("/signup", function (req, res) {
  //a traves del body le vamos a mandar un mail
  const email = req.body.email;
  const nombre = req.body.nombre;
  //aca vamos a buscar en la DB con el where si, hay algun usuario
  //con email igual al email pasado por el body
  usersCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      //si el email no existe entonces lo voy a agregar para crear
      //el id y si ya existe envio devuelvo el id al state
      if (searchResponse.empty) {
        //con el add agrego el usuario con el email y nombre
        //generando el id y lo envio al state/front
        usersCollection
          .add({
            email,
            nombre,
          })
          .then((newUserRef) => {
            res.json({
              id: newUserRef.id,
            });
          });
      } else {
        //el searchResponse que es la respuesta del get, siempre me trae
        //una lista por mas que solo un usuario tiene ese email
        /*si queremos responder el id
        res.json({
          id: searchResponse.docs[0].id,
          
        });*/
        res.status(400).json({
          message: "user already exists",
        });
      }
    });
});

app.post("/auth", (req, res) => {
  //las llaves me indica que va a pedirle al body la propiedad email
  //y va a crear una constante con el mismo nombre
  const { email } = req.body;

  usersCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      //si el email no lo encuentra envia un error
      if (searchResponse.empty) {
        res.status(404).json({
          message: "not found",
        });
      } else {
        //si el email se encontro significa que el usuario esta creado
        //y le enviamos su id para que el state tenga ese dato y el
        //fornt pueda realizar sus operaciones con el mismo

        res.json({
          id: searchResponse.docs[0].id,
        });
      }
    });
});

//este post nos va a crear una room con un id complejo y nos va a
//devolver un id mas simple para utilizar
app.post("/rooms", (req, res) => {
  const { userId } = req.body;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        //si existe el usario, entonces vamos a crear una room
        //con un id creado con la libreria nanoid, y que contengas
        //messages[] y un dueño

        //const idRandom = nanoid();
        const idRandom = uuidv4();
        const roomRef = rtdb.ref("rooms/" + idRandom);

        //en la rooms/id va a crear messa y el owner que es quien
        //creo la sala
        roomRef
          .set({
            messages: { 0: { from: "Server", message: "Iniciando-Chat" } },
            owner: userId,
          })
          .then(() => {
            //aca voy a crear un id mas corto para que se puedan conectar con este
            //y asi mantener oculto el id de los rooms dentro de la DB
            const roomLongId = roomRef.key;
            const roomId = 100000 + Math.floor(Math.random() * 99999);
            roomsCollection
              .doc(roomId.toString())
              .set({
                rtdbRoomId: roomLongId,
              })
              .then(() => {
                res.json({
                  id: roomId.toString(),
                  //respondo el id corto al state/front para que ultilicen este
                  //para conectarse
                });
              });
          });
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

//por lo tanto en la rtdb se va a guardar la room con el id"dificil"
//y en fs se va a guardar en las rooms como id la id"facil" y dentro
//esta guardada la id de la rtdb el id"dificil"

//aca voy a pedir el dato de la room que paso por el id
//en el roomId voy a pasar el id simple y el owner que va a ser
//el id del usuario
app.get("/rooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;

  usersCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      //si el id del user no lo encuentra envia un error
      if (doc.exists) {
        //despues buesca entre los room el que tenga el id"corto"
        //pasado por parametro para obtener el id largo
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            const data = snap.data();
            //en data solo existe el id"dificil" que esta dentro
            //de la room de la fs, pero para devolver directamente
            //el id"dificil" vamos a enviar data.rtdbRoomId
            console.log("snap.data" + data.rtdbRoomId);

            res.json(data.rtdbRoomId);
          });
      } else {
        res.status(401).json({
          message: "no existís",
        });
      }
    });
});
//por lo tanto teniendo el id owner y el di"facil" de la room
//obtenemos id dificil de la rtdb, para poder conectarnos a esta

//la api en esta parte lo que hacer es en la rtdb.ref, localiza
//a la room y dentro de msj le agrega el nuevo msj quedando en orden
app.post("/messages", function (req, res) {
  const roomId = req.body.roomId;
  const chatRoomRef = rtdb.ref("rooms/" + roomId + "/messages");

  //los msj se guardan con from(quien lo envio) y message(el contenido del msj)
  const msj = { message: req.body.message, from: req.body.from };

  chatRoomRef.push(msj, function () {
    res.json("todo ok");
    console.log(req.body);
  });
});

app.get("/env", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
  });
});

app.listen(port, () => {
  console.log("example app listening at http://localhost:3000");
});
