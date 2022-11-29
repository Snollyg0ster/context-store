import { useSelector } from "../../store/store";

const Count = () => {
  const count = useSelector((store) => store.game.count);

  console.log(">>> count rerender");

  return (
    <div>
      <div>Count - {count}</div>
    </div>
  );
};

export default Count;
