import styles from "./styles.module.css";

export interface ProgressBarProps {
  collected: number;
  goal: number;
  max: number;
}

function ProgressBar({ collected, goal, max }: ProgressBarProps) {
  return (
    <progress
      className={styles.progress}
      value={(collected * 100) / goal}
      max={max}
    >
      {(collected * 100) / goal}%
    </progress>
  );
}

export default ProgressBar;
