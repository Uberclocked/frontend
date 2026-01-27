import type { FormRequestResult } from "../dynamic/form/builder/DynamicFormBuilder.types";

function SuccesComponent(correct_result: FormRequestResult) {
  return (
    <div>
      <strong>{correct_result.title}</strong>
      <p>{correct_result.description}</p>
    </div>
  );
}

export default SuccesComponent;
