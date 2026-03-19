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
2. Your task is to read the project structure and re-construct with a better modularization and organization. For example, for each source file .cpp in `/src/`, you should create a corresponding header file .h in the `/include/` directory.
3. I have updated the `/lib/` directory with some libraries for the project. You should use those libraries instead of writing the code from scratch. You can not modify the libraries, but you can create new one.
4. We should use RTOS for the project, so you should create tasks for each module and use queues or semaphores for inter-task communication if necessary. You can use FreeRTOS which is included in the ESP32 framework. The `/src/main.cpp` should only contain the setup and loop functions. See what I have modified in the `src/main.cpp` for reference.
