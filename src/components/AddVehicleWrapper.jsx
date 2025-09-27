import Add_vehicle from "./Add_vehicle";
import { useParams } from "react-router-dom";

function AddVehicleWrapper() {
  const { id } = useParams();

  return (
    <Add_vehicle
      isOpen={true}
      onClose={() => { }}
      insuredId={id}
    />
  );
}

export default AddVehicleWrapper;