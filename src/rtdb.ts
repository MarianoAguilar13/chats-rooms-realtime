import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  onValue,
  DataSnapshot,
} from "firebase/database";

const firebaseConfig = {
  //usuarios y servicios => cuentas de servicios => secretos de la base de datos
  //ahi encuentro la key
  apiKey: "IMwxVC7HhvDPPIdKuk1cEmQWViG8ec9m5vPcCpQ6",
  databaseURL: "https://chat-realtime-ed3a6-default-rtdb.firebaseio.com/",
  authDomain: "chat-realtime-ed3a6.firebaseapp.com",
  projectId: "chat-realtime-ed3a6",
};

const firebaseApp = initializeApp(firebaseConfig);
const rtdb = getDatabase(firebaseApp); //RTDB//

export { rtdb };
