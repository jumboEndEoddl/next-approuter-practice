"use client";

import { useRef, useState } from "react";
import classes from "./image-picker.module.css";
import Image from "next/image";

export default function ImagePicker({ label, name }) {
  const [pickedImage, setPickedImage] = useState();
  const imagePicker = useRef();

  function handlePickClick() {
    imagePicker.current.click();
  }

  function handleImageChange(event) {
    const fileReader = new FileReader();
    const file = event.target.files[0];

    if (!file) {
      setPickedImage(null);
      return;
    }

    fileReader.onload = () => {
      setPickedImage(fileReader.result);
    };

    fileReader.readAsDataURL(file);
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {!pickedImage && <p>please take a picture</p>}
          {pickedImage && (
            <Image src={pickedImage} alt="user choose image" fill />
          )}
        </div>
        <input
          className={classes.input}
          type="file"
          id={name}
          name={name}
          accept="image/png, image/jpeg"
          ref={imagePicker}
          onChange={handleImageChange}
          required
        ></input>
        <button type="button" onClick={handlePickClick}>
          Choose Your Image
        </button>
      </div>
    </div>
  );
}
