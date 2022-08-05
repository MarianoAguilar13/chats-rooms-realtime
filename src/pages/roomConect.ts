import { Router } from "../../node_modules/@vaadin/router";
import { state } from "../state";

class Room extends HTMLElement {
  connectedCallback() {
    this.render();
    const form = this.querySelector(".form-user");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = e.target as any;

        const valueRoom = target.room.options[target.room.selectedIndex].value;
        const roomIdCorto = target.roomid.value;

        //cuando envio el formulario guardo el dato del roomIdCorto
        //dentro del state
        state.setRoomIdCorto(roomIdCorto);
        console.log(valueRoom);
        console.log(roomIdCorto);

        //si tenemos seleccionado value1 que corresponde a crear
        //un nuevo room, entonces creamos el room, guardamos el id
        //largo y luego vamos a la pagina "/chat" para conectarnos a esa room

        if (valueRoom == "value1") {
          state.crearRoom(() => {
            state.roomIdLargo(() => {
              Router.go("/chat");
            });
          });
        } else {
          //si tiene el value2 entonces es porque el usuario se va
          //a conectar a una room creada con el idCorto que ingrese
          //en el formulario luego va a "/chat" donde se conectara
          state.roomIdLargo(() => {
            Router.go("/chat");
          });
        }
      });
    }
  }

  // shadow = this.attachShadow({ mode: "open" });

  render() {
    //creo el style, que solo puede ser usados por elementos del header-el
    let style = document.createElement("style");
    style.textContent = `
                    * {
                      box-sizing: border-box;
                    }
                    
                    body {
                      padding: 0;
                      font-family: "Edu NSW ACT Foundation", cursive;
                    }
                    
                    .container-form {
                      display: flex;
                      flex-direction: column;
                      justify-content: space-around;
                      width: 300px;
                      margin: auto;
                    }
                    
                    .titulo {
                      font-weight: 700;
                      font-size: 48px;
                      text-align: center;
                    }
                    
                    .form-user {
                      display: flex;
                      justify-content: center;
                      flex-direction: column;
                      width: 100%;
                      min-height: 200px;
                    }
                    
                    .container {
                      padding: auto 30px;
                    }
                    
                    .label {
                      font-size: 24px;
                      font-weight: 700;
                    }
                    
                    .input {
                      border: solid 1px;
                      border-color: black;
                      border-radius: 10px;
                      height: 40px;
                      width: 100%;
                      font-size: 24px;
                      text-align: start;
                    }
                    
                    .boton-comenzar {
                      border: solid 5px;
                      border-color: black;
                      border-radius: 10px;
                      height: 60px;
                      width: 100%;
                      font-size: 24px;
                      background-color: rgb(108, 57, 226);
                      color: whitesmoke;
                      margin-top: 20px;
                    }
  
                  `;

    this.innerHTML = `
    <div class="container-form">
      <h1 class="titulo">Conectar al Chat-Room</h1>
      <form class="form-user">
        <div class="container">
          <label class="label">Room - opciones</label>
          <select name="room" class="input select">
            <option value="value1">nuevo room</option>
            <option value="value2" selected>room existente</option>
          </select>
        </div>
        <div class="container room-container">
          <label class="label">Room id</label>
          <input class="input" type="text" name="roomid" />
        </div>
        <button class="boton-comenzar">Comenzar</button>
      </form>
    </div>  
    `;

    this.appendChild(style);

    const selectEl = document.querySelector(".select") as any;
    const roomContainerEl = document.querySelector(".room-container") as any;

    function select() {
      return selectEl.options[selectEl.selectedIndex].value;
    }

    selectEl.addEventListener("click", () => {
      if (select() == "value1") {
        roomContainerEl.style.visibility = "hidden";
      } else {
        roomContainerEl.style.visibility = "visible";
      }
    });
  }
}
customElements.define("room-page", Room);
