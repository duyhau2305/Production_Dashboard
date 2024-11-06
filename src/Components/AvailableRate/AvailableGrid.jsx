import AvailableCard from "./AvailableCard";

function AvailableGrid({ machines, machineType, selectedDate, viewMode }) {
  return (
    <div className="grid grid-cols-2 gap-2 overflow-y-auto" >
      {machines.map((machine) => (
        <AvailableCard
          key={machine._id}
          machineName={machine.deviceName}
          deviceId={machine._id}
          selectedDate={selectedDate}
          machineType={machineType}
          viewMode={viewMode} // Truyền viewMode vào AvailableCard
        />
      ))}
    </div>
  );
}

export default AvailableGrid;
