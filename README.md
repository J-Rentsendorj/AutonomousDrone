# AutonomousDrone

A simple Qt‑based ground control station (GCS) mockup for an autonomous racing drone.  
The application is written in Python using **PySide6** and provides a placeholder UI with video feed, telemetry, controls, and logging.

## Features

- Stand‑alone GUI using PySide6
- Simulated connection status and telemetry
- Arm, start and kill buttons
- PID tuning panel and log output

## Requirements

- Python 3.9+
- `PySide6` package
- OpenGL libraries (`libGL.so.1` etc.)
- X11/display server or an appropriate virtual framebuffer (e.g. `xvfb`) to run the GUI

## Installation

```bash
# create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# install Python dependencies
pip install PySide6
```

On a headless system you may need additional libraries, for example on Ubuntu:
```bash
sudo apt update
sudo apt install libgl1-mesa-glx xvfb
```

## Running

```bash
python3 main.py
```

If you are using a container without a display, start the program under a virtual framebuffer:

```bash
xvfb-run python3 main.py
```

## Development

The code consists of a single entry point (`main.py`) and can be extended with real telemetry, video feeds, and control logic.

## License

MIT License (or change as appropriate)
