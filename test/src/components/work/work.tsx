import { increment } from "../../store/actions";
import { useDispatch, useSelector } from "../../store/store";

const Work = () => {
  const dispatch = useDispatch();

  console.log(">>> work rerender");

  const doSomeWork = () => dispatch(increment());

  return (
    <div className="work-cont">
      <div className="work-cont_title" onClick={doSomeWork}>
        Work
      </div>
    </div>
  );
};

export default Work;
