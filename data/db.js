const fetch = require('node-fetch');
require('dotenv').config();
const URL = process.env.URL;

const invalidIdText = 'Please use the autocomplete feature.\n\nIf you want, you could also input the mission ID formatted like this:';
const invalidMissionIdNormalMissionsText = '**Normal missions:** Number of the mission, padded to two digits, starting at 01.\n- **Example:** Rebirth would be "01", Thousand Pound Butterfly would be "11"';
const invalidMissionIdSidequestText = '**Sidequests:** The first letters of their name.\n- **Example:** Neon Red would be "NR", Neon Yellow would be "NY"';
const invalidStageIdNormalStageText = '**Stages:** Join the missionId and the Index of the stage in that mission.\n- **Example:** Movement would be "0101", Marathon would be "1110", Choker would be "NV02"';
const isValidMissionId = (missionId) => /[\dN][\dRVY]/.test(missionId);
const invalidMissionIdText = [invalidIdText, invalidMissionIdNormalMissionsText, invalidMissionIdSidequestText].join('\n');
const isValidStageId = (stageId) => /\d{4}|([\dN][\dRVY]0[1-8])/.test(stageId);
const invalidStageIdText = [invalidIdText, invalidMissionIdNormalMissionsText, invalidMissionIdSidequestText, invalidStageIdNormalStageText].join('\n');

function checkMissionId(missionId){
    if(missionId && !isValidMissionId(missionId)){
        console.log(`Invalid missionId of: ${missionId}`);
        throw invalidMissionIdText;
    }
}

function checkStageId(stageId){
    if(stageId && !isValidStageId(stageId)){
        console.log(`Invalid stageId of: ${stageId}`);
        throw invalidStageIdText;
    }
}

// returns all missions
function getMissions(){
    return fetch(`${URL}/missions`)
        .then(res => res.json());
}

// returns a mission by id
function getMissionById(missionId){
    checkMissionId(missionId);
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
    checkStageId(stageId);
    return fetch(`${URL}/stages/${stageId}`)
        .then(res => res.json())
        .then(json => json[0]);
}

// return all stages in mission by id
function getStagesByMission(missionId){
    checkMissionId(missionId);
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
                        const userName = entry.user?.name || 'NA';
                        const userId = entry.user?.id || 'NA';
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
    checkStageId(stageId);
    const fetchUrlEnd = userId
        ? `user/${userId}/top`
        : `top`;
    return fetch(`${URL}/stages/times/${stageId}/${fetchUrlEnd}`)
        .then(res => res.json())
        .then(json => json[0]);
}

// return user by id
function getUser(userId){
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
                                        .then(result => `${stage.name}: ${result?.time || 'NA'} by ${userId ? 'yourself :)' : result?.user.name || 'NA'}`)
                                )
                            )
                            .then(times => times.join('\n'))
                        )
                        // return the result in the required field format for the embed
                        .then(stageTimes => {
                            return {name: mission.name, value: stageTimes}
                        })
                )
            )
        )
}

// return top times of given mission, formatted as embed ready, users best time if given
function getMissionTopTimesAsEmbed(missionId, userId){
    checkMissionId(missionId);
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
                    return {name: mission.name, value: stageTimes}
                })
        )
}

// return top time of given stage, formatted as string (stageName: time or NA), users best time if given
function getStageTopTimeAsString(stageId, userId){
    checkStageId(stageId);
    return getStageById(stageId)
        .then(stage => 
            getTime(stage.id, userId)
                .then(result => `${stage.name}: ${result?.time || 'NA'} by ${userId ? 'yourself :)' : result?.user.name || 'NA'}`)
        )
}

// return top time of given stage, formatted as embed ready, users best time if given
function getStageTopTimeAsEmbed(stageId, userId){
    checkStageId(stageId);
    return getStageById(stageId)
        .then(stage =>
            getTime(stageId, userId)
                .then(result => {
                    return {name: result.mission.name, value: `${result.stage.name}: ${result?.time || 'NA'} by ${userId ? 'yourself :)' : result?.user.name || 'NA'}`}
                })
        )
}

// return todo of given user, formatted as embed
function getTodoAsEmbed(userId){
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
                                    getTime(stage.id)
                                        .then(result => result.user.id === userId ? null : `${stage.name}: ${result?.time || 'NA'} by ${result?.user.name || 'NA'}`)
                                )
                            )
                            .then(times => times?.filter(time => time)?.join('\n'))
                        )
                        // return the result in the required field format for the embed
                        .then(stageTimes => {
                            return stageTimes ? {name: mission.name, value: stageTimes} : null;
                        })
                )
            )
        )
        .then(missions => missions.filter(mission => mission))
        .then(missions => missions.length > 0 ? missions : [{name: 'Good job', value: 'You currently have nothing to do :)'}])
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

// add time for specified stage to db
function insertTime(userId, missionId, stageId, time){
    checkMissionId(missionId);
    checkStageId(stageId);
    const data = {
        userId,
        missionId,
        stageId,
        time,
        date: Date.now()
    };
    return fetch(`${URL}/times/`,
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
}

function deleteTime(userId, stageId){
    checkStageId(stageId);

    return getTime(stageId, userId)
        .then(res => {
            fetch(`${URL}/times/${res.id}`, {
                method: 'DELETE',
            });
            return res;
        })
}

module.exports = {getMissions, getMissionById, getStages, getStageById, getStagesByMission, getTopTimes, getTopTimesByUser, getTime, getUser, getTopTimesAsEmbed, getMissionTopTimesAsEmbed, getStageTopTimeAsEmbed, getTodoAsEmbed, insertUser, insertTime, deleteTime}