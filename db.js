const fetch = require('node-fetch');
require('dotenv').config();
const URL = process.env.URL;

function getMissions(){
    return fetch(`${URL}/missions`)
        .then(res => res.json());
}

function getStages(){
    return fetch(`${URL}/stages`)
        .then(res => res.json());
}

function getStagesByMission(missionId){
    return fetch(`${URL}/missions/${missionId}/stages`)
        .then(res => res.json());
}

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

function getTopTimesByUser(userId){
    return getTopTimes()
        .then(topTimes => topTimes.filter(topTime => topTime.userId === userId));
}

function getTime(stageId, userId){
    const fetchUrlEnd = userId
        ? `user/${userId}/top`
        : `top`;
    return fetch(`${URL}/stages/times/${stageId}/${fetchUrlEnd}`)
        .then(res => res.json())
        .then(json => json[0]);
}

function getUserName(userId){
    return fetch(`${URL}/users/${userId}`)
        .then(res => res.json())
        .then(json => json[0]);
}

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

module.exports = {getMissions, getStages, getStagesByMission, getTopTimes, getTopTimesByUser, getTime, getUserName, getTopTimesAsEmbed, insertUser}