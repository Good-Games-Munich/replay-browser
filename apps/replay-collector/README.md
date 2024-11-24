# Slippi Replay Collector

A simple microservice for collecting Slippi replays from Wii consoles.

# Architecture

- 📞 [h3](https://h3.unjs.io/) is used for the REST API
- 🐸 [SlippiJS](https://github.com/project-slippi/slippi-js) is used to connect to the Wii consoles and collect replays, as well as parsing them
- 📦 [workerpool](https://github.com/josdejong/workerpool) is used to offload the SlippiJS connection to a separate worker thread
