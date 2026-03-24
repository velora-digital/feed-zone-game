import React from 'react';
import Road from './Road';
import Ball from './Ball';

// Map cycling hazard types to colors
const hazardToColor = {
  motorbike: 0xf44336,   // red — motorbike (TV/race)
  commissaire: 0xff9800, // orange — commissaire motorbike
  peloton: 0x2196f3,     // blue — peloton group
  breakaway: 0x9c27b0,   // purple — breakaway riders
};

export default function BallLane({ rowIndex, rowData }) {
  return (
    <Road rowIndex={rowIndex}>
      {rowData.entities.map((entity, index) => (
        <Ball
          key={index}
          rowIndex={rowIndex}
          ballIndex={entity.index}
          direction={rowData.direction}
          speed={rowData.speed}
          color={hazardToColor[entity.species] || 0x2196f3}
          total={rowData.entities.length}
          needsFeed={entity.needsFeed && !entity.fed}
          animalIndex={index}
          packSize={entity.packSize}
          feedWindowStart={entity.feedWindowStart}
          feedWindowDuration={entity.feedWindowDuration}
        />
      ))}
    </Road>
  );
}
