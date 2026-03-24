import React from 'react';
import Road from './Road';
import Ball from './Ball';
import Log from './Log';

const hazardToColor = {
  motorbike: 0xf44336,
  commissaire: 0xff9800,
  teamcar: 0x666666,
  caravan: 0x666666,
};

// Peloton jersey colours (not green — green is reserved for feedable)
const pelotonColors = [
  0x2196f3, // blue
  0x9c27b0, // purple
  0xff5722, // deep orange
  0x00bcd4, // cyan
  0xffc107, // amber
  0xe91e63, // pink
];

export default function RoadLane({ rowIndex, rowData }) {
  return (
    <Road rowIndex={rowIndex}>
      {rowData.entities.map((entity, index) => {
        if (entity.species === 'teamcar' || entity.species === 'caravan') {
          return (
            <Log
              key={index}
              rowIndex={rowIndex}
              logIndex={entity.index}
              direction={rowData.direction}
              speed={rowData.speed}
              total={rowData.entities.length}
            />
          );
        }
        return (
          <Ball
            key={index}
            rowIndex={rowIndex}
            ballIndex={entity.index}
            direction={rowData.direction}
            speed={rowData.speed}
            color={entity.species === 'peloton' ? pelotonColors[(index + rowIndex) % pelotonColors.length] : (hazardToColor[entity.species] || 0x2196f3)}
            total={rowData.entities.length}
            needsFeed={entity.needsFeed && !entity.fed}
            isFeedableEntity={!!entity.potentialFeed || !!entity.needsFeed || !!entity.fed || !!entity.feedExpired}
            animalIndex={index}
            packSize={entity.packSize}
            feedWindowStart={entity.feedWindowStart}
            feedWindowDuration={entity.feedWindowDuration}
          />
        );
      })}
    </Road>
  );
}
