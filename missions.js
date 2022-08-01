const missionsJson = require('./data/missions.json')
const missions = Object.keys(missionsJson.Missions).map(mission => missionsJson.Missions[mission]);

function getMissions(){
    return missions.map(mission => {
        return {id: mission.id, name: mission.name}
    });
}

function getStages(){
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

function getOptions(){
    return missions.flatMap(mission => {
        return mission.stages.map(stage => {
            const stageId = mission.id + stage.id;
            const stageName = mission.name + ' - ' + stage.name;
            return {label: stageName, value: stageId};
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

function getStagesByMissionId(missionId){
    return missions.filter(mission => mission.id === missionId)[0].stages;
}

module.exports = {missions: getMissions(), stages: getStages(), options: getOptions(), choices: getChoices(), missionNames: getMissionNames(), stageNames: getStageNames(), getStagesByMissionId};