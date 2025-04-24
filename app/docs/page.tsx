import React from "react";
import { Questionnaire } from "../components/Questionnaire";

function Docs() {
  return (
    <div className="w-full min-h-screen flex px-4">
      <div className="w-2/3  border rounded-lg">
        <Questionnaire />
      </div>
    </div>
  );
}

export default Docs;
