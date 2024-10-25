import React, { useEffect, useState } from 'react';

const TelemetryData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // To handle errors
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    const fetchTelemetryData = async () => {
      try {
        const username = 'oee2024@gmail.com'; // Replace with your username
        const password = 'Oee@2124'; // Replace with your password
        const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJvZWUyMDI0QGdtYWlsLmNvbSIsInVzZXJJZCI6IjVlYjMxNTAwLWRiMDgtMTFlZS05NzBiLWY3ZjRiYTZhZDU4MSIsInNjb3BlcyI6WyJURU5BTlRfQURNSU4iXSwic2Vzc2lvbklkIjoiNzk5MWZiMTctMzJhOC00NjYxLTg1YTEtOGIyNDhjYWYyZjQxIiwiaXNzIjoiRGF0YWluc2lnaHQudm4iLCJpYXQiOjE3MjgwMDQ1ODAsImV4cCI6MTcyODAxMzU4MCwiZmlyc3ROYW1lIjoiU21hcnQgIiwibGFzdE5hbWUiOiJGYWN0b3J5IiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6ImIxMTg0YWIwLWRiMDYtMTFlZS05NzBiLWY3ZjRiYTZhZDU4MSIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.w8ydcATQ7CzBq6atY8gSx_Z_88romSvKRPk8uj_iB1CIMKSnrsO8AfevT0sY0g47pSzVlb-vepD4LO1yNPr_Ig'; // Replace with your token

        // Encode username and password in Base64 for Basic Auth
        const encodedCredentials = btoa(`${username}:${password}`);

        const response = await fetch(
          'http://cloud.datainsight.vn:8080/api/plugins/telemetry/DEVICE/543ff470-54c6-11ef-8dd4-b74d24d26b24/values/timeseries?keys=status&interval=36000&limit=50000&startTs=1704780039000&endTs=1733724039000',
          {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${encodedCredentials}`, // Send username and password via Basic Auth
              'X-Token': token, // Pass token
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('API Response:', result);

        // Store the data in localStorage
        localStorage.setItem('telemetryData', JSON.stringify(result));

        // Update the state with the new data
        setData(result);
        setLoading(false); // Set loading to false once data is loaded
      } catch (error) {
        console.error('Fetch error: ', error);
        setError(error.message); // Update error state
        setLoading(false); // Set loading to false in case of error
      }
    };

    // Check if data exists in localStorage first
    const storedData = localStorage.getItem('telemetryData');
    if (storedData) {
      setData(JSON.parse(storedData)); // Load from localStorage if available
      setLoading(false);
    } else {
      fetchTelemetryData(); // Fetch if no data in localStorage
    }
  }, []);

  return (
    <div>
      <h1>Telemetry Data</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default TelemetryData;
