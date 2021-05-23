import {indexOfByName, getByLevel} from './Helpers';
import cloneDeep from 'lodash/cloneDeep';

class ToonPowers
{
    levelPowers = [];
    fitnessPowers = [];
    inherentPowers = [];
    maxEnhancements = 67;
    numEnhancements = 0;
    static enhancementMaxLookup = 
    {
        49: 3,
        47: 6,
        44: 12,
        41: 18,
        38: 24,
        35: 30,
        32: 36,
        30: 39,
        28: 41,
        26: 43,
        24: 45,
        22: 47,
        20: 49,
        18: 51,
        16: 53,
        14: 55,
        12: 57,
        10: 59,
        8: 61,
        6: 63,
        4: 65,
        2: 67

    };

    constructor()
    {
        //level powers
        this.createLevelPowers();
    }

    
    makePowerObject(level)
    {
        return {
            level: level,
            name: '',
            power: {},
            enhancements: []
        };
    }

    createLevelPowers()
    {
        this.levelPowers = [this.makePowerObject(0), this.makePowerObject(1)];
        for(var i = 1; i <= 16; i++)
            this.levelPowers.push(this.makePowerObject(i * 2));

        this.levelPowers.push(this.makePowerObject(35));
        this.levelPowers.push(this.makePowerObject(38));
        this.levelPowers.push(this.makePowerObject(41));
        this.levelPowers.push(this.makePowerObject(44));
        this.levelPowers.push(this.makePowerObject(47));
        this.levelPowers.push(this.makePowerObject(49));
    }

    setFitnessPowers(fitnessPowers)
    {
        this.fitnessPowers = [];
        for(var i = 0; i < fitnessPowers.length; i++)
        {
            this.fitnessPowers.push(
                {
                    level: fitnessPowers[i].available_at_level,
                    name: fitnessPowers[i].name,
                    enhancements: [
                        {
                            level: fitnessPowers[i].available_at_level,
                            name: null,
                            enhancement: null
                        }
                    ],
                    power: fitnessPowers[i]
                }
            );
        }
    }

    setInherentPowers(inherentPowers)
    {
        this.inherentPowers = [];
        for(var i = 0; i < inherentPowers.length; i++)
        {
            this.inherentPowers.push(
                {
                    level: inherentPowers[i].available_at_level,
                    name: inherentPowers[i].name,
                    enhancements: [
                        {
                            level: inherentPowers[i].available_at_level,
                            name: null,
                            enhancement: null
                        }
                    ],
                    power: inherentPowers[i]
                }
            );
        }
    }


    clearPowers()
    {
        this.createLevelPowers();
        for(var i = 0; i < this.fitnessPowers.length; i++)
        {
            this.fitnessPowers[i].enhancements = [
                {
                    level: this.fitnessPowers[i].power.available_at_level,
                    name: null
                }
            ];
        }

        for(i = 0; i < this.inherentPowers.length; i++)
        {
            this.inherentPowers[i].enhancements = [
                {
                    level: this.inherentPowers[i].power.available_at_level,
                    name: null
                }
            ];
        }
        
        this.numEnhancements = 0;
    }

    assignLevelPower(level, power)
    {
        let levelAssignment = getByLevel(this.levelPowers, level);
        if(levelAssignment)
        {
            levelAssignment.name = power.name;
            levelAssignment.power = power;
            if(power.enhancements_allowed && power.enhancements_allowed.length > 0)
            {
                levelAssignment.enhancements = [{
                    level: 1,
                    name: '',
                    enhancement: null
                }];
            }
            else
            {
                levelAssignment.enhancements = null;
            }
        }
    }

    getPowerEvalStatements(level)
    {
        let i;
        let stms;
        while(i < this.levelPowers.length && this.levelPowers[i].level <= level)
        {
            if(this.levelPowers[i].name !== '') {
                stms = stms + 'let ' + this.levelPowers[i].name.replaceAll('.', '_') + '=true; ';
            }
            i++;
        }

        
        while(i < this.fitnessPowers.length)
        {
            if(this.fitnessPowers[i].name !== '') {
                stms = stms + 'let ' + this.fitnessPowers[i].name.replaceAll('.', '_') + '=true; ';
            }
            i++;
        }

        while(i < this.inherentPowers.length)
        {
            if(this.inherentPowers[i].name !== '') {
                stms = stms + 'let ' + this.inherentPowers[i].name.replaceAll('.', '_') + '=true; ';
            }
            i++;
        }
        return stms;
    }

    clone()
    {
        let clone = new ToonPowers();
        clone.levelPowers = cloneDeep(this.levelPowers);
        clone.fitnessPowers = cloneDeep(this.fitnessPowers);
        clone.inherentPowers = cloneDeep(this.inherentPowers);
        return clone;
    }

    static load(load_data)
    {
        let o = new ToonPowers();
        o.levelPowers = load_data.levelPowers;
        o.fitnessPowers = load_data.fitnessPowers;
        o.inherentPowers = load_data.inherentPowers;
        return o;
    }

