import AvailableCard from "./AvailableCard";

function AvailableGrid({ machines, machineType, selectedDate, viewMode }) {
  // Sắp xếp machines theo deviceName (chữ và số)
  const sortedMachines = [...machines].sort((a, b) => {
    const [, aPrefix, aNumber] = a.deviceName.match(/^([A-Za-z]+)(\d+)$/) || [];
    const [, bPrefix, bNumber] = b.deviceName.match(/^([A-Za-z]+)(\d+)$/) || [];

    // So sánh phần chữ cái trước
    if (aPrefix !== bPrefix) {
      return aPrefix.localeCompare(bPrefix);
    }

    // Nếu phần chữ cái giống nhau, so sánh phần số
    return parseInt(aNumber) - parseInt(bNumber);
  });

  return (
    <div className="grid grid-cols-2 gap-2 overflow-y-auto">
      {sortedMachines.map((machine) => (
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
