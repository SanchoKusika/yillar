import type { InputHTMLAttributes } from "react";
import styles from "./TextInput.module.css";

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function TextInput(props: TextInputProps) {
  return <input {...props} className={styles.input} />;
}
