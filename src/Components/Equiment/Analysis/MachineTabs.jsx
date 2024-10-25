const MachineTabs = ({ currentMachine, setCurrentMachine }) => {
    const machines = ['Tham Số Máy Cắt', 'Tham Số Máy Dập', 'Tham Số Máy Uốn'];
  
    return (
      <>
        {machines.map((machine) => (
          <button
            key={machine}
            className={`py-4 px-6 rounded-md w-full text-center hover:text-xl ${
              currentMachine === machine ? 'bg-cyan-900 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setCurrentMachine(machine)}
          >
            {machine}
          </button>
        ))}
      </>
    );
  };
  
  export default MachineTabs;
  