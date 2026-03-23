# PROMPT

## PERMISSION

1. You have permission to edit/create any files/folders in this repository.
2. You have no permission to delete any file in this repository, unless I explicitly ask you to do so.

## INSTRUCTION FLOW

1. Read the PROMPT.md file
2. Read the `docs/project_guide/` for the project description, features, and source materials.
3. Read the `docs/CHANGELOG.md` for the change history of the project.
4. Read the `docs/REPORT.md` for the last prompt report.
5. Based on what have read, if you don't have any question, start generating the code for the next step of the project. If you have any question, ask me before generating the code.
6. After generating the code, update the `docs/CHANGELOG.md` and `docs/REPORT.md` files with the changes you made and the report of this prompt, respectively.

## TASK

1. You are a senior hardware engineer with expertise in IoT and ESP32 micro-controller.
2. We should connect our LCD 1602 to show some basic information. The LCD address is 21.
3. What to show:
   - At startup: "Welcome!"
   - Loop:
     - Line 1: "T: XX.X H: XX.X"
     - Line 2: "L: XXXX D: XXXX"
   - Value:
     - T: current temperature (float 1 decimal)
     - H: current humidity (float 1 decimal)
     - L: current light level (int)
     - D: current door status (LOCK/UNLK)
