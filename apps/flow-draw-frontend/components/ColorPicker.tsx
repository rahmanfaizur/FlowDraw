import React, { useState } from 'react';
import ColorPicker from 'react-pick-color';
import hexToRgba from 'hex-to-rgba';

export const ColorWheel = () => {
  const [color, setColor] = useState('#fff');
    const rgba = hexToRgba(color);
  return <ColorPicker color={color} onChange={color => setColor(color.hex)} />;
};