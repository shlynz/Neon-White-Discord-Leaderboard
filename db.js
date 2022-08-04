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

module.exports = {getMissions, getStages, getStagesByMission, getTopTimes, getTopTimesByUser, getTime, getUserName}