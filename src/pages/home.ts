//como la libreria de @vaadin rutes trabaja con componentes
//las page no las voy a trabajar como las venia haciendo, sino voy
//a crear componentes y luego los voy a exportar y en el archivo
//router.ts voy acrear la ruta de la page con el componente

import { Router } from "@vaadin/router";
import { state } from "../state";

class Home extends HTMLElement {
  connectedCallback() {
    this.render();
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
                    
                    .boton {
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
      <h1 class="titulo">Bienvenidos</h1>
        <div class="container">
          <button class="boton boton-nuevo">Nueva Cuenta</button>
          <button class="boton boton-entrar">Ya tengo una cuenta</button>
        </div>             
    </div>  
    `;

    this.appendChild(style);

    const botonElNuevo = document.querySelector(".boton-nuevo") as any;
    const botonElYaTengo = document.querySelector(".boton-entrar") as any;

    botonElNuevo.addEventListener("click", () => {
      Router.go("/signup");
    });

    botonElYaTengo.addEventListener("click", () => {
      Router.go("/signin");
    });
  }
}
customElements.define("home-page", Home);
