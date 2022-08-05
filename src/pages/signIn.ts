//como la libreria de @vaadin rutes trabaja con componentes
//las page no las voy a trabajar como las venia haciendo, sino voy
//a crear componentes y luego los voy a exportar y en el archivo
//router.ts voy acrear la ruta de la page con el componente

import { Router } from "@vaadin/router";
import { state } from "../state";

class SignIn extends HTMLElement {
  connectedCallback() {
    this.render();
    const form = this.querySelector(".form-user");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = e.target as any;

        const nombre = target.nombre.value;
        const email = target.email.value;
        console.log(email);
        console.log(nombre);

        //Primero se guarda en el state el nombre y email que fueron
        //ingresados en el formulario

        state.setNombreEmail(nombre, email);

        //Ahora vamos a autorizar al usuario si existe en la db
        //si existe el state deberia guardar el idUser, que se consiguio
        //a traves del state que hizo una llamada a la api para ver
        //si esta
        state.auth(() => {
          const cs = state.getState();
          //si existe entonces vamos a la pag de "/room"
          if (cs.idUser) {
            Router.go("/room");
          } else {
            //sino existe le decimos al usuario que no tiene una cuenta creada
            //y lo redirecciono hacia la pag encargada de crear una cuenta
            alert(
              "Su email no esta registrado, por favor cree una cuenta para continuar"
            );
            Router.go("/signup");
          }
        });
        //el nombre que se envia en el formulario, lo seteo en el
        //state, para que se guarde en la data
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
      <h1 class="titulo">SignIn</h1>
      <form class="form-user">
        <div class="container">
          <label class="label">Email</label>
          <input class="input" type="text" name="email" />
        </div>
        <div class="container">
          <label class="label">Tu nombre</label>
          <input class="input" type="text" name="nombre" />
        </div>
        <button class="boton-comenzar">Comenzar</button>
      </form>
    </div>  
    `;

    this.appendChild(style);
  }
}
customElements.define("signin-page", SignIn);
