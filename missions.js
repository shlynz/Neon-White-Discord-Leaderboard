const missionsJson = require('./missions.json')
const missions = Object.keys(missionsJson.Missions).map(mission => missionsJson.Missions[mission]);

function getMissions(){
    const result = new Map();

    missions.map(mission => {
        return mission.stages.map(stage => {
            const stageId = mission.id + stage.id;
            result.set(stageId, {
                mission: mission.name,
                stage: stage.name
            });
        })
    })

    return result;
}

function getChoices(){
    return missions.flatMap(mission => {
        return mission.stages.map(stage => {
            const stageId = mission.id + stage.id;
            const stageName = mission.name + ' - ' + stage.name;
            return {name: stageName, value: stageId};
        })
    });
}

function getMissionNames(){
    return missions.map(mission => mission.name);
}

function getStageNames(){
    const result = new Map();
    missions.map(mission => result.set(mission.name, mission.stages.map(stage => stage.name)));
    return result;
}

module.exports = {missions: getMissions(), choices: getChoices(), missionNames: getMissionNames(), stageNames: getStageNames()};