import { useSelector } from "../../store/store";

const Robots = () => {
  const robots = useSelector((state) => state.game.robots);

  console.log(">>> robots rerender", robots);

  return (
    <div className="robots">
      {robots.map(({ name, power }) => (
        <div className="robot" key={name}>
          {name} <sub>{power}-lvl</sub>
        </div>
      ))}
    </div>
  );
};

export default Robots;
