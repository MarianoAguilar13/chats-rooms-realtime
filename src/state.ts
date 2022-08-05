import { rtdb } from "./rtdb";
import {
  getDatabase,
  ref,
  set,
  onValue,
  DataSnapshot,
} from "../node_modules/firebase/database";
import map from "../node_modules/lodash";

const API_BASE_URL = "http://localhost:3000";

//El state nos va a servir como puente del front al back, no voy
//a hacer peticiones al back desde el front, sino siempre a traves
//del state, por lo tanto los fetch se haran aca y no en el front
const state = {
  data: {
    nombre: "",
    email: "",
    messages: [],
    idUser: "",
    roomIdCorto: "",
    roomIdLargo: "",
  },

  listeners: [],

  //con el init inicio al state, este lo llamamos en el index.ts
  init() {},

  //devuelve la data del ultimo state
  getState() {
    return this.data;
  },

  //este sign hace que el state se comunique con el backend
  //e ingrese como un nuevo usuario el email y su nombre,
  //previamente tenemos que guardar en el state  el email y nombre
  sign(callback) {
    const currentState = this.getState();
    //si existe un email en el state va a hacer el fetch-post
    if (currentState.email) {
      fetch(API_BASE_URL + "/signup", {
        method: "post",
        //necesita este header para que funcione
        headers: {
          "content-type": "application/json",
        },

        body: JSON.stringify({
          nombre: currentState.nombre,
          email: currentState.email,
        }),
      }).then((res) => {
        res.json().then((resultado) => {
          //si el resultado.id existe es que se acaba de crear
          //sino va a salir un msj en la consola que no se encuentra
          //si existe el id entonces lo guardo en el state para
          //utilizarlo en las siguientes operaciones
          if (resultado.id) {
            state.setIdUser(resultado.id);
            callback();
          } else {
            console.error(resultado.message);
            callback();
          }
        });
      });
    } else {
      console.error("No hay un email en el State");
      callback();
    }
  },

  //el auth del state sirve para autorizar un email y saber si
  //esta guardado en la db, si es un usuario registrado
  //se utiliza cuando el usuario se loggea con su cuenta
  auth(callback) {
    const currentState = this.getState();
    //si el state tiene un mail guardado hace un post a la api
    //a la direc /auth , que este matchea en la db a ver si existe
    //el usuario, en el caso de poner una contraseña, tambien esta
    //deberia controlarse en este paso
    if (currentState.email) {
      fetch(API_BASE_URL + "/auth", {
        method: "post",
        //necesita este header para que funcione
        headers: {
          "content-type": "application/json",
        },

        body: JSON.stringify({
          email: currentState.email,
        }),
      }).then((res) => {
        res.json().then((resultado) => {
          //si el resultado.id existe etonces es un usuario existente
          //voy a guardarme el id en el state para luego usarlo para
          //poder crear las rooms
          //sino va a salir una alerta de que no se encuentra en la db
          //por lo tanto no estara a autorizado para utilizar el chat
          if (resultado.id) {
            state.setIdUser(resultado.id);
            callback();
          } else {
            console.error(resultado.message);
            callback();
          }
        });
      });
    } else {
      console.error("El state no contiene ningun email");
    }
  },

  //aca voy a crear la sala
  crearRoom(callback) {
    const currentState = this.getState();
    //si el estate tiene guardado un idUser entonces hace un post
    // a la api "/rooms" el cual creara la room en la bd y en la
    //rtdb
    if (currentState.idUser) {
      fetch(API_BASE_URL + "/rooms", {
        method: "post",
        //necesita este header para que funcione
        headers: {
          "content-type": "application/json",
        },

        body: JSON.stringify({
          userId: currentState.idUser,
        }),
      }).then((res) => {
        res.json().then((resultado) => {
          //una vez que el backen creó la sala guardo el roomIdCorto
          //en el state para despues conectarme a este cuando entre
          //al chat y me conecte a la room con el onValue
          const roomIdCorto = resultado.id;
          state.setRoomIdCorto(roomIdCorto);
          //con el callback voy a llamar a la route para que cuando termine
          //de ejecutarse todo lo de esta funcion me envie hacia la siguiente pag
          //la pag del chat y ahi es donde voy a conectarme con
          //el state.conectRoomRt que utiliza el onValue de la rtdb
          callback();
        });
      });
    } else {
      console.error("El state no tiene ningun idUser");
    }
  },

  //con esta funcion lo que hace el state es mandar el userId y el
  //roomIdCorto a la api para que esta le devuelva el roomIdLargo
  //como este es el metodo get paso todo por url
  roomIdLargo(callback) {
    const currentState = state.getState();
    fetch(
      API_BASE_URL +
        "/rooms/" +
        currentState.roomIdCorto +
        "?userId=" +
        currentState.idUser,
      {
        method: "GET",
        //necesita este header para que funcione
        headers: {
          "content-type": "application/json",
        },
      }
    ).then((res) => {
      console.log("esto tiene res" + res);

      res.json().then((resultado) => {
        //una vez que el backen creo la sala guardo el roomIdLargo
        //en el state para despues conectarme a este cuando entre
        //al chat y me conecte a la room con el onValue
        console.log("este es la data de la api roomidlargo" + resultado);

        const roomIdLargo = resultado;
        state.setRoomIdLargo(roomIdLargo);
        callback();
      });
    });
  },

  //con esta funcion el state se conecta al rtdb para escuchar cambio
  //en el room que le paso, este id sera el Largo que es el que crea
  //automaticamente la libreria UUID
  conectRoomRt() {
    const currentState = this.getState();

    const chatRoomRef = ref(rtdb, "rooms/" + currentState.roomIdLargo);

    onValue(chatRoomRef, (snapshot) => {
      //la constante valor es un objeto
      const messagesFromServer = snapshot.val();
      //aca utilizo la funcion map de lodash, porque originalmente
      //tengo un objeto como muchos objetos, y yo quiero un array
      //de objetos y con la funcion map hago eso, recorro al objeto y
      //lo transformo en el array y se lo paso al state para que este
      //luego se lo pase al chat mostrando los msj

      const messagesList = map(messagesFromServer.messages);
      currentState.messages = messagesList;
      console.log(messagesList);

      this.setState(currentState);
    });
  },

  setNombreEmail(nombre: String, email: String) {
    const currentState = this.getState();
    currentState.nombre = nombre;
    currentState.email = email;
    console.log("el nuevo state tiene data.nombre: " + nombre);
    console.log("el nuevo state tiene data.email: " + email);
    this.setState(currentState);
  },

  setIdUser(idUser: String) {
    const currentState = this.getState();
    currentState.idUser = idUser;
    console.log("el nuevo state tiene data.idUser: " + idUser);
    this.setState(currentState);
  },

  setRoomIdCorto(roomIdCorto: String) {
    const currentState = this.getState();
    currentState.roomIdCorto = roomIdCorto;
    console.log("el nuevo state tiene data.roomIdCorto: " + roomIdCorto);
    this.setState(currentState);
  },

  setRoomIdLargo(roomIdLargo: String) {
    const currentState = this.getState();
    currentState.roomIdLargo = roomIdLargo;
    console.log("el nuevo state tiene data.roomIdLargo: " + roomIdLargo);
    this.setState(currentState);
  },

  //le va a mandar a nuestro backend el nuevo mensaje y luego este
  //lo va a sobreescribir en la rtdb
  pushMessage(message: String) {
    const nombreDelDataState = this.data.nombre;
    const roomIdLargo = this.data.roomIdLargo;
    fetch(API_BASE_URL + "/messages", {
      //como envio el msj del usuario para que se guarde en la
      //rtdb uso el metodo post, el body siempre va stringifyado
      method: "post",
      //necesita este header para que funcione
      headers: {
        "content-type": "application/json",
      },

      //va a tener el nombre que guarde en el state + el msj del chat
      body: JSON.stringify({
        from: nombreDelDataState,
        message: message,
        roomId: roomIdLargo,
      }),
    });
  },

  subscribe(callback: (any) => any) {
    // recibe callbacks para ser avisados posteriormente
    this.listeners.push(callback);
  },

  setState(newState) {
    // modifica this.data (el state) e invoca los callbacks
    this.data = newState;
    //cb de callback
    //cada vez que se modifica el state se ejecutan los cb suscriptos
    for (const cb of this.listeners) {
      cb();
    }
  },
};

export { state };
