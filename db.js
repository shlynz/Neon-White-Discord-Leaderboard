const fetch = require('node-fetch');
require('dotenv').config();
const URL = process.env.URL;

// returns all missions
function getMissions(){
    return fetch(`${URL}/missions`)
        .then(res => res.json());
}

// returns a mission by id
function getMissionById(missionId){
    return fetch(`${URL}/missions/${missionId}`)
        .then(res => res.json())
        .then(json => json[0]);
}

// return all stages
function getStages(){
    return fetch(`${URL}/stages`)
        .then(res => res.json());
}

// return a stage by id
function getStageById(stageId){
    return fetch(`${URL}/stages/${stageId}`)
        .then(res => res.json());
}

// return all stages in mission by id
function getStagesByMission(missionId){
    return fetch(`${URL}/missions/${missionId}/stages`)
        .then(res => res.json());
}

// return the top time of all stages, users best times if given
function getTopTimes(userId){
    const fetchUrlEnd = userId
        ? `user/${userId}/top`
        : `top`;
    return getStages()
        .then(stages =>
            Promise.all(stages.map(stage =>
                fetch(`${URL}/stages/times/${stage.id}/${fetchUrlEnd}`)
                    .then(res => res.json())
                    .then(json => json[0])
                    .then(entry => {
                        if(!entry) return {error: true};
                        const id = entry.stageId;
                        const missionName = entry.mission.name;
                        const stageName = entry.stage.name;
                        const stageTime = entry.time;
                        const userName = entry.user.name;
                        const userId = entry.user.id;
                        return {id, missionName, stageName, stageTime, userName, userId};
                    })
            ))
        )
        .then(times => Promise.all(times.filter(time => !time.error)));
}

// return the top times that were done by given user
function getTopTimesByUser(userId){
    return getTopTimes()
        .then(topTimes => topTimes.filter(topTime => topTime.userId === userId));
}

// return the top time of the given stage, users best time if given
function getTime(stageId, userId){
    const fetchUrlEnd = userId
        ? `user/${userId}/top`
        : `top`;
    return fetch(`${URL}/stages/times/${stageId}/${fetchUrlEnd}`)
        .then(res => res.json())
        .then(json => json[0]);
}

// return user by id
function getUserName(userId){
    return fetch(`${URL}/users/${userId}`)
        .then(res => res.json())
        .then(json => json[0]);
}

// return all top times, formatted as embed ready, users best times if given
function getTopTimesAsEmbed(userId){
    return getMissions()
        .then(missions =>
            // map every mission to a string list of the stages and their times 
            Promise.all(
                missions.map(mission =>
                    // get the stages of the given mission
                    getStagesByMission(mission.id)
                        .then(stages => 
                            Promise.all(
                                // map the stages to a string of the name and the time, NA if no time was found
                                stages.map(stage =>
                                    getTime(stage.id, userId)
                                        .then(result => `${stage.name}: ${result?.time || 'NA'}`)
                                )
                            )
                            .then(times => times.join('\n'))
                        )
                        // return the result in the required field format for the embed
                        .then(stageTimes => {
                            return {name: mission.name, value: stageTimes, inline: true}
                        })
                )
            )
        )
}

// return top times of given mission, formatted as embed ready, users best time if given
function getMissionTopTimesAsEmbed(missionId, userId){
    return getMissionById(missionId)
        .then(mission =>
            getStagesByMission(mission.id)
                .then(stages =>
                    Promise.all(
                        stages.map(stage =>
                            getStageTopTimeAsString(stage.id, userId)
                        )
                    )
                    .then(times => times.join('\n'))
                )
                .then(stageTimes => {
                    return {name: mission.name, value: stageTimes, inline: true}
                })
        )
}

// return top time of given stage, formatted as string (stageName: time or NA), users best time if given
function getStageTopTimeAsString(stageId, userId){
    return getStageById(stageId)
        .then(stage => 
            getTime(stage.id, userId)
                .then(result => `${stage.name}: ${result?.time || 'NA'}`)
        )
}

// return top time of given stage, formatted as embed ready, users best time if given
function getStageTopTimeAsEmbed(stageId, userId){
    return getStageById(stageId)
        .then(stage =>
            getTime(stageId, userId)
                .then(result => {
                    return {name: result.mission.name, value: `${result.stage.name}: ${result?.time || 'NA'}`}
                })
        )
}

// add Discord user to db
function insertUser(user){
    const data = {
        id: user.id,
        name: user.username
    };
    return fetch(`${URL}/users/`,
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
}

module.exports = {getMissions, getStages, getStagesByMission, getTopTimes, getTopTimesByUser, getTime, getUserName, getTopTimesAsEmbed, getMissionTopTimesAsEmbed, getStageTopTimeAsEmbed, insertUser}