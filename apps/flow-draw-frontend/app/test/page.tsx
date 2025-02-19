"use client"

import React, { useState } from "react";
import { SketchPicker } from "react-color";

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState("#ffffff"); // Default color

  return (
    <SketchPicker
      color={color}
      onChangeComplete={(newColor) => setColor(newColor.hex)}
    />
  );
};

export default ColorPicker;
