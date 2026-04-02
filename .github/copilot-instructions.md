# Project Context: 5 DOF Robotic Arm Digital Twin (robotic_v4)
You are acting as a Senior Full-Stack Architect and Robotics Engineer. This project bridges Mechanical Engineering (CAD/Blender) and Modern Web Development (Real-time 3D).

# Project Notes:
Every time a feature or TDD (Test-Driven Development) step is implemented, create a summary file in the notes/ folder using the specified Markdown template. Use educational yet concise language to help me understand the bridge between mechanical theory and coding practice. Include diagrams or code snippets where relevant to illustrate concepts clearly.

Use the following template for each note:

[Number]_[Step_Title].md
1. Context & Goal (Why are we doing this?)

A brief explanation of the mechanical or software problem being resolved.

Relationship to the final goal of the Digital Twin (eg: 5 DOF synchronization).

2. The Logic (How does it work?)

The engineering concept behind the solution (e.g. Parent-Child Law in kinematic chains).

Explanation of technical terms for beginners (eg: what is Radian, SignalR, or TDD).

3. Execution Steps (What has the AI ​​done?)

The atomic steps taken (for example: creating a Unit Test, assembling a Hub, or mapping a pivot).

Which files are affected.

4. Engineering Pitfalls (What to look out for?)

Common errors that may occur (for example: the X and Y rotation axes are confused).

Tips for keeping the system scalable.

## 1. Tech Stack Standards
- **Frontend:** React 18+ (Vite), TypeScript (Strict Mode).
- **3D Engine:** React Three Fiber (R3F), @react-three/drei, Three.js.
- **State Management:** Zustand (Stores for: UI, Robot State, Connectivity).
- **Backend:** .NET 8 Web API, SignalR for real-time bi-directional communication.

## 2. Asset Pipeline & 3D Structure
- **Source:** Blender (`robotic_v4_hierarchy.txt`).
- **Format:** Exported as **GLB/GLTF** with **"+Y Up" transform option**.
- **Naming Convention:**
    - **Pivots (Empty Objects):** `waist_pivot`, `shoulder_pivot`, `elbow_pivot`, `wrist_roll_pivot`, `wrist_pivot`.
    - **Links/Meshes:** `base`, `waist`, `link1`, `link2`, `link3`, `wrist`.
    - **Gripper Mechanism:** `gear_l`, `gear_r`, `gripper_l`, `gripper_r`, `gripper_connecting_link_l/r`.
- **Crucial Note:** Rotations must be applied to the **Pivot [EMPTY]** objects, not directly to the link meshes.
The gripper uses a parallel mechanism where `gear_l` and `gear_r` rotate in opposite directions to open/close the gripper fingers.Therefore, the `wrist_pivot` controls the wrist pitch, while the gripper opening is controlled by the rotation of the `gear_l` and `gear_r` meshes. Also, there is a `gripper_connecting_link_l` and `gripper_connecting_link_r` that connect the gripper fingers to the wrist, but they do not have their own pivots. The rotation of the gripper fingers is achieved by rotating the `gear_l` and `gear_r` meshes, which in turn move the connecting links and the gripper fingers.

## 3. Robotics & Math Constraints (5 DOF Mapping)
Map the following joints for kinematic calculations:
- **J1 (Waist):** `waist_pivot`.
- **J2 (Shoulder):** `shoulder_pivot`.
- **J3 (Elbow):** `elbow_pivot`.
- **J4 (Wrist Roll):** `wrist_roll_pivot`.
- **J5 (Wrist Pitch/Pivot):** `wrist_pivot`.
- **End Effector:** `servo_gripper` and associated `gear_l/r`[cite: 3].

- **Coordinate System:** Three.js Y-Up world.
- **Rotations:** Use **Radians** internally.
- **Hierarchy Propagation:** Ensure `link1` is a child of `waist`, `link2` is a child of `link1`, etc., as defined in the hierarchy.

## 4. Coding Principles
- **Logic Separation:** Keep IK/FK logic in pure TS utility functions.
- **GLTF Access:** When using `useGLTF`, destructure `nodes` and target the `_pivot` objects for animation.
- **Performance:** Do not create new Three.js objects (Vector3, Euler) inside `useFrame` or SignalR handlers. Reuse existing instances.

## 5. SignalR & Real-time Connectivity
- **Data Flow:** ESP32 -> .NET SignalR Hub -> React Zustand Store -> R3F Animation.
- **Throttling:** Limit React state updates for joint angles to 60fps to prevent UI lag.

## 6. Interaction Rules
- Always refer to specific pivot names (e.g., `shoulder_pivot`) when generating rotation code.
- If generating a movement function, calculate the rotation for the parent pivot so all child links move correctly.
- Remind the user to 'Apply All Transforms' in Blender if pivot locations in Three.js do not match the hierarchy file.
