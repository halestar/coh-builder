import {indexOfByName, getByLevel} from './Helpers';
import cloneDeep from 'lodash/cloneDeep';
import { filter } from 'lodash';
class ToonPowers
{
    levelPowers = [];
    fitnessPowers = [];
    inherentPowers = [];

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
                            name: null
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
                            name: null
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

        for(var i = 0; i < this.inherentPowers.length; i++)
        {
            this.inherentPowers[i].enhancements = [
                {
                    level: this.inherentPowers[i].power.available_at_level,
                    name: null
                }
            ];
        }
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
                    enhancement: {}
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
    
}

export default ToonPowers;