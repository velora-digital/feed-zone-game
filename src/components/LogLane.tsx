import React from 'react';
import Road from './Road';
import Log from './Log';

export default function LogLane({ rowIndex, rowData }) {
  return (
    <Road rowIndex={rowIndex}>
      {rowData.vehicles.map((vehicle, index) => (
        <Log
          key={index}
          rowIndex={rowIndex}
          logIndex={vehicle.index}
          direction={rowData.direction}
          speed={rowData.speed}
          total={rowData.vehicles.length}
        />
      ))}
    </Road>
  );
}