    determineSecondaryPower(secondaryPowerSet)
    {
        let possibleSecondary = secondaryPowerSet.powers.find(power => (power.available_at_level));
        if (possibleSecondary && Object.keys(possibleSecondary).length > 0) {
            
            //update auto secondary power, which is stores as level 0
            this.assignLevelPower(0, possibleSecondary);
        }
    }

    getPowerAssignmentByLevel(level)
    {
        let idx = getByLevel(this.levelPowers, level);
        if(idx !== -1)
            return this.levelPowers[idx];
        return null;
    }

    getPowerAssignment(powerName)
    {
        let idx = indexOfByName(this.levelPowers, powerName)
        if(idx !== -1)
            return this.levelPowers[idx];
        idx = indexOfByName(this.fitnessPowers, powerName)
        if(idx !== -1)
            return this.fitnessPowers[idx];
        idx = indexOfByName(this.inherentPowers, powerName)
        if(idx !== -1)
            return this.inherentPowers[idx];
        return null;
    }

    getEnhancements(powerName)
    {
        let powerAssigment = this.getPowerAssignment(powerName);
        if(powerAssigment)
            return powerAssigment.enhancements;
        return null;
    }

    /**
     * Returns true if an enhancement can be assigned to this power.
     * @param {string} powerName 
     */
    canAddEnhancement(powerName)
    {
        let powerAssigment = this.getPowerAssignment(powerName);
        if(!powerAssigment)
            return false;
        if(!powerAssigment.enhancements || powerAssigment.enhancements.lenght === 0)
            return false;
        if(powerAssigment.enhancements.lenght === 6)
            return false;
        if(this.numEnhancements >= this.maxEnhancements)
            return false;
        //check enhancement levels
        let enhMax = ToonPowers.enhancementMaxLookup[49];
        let enhCount = 0;
        for (var i = 49; i > 1; i--)
        {
            let pa = this.getPowerAssignmentByLevel(i);
            //no power, nothing to worry about.  If there is, check the totals.
            if(pa)
            {
                //add the ehancemewnts the user added, except the 1st one (free one)
                enhCount += (pa.enhancements.length - 1);
                //if this is the power we would like to add the ehancement to, add it here.
                if(pa.name === powerName)
                    enhCount++;
                //compare to make sure we don't exceed max
                if(enhCount > enhMax)
                    return false;
            }
            else
            {
                //not a power, do we add enhancements total?
                if(ToonPowers.enhancementMaxLookup.hasOwnProperty(i))
                {
                    //yes, add it to the max total
                    enhMax += ToonPowers.enhancementMaxLookup[i];
                }
            }

        }
        return true;
    }

    addEnhancement(powerName)
    {
        if(this.canAddEnhancement(powerName))
        {
            let powerAssigment = this.getPowerAssignment(powerName);
            //add to the number of enhancements we have.
            this.numEnhancements++;
            //finds the earliest we can add this enhancement.
            let level = null;
            for(var i = powerAssigment.level + 1; i < 50; i++)
            {
                if(ToonPowers.enhancementMaxLookup.hasOwnProperty(i))
                {
                    let max = this.maxEnhancements - ToonPowers.enhancementMaxLookup[i];
                    if(this.numEnhancements <= max)
                    {
                        level = i - 1;
                        break;
                    }
                }
            }
            if(level)
            {
                //add the enhancement
                powerAssigment.enhancements.push(
                    {
                        level: level,
                        name: '',
                        enhancement: {}
                    }
                );
            }

        }
    }

    canRemoveEnhancement(powerName)
    {
        let powerAssigment = this.getPowerAssignment(powerName);
        if(!powerAssigment)
            return false;
        if(!powerAssigment.enhancements || powerAssigment.enhancements.lenght === 0)
            return false;
        if(powerAssigment.enhancements.length === 1)
            return false;
        if(this.numEnhancements === 0)
            return false;
        return true;
    }

    removeEnhancement(powerName)
    {
        if(this.canRemoveEnhancement(powerName))
        {
            let powerAssigment = this.getPowerAssignment(powerName);
            //subtract to the number of enhancements we have.
            this.numEnhancements--;
            //slice off the last elemtn in the ehancements array/.
            powerAssigment.enhancements.pop();

        }
    }

    slotEnhancement(powerName, slotIndex, enhancement)
    {
        let powerAssigment = this.getPowerAssignment(powerName);
        if(powerAssigment)
        {
            console.log("in power assignment");
            //check to make sure we have the enhancement and idx 
            if(powerAssigment.enhancements && powerAssigment.enhancements[slotIndex])
            {
                if(enhancement)
                {
                    powerAssigment.enhancements[slotIndex].name = enhancement.Name;
                    powerAssigment.enhancements[slotIndex].enhancement = enhancement;
                }
                else
                {
                    powerAssigment.enhancements[slotIndex].name = null;
                    powerAssigment.enhancements[slotIndex].enhancement = null;
                }
            }
        }
    }
    
}

export default ToonPowers;