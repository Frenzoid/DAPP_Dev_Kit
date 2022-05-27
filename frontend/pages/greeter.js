import { useEffect, useRef, useState } from "react";
import { DEPLOYER_ADDRESS } from "../config/constants";

export default function Greeter({ onTransaction, wrongNetwork, getContract, setOnTransaction, getENSorAdress }) {

  const [greeter, setGreeter] = useState(null);
  const [greeterEvent, setGreeterEvent] = useState([]);
  const newGreet = useRef(null);


  // Contract functions.
  const setGreeting = async () => {
    if (newGreet.current.value) {
      const contract = getContract();

      const tx = await contract.setGreeting(newGreet.current.value);
      setOnTransaction(true);
      await tx.wait();
      setOnTransaction(false);

      greet();
    }
  }

  const greet = async (e) => {
    const contract = getContract();
    const greeting = await contract.greet();
    setGreeter(greeting);
  }

  const setGreetEventListener = async () => {
    const contract = getContract();
    contract.on('Greet', async (address, greeting) => {
      const from = await getENSorAdress(address);
      const greetEvents = [...greeterEvent, `${from} says: ${greeting}`];
      setGreeterEvent(greetEvents);
    });
  }

  const loadViewData = async () => {
    greet();
    setGreetEventListener();
  }

  // Effects.
  useEffect(() => {
    // If we are in the correct network ( network where our contract is deployed ), request data to contract.
    if (!wrongNetwork) loadViewData();
  }, [wrongNetwork]);


  const renderGreetEventList = () => {
    if (greeterEvent.length > 0) {
      return (
        <div className={"mt-5"}>
          <h3>Greeting Events: </h3>
          <ul>
            {greeterEvent.map((event, index) => {
              return <li key={index}>{event}</li>
            })}
          </ul>
        </div>
      )
    }
  }


  // Components render.
  const renderLoadingGif = () => {
    if (onTransaction)
      return (
        <div className={"text-center"} >
          <img width="50%"
            src="./loading.gif" alt="Loading..." />
        </div>
      );
  }

  const renderBody = () => {
    return (
      <div>
        <h1 className={"text-center mt-2 mb-2"}>{greeter}</h1>
        <div className={"input-group mb-3"}>
          <input type="text" ref={newGreet} className={"form-control"} />
          <div className={"input-group-append"}>
            <button className={"btn btn-primary"} type="button" onClick={setGreeting}>Set Greeter</button>
          </div>
        </div>
        <div>Created by <code><a href="https://frenzoid.dev">{DEPLOYER_ADDRESS} - MrFrenzoid</a></code> </div>
        {renderGreetEventList()}
      </div>
    );
  }

  return (
    <div>
      {renderBody()}
      {renderLoadingGif()}
    </div>
  );
}