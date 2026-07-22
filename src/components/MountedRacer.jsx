import React from 'react';
import { assetUrl } from '../utils/assets';

// Centralized configuration to smartly position different mounts and riders.
// You can tweak these percentages as you add more mounts to get the perfect seating position.
const MOUNT_CONFIG = {
  werewolf: {
    imagePath: '/images/characters/Werewolf.webp', // Update path if stored elsewhere
    riderOffset: { x: '-2%', y: '-15%' }, // Shifts the rider left/right and up/down
    riderScale: 0.7, // Shrinks the rider so they fit proportionately on the mount
    clipBottom: '45%', // Percentage of the bottom of the rider image to cut off (the waist)
  },
  gator: {
    imagePath: '/images/characters/Gator.webp',
    riderOffset: { x: '3%', y: '-22%' }, 
    riderScale: 0.75,
    clipBottom: '45%',
  },
  default: {
    imagePath: '/images/characters/Werewolf.webp',
    riderOffset: { x: '0%', y: '-15%' },
    riderScale: 0.75,
    clipBottom: '45%',
  }
};

export default function MountedRacer({ racer, mountKey, className, style }) {
  const config = MOUNT_CONFIG[mountKey] || MOUNT_CONFIG.default;
  
  // Handle native left-facing hero images (Gil and Crocagator face left in their original art).
  // Since our mounts are being forced to face right natively, we must flip these specific riders to match.
  const needsRiderFlip = racer.id && ['gil', 'crocagator'].includes(racer.id.toLowerCase());
  
  return (
    <div className={`relative h-full w-full ${className || ''}`} style={style}>
      {/* Mount Image - Forced to face right natively via scaleX(-1) */}
      <img 
        src={assetUrl(config.imagePath)} 
        alt="Mount" 
        className="absolute bottom-0 left-0 h-full w-full origin-bottom object-contain"
        style={{ transform: 'scaleX(-1)' }}
        draggable={false}
      />
      
      {/* Rider Image - Clipped at the waist and shifted onto the back */}
      <img 
        src={assetUrl(racer.imagePath)} 
        alt={racer.name} 
        className="absolute bottom-0 left-0 h-full w-full origin-bottom object-contain"
        style={{ 
          clipPath: `inset(0 0 ${config.clipBottom} 0)`,
          transform: `translate(${config.riderOffset.x}, ${config.riderOffset.y}) scale(${config.riderScale}) ${needsRiderFlip ? 'scaleX(-1)' : ''}`,
        }}
        draggable={false}
      />
    </div>
  );
}