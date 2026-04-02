export interface JointPivotMappingOutput {
  /**
   * Mapped output for J1 -> waist_pivot in radians.
   */
  waist_pivot: number;

  /**
   * Mapped output for J2 -> shoulder_pivot in radians.
   */
  shoulder_pivot: number;

  /**
   * Mapped output for J3 -> elbow_pivot in radians.
   */
  elbow_pivot: number;

  /**
   * Mapped output for J4 -> wrist_roll_pivot in radians.
   */
  wrist_roll_pivot: number;

  /**
   * Mapped output for J5 -> wrist_pivot in radians.
   */
  wrist_pivot: number;
}
