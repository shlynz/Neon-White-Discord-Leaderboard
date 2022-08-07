# Neon White Discord Leaderboard
This is a bot that intends to improve the experience of racing against your server members. I think it's annoying to have to click through every stage, just to check if someone has beaten my times. Our current workaround to this is posting a screenshot in a specified channel, but images are difficult to search for. Thus, you can't quickly check, if that one level you're really proud of has been beaten. This bot aims to improve that experience with the help of commands, to quickly check the status of a stage or user.

### Commands
- `/register`
  - Registers the calling user to the db
- `/time <mission> <stage> <time>`
  - Adds a new time for the calling user to the db
- `/top [mission] [stage]`
  - Shows the top time(s) for the specified query. Shows all top times if nothing is specified
- `/userinfo [user]`
  - Shows the top times of the specified user. If none specified, calling user is used

### Current version:
The current version of this bot is very much still in development and doesn't really offer any usable feature.

### TODOs
- [x] Implement timekeeping, the main feature LUL
- [x] Add a list of available commands
- [ ] Add instructions on how to set up
- [ ] Allow for confirmation after a user submits a new time
  - [ ] Allow for confirmation only after placing better than specified place
- [ ] Improve usability to broaden the usecase of this bot (eg. Trackmania)
- [ ] Improve readability of `/userinfo`. The current wall of text is way to big
- [ ] Add command to remove a time
- [ ] Setup and use Docker
- [ ] Very ambitious: Try to read new times from screenshots