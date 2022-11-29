import Count from "./components/count";
import Work from "./components/work";
import Robots from "./components/robots";
import "./styles.css";

export default function App() {
  console.log(">>> App rerender");
  return (
    <div className="App">
      <div className="cont">
        <Count />
        <Work />
        <Robots />
      </div>
    </div>
  );
}
