export interface RawHardwareData {
  /**
   * J1 (waist_pivot) in degrees from hardware controller.
   * Allowed hardware envelope: 0..180.
   */
  waist: number;

  /**
   * J2 (shoulder_pivot) in degrees from hardware controller.
   * Allowed hardware envelope: 0..180.
   */
  shoulder: number;

  /**
   * J3 (elbow_pivot) in degrees from hardware controller.
   * Allowed hardware envelope: 0..180.
   */
  elbow: number;

  /**
   * J4 (wrist_roll_pivot) in degrees from hardware controller.
   * Allowed hardware envelope: 0..180.
   */
  wristRoll: number;

  /**
   * J5 (wrist_pivot) in degrees from hardware controller.
   * Allowed hardware envelope: 0..180.
   */
  wrist: number;
}
