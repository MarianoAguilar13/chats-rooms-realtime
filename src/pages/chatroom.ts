//como la libreria de @vaadin rutes trabaja con componentes
//las page no las voy a trabajar como las venia haciendo, sino voy
//a crear componentes y luego los voy a exportar y en el archivo
//router.ts voy acrear la ruta de la page con el componente

import { state } from "../state";

type Message = {
  from: string;
  message: string;
};

//esta funcion me permite devolver user o otro-user, dependiendo
//de si el mombre del usuario que esta guardado en el state
//es igual o no al nombre que viene del msj
//ese resultado lo voy a poner como la clase del div
//despues este div dependiendo de si tiene la clase user o otro-user
//va a tener un fondo de color distinto y una ubicacion distinta
//dentro del chat
function determinarClase(from: String, nombreUser: String) {
  if (from == nombreUser) {
    return "user";
  } else {
    return "otro-user";
  }
}

class ChatRoom extends HTMLElement {
  connectedCallback() {
    //aca el chat se suscribe al state, ya que cualquier cambio en el state
    //le va a avisar al chat, este se va a actualizar y a renderizar de nuevo
    //el flujo sería que cuando se envia un msj al chat, este se agrega al state, luego
    //el state hace un push del msj y se lo comunica a la api-backend,
    //esta actualiza la rtdb y al actualizar esta como el state esta conectado
    // a la rtdb a traves del OnValue, esta se actualiza y al actualizarse la
    //data del state este le avisa a todos los componentes y pages que estan suscriptos
    //asi es el flujo de los datos

    //con el conectRoomRt lo que hacemos es conectarnos a la room
    // ya sea una recien creada o la que se selecciono para conectarse
    //el onValue nos permite quedarse escuchando los cambios en la rtdb
    //y asi cuando cambie la rtdb cambiara los msj del state y el chat
    //al estar suscripto al state, esperara los cambio de este
    //e ira actualizandose los msj

    state.conectRoomRt();

    state.subscribe(() => {
      const currentState = state.getState();
      //this(el componente) tiene una propiedad messages, la cual es la
      //que se utiliza para imprimir los msj, esta propiedad la actualiza
      //el state actual
      this.messages = currentState.messages;
      this.render();
    });

    this.render();

    const form = this.querySelector(".form-chat");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const target = e.target as any;

      console.log(state.data);

      //aca el pushMessage toma el valor del msj que se escribio
      //y luego este metodo hace un fetch post al backend con el msj
      //y el nombre de quien lo envio
      state.pushMessage(target.msj.value);
    });
  }

  //declaro la variable mensajes que va a ser un array de tipo Mensaje
  messages: Message[];

  //shadow = this.attachShadow({ mode: "open" });

  addListeners() {
    const form = this.querySelector(".form-chat");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const target = e.target as any;

      console.log(state.data);
      console.log("msj del chat:" + target.msj.value);
      //aca el pushMessage toma el valor del msj que se escribio
      //y luego este metodo hace un fetch post al backend con el msj
      //y el nombre de quien lo envio
      state.pushMessage(target.msj.value);
    });
  }

  render() {
    //creo el style, que solo puede ser usados por elementos del header-el
    let style = document.createElement("style");
    style.textContent = `
                        * {
                          box-sizing: border-box;
                        }
                        
                        body {
                          padding: 0;
                          background-color: whitesmoke;
                          font-family: "Edu NSW ACT Foundation", cursive;
                        
                        }
                        
                        .container-chat {
                          display: flex;
                          flex-direction: column;
                          justify-content: space-around;
                          height: 100vh;
                          margin: auto;
                          width: 400px;
                        }
                        
                        .titulo {
                          font-weight: 700;
                          font-size: 48px;
                          text-align: center;
                          color: black;
                        }
                        
                        .chat {
                          display: flex;
                          flex-direction: column;
                          width: 100%;
                          height: 80vh;
                          background-color: #b8b8d1;
                          padding: 20px;
                          border: solid 5px #482279;
                          border-radius: 10px;
                          overflow-y: scroll;
                          overflow: auto;
                          scroll-behavior: smooth;
                          line-height: 5vh;
                        }
                        
                        .user {
                          display: inline-block;
                          text-align: start;
                          margin-right: auto;
                          align-items: flex-start;
                          background-color: #5b5f97;
                          border-radius: 10px;
                          border: solid #482279;
                          padding: 10px;
                          color: whitesmoke;
                          margin-bottom: 5px;
                          font-size: 18px;
                          font-weight: 700;
                          box-shadow: 3px 3px 3px 1px rgb(75, 75, 75);
                        }
                        
                        .otro-user {
                          display: inline-block;
                          text-align: end;
                          margin-left: auto;
                          align-items: flex-end;
                          background-color: #ffc145;
                          border-radius: 10px;
                          border: solid #482279;
                          padding: 10px;
                          margin-bottom: 5px;
                          font-size: 18px;
                          font-weight: 700;
                          box-shadow: 3px 3px 3px 1px rgb(75, 75, 75);
                        }
                        
                        .form-chat {
                          display: flex;
                          justify-content: center;
                          flex-direction: column;
                          width: 100%;
                          min-height: 200px;
                        }
                        
                        .input {
                          border: solid 1px;
                          border-color: black;
                          border-radius: 10px;
                          height: 40px;
                          width: 100%;
                          font-size: 24px;
                          text-align: start;
                          background-color: whitesmoke;
                        }
                        
                        .boton-enviar {
                          border: solid 5px;
                          border-color: black;
                          border-radius: 10px;
                          height: 60px;
                          width: 100%;
                          font-size: 24px;
                          background-color: rgb(108, 57, 226);
                          color: whitesmoke;
                          margin-top: 10px;
                          font-family: "Edu NSW ACT Foundation", cursive;
                        }                           
                    `;

    this.innerHTML = `
        <div class="container-chat">               
          <h1 class="titulo"> Chat ID: ${state.data.roomIdCorto} </h1>
          <div class="chat">
            ${this.messages
              ?.map((m) => {
                return `<div class="${determinarClase(
                  m.from,
                  state.data.nombre
                )}"> ${m.from}:
                 ${m.message}</div>`;
              })
              .join(" ")}
          </div>
          <form class="form-chat">
              <input class="input" type="text" name="msj">
              <button class="boton-enviar"> Enviar </button>
          </form> 
        </div>     
      `;

    this.appendChild(style);

    let chat = document.querySelector(".chat") as any;

    chat.scrollTop = chat.scrollHeight;
    this.addListeners();
  }
}
customElements.define("chat-page", ChatRoom);
