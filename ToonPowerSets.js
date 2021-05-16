import {indexOfByName} from './Helpers';
class ToonPowerSets
{
    primary = null;
    secondary = null;
    pool1 = null;
    pool2 = null;
    pool3 = null;
    pool4 = null;
    epic = null;

    constructor(sets)
    {
        if(sets)
        {
            if(sets.primary)
                this.primary = Object.assign({}, sets.primary);
            if(sets.secondary)
                this.secondary = Object.assign({}, sets.secondary);
            if(sets.pool1)
                this.pool1 = Object.assign({}, sets.pool1);
            if(sets.pool2)
                this.pool2 = Object.assign({}, sets.pool2);
            if(sets.pool3)
                this.pool3 = Object.assign({}, sets.pool3);
            if(sets.pool4)
                this.pool4 = Object.assign({}, sets.pool4);
            if(sets.epic)
                this.epic = Object.assign({}, sets.epic);
        }
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in the primary pool, false otherwise
     */
    isPrimary(powerName) {
        if(!powerName)
            return false;
        return (indexOfByName(this.primary.powers, powerName) !== -1);
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in the sedcondary pool, false otherwise
     */
     isSecondary(powerName) {
        if(!powerName)
            return false;
        return (indexOfByName(this.secondary.powers, powerName) !== -1);
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in one of the pool power set, false otherwise
     */
     isPool(powerName) {
        if(!powerName)
            return false;
        return powerName.startsWith('Pool.');
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in one of the epic power set, false otherwise
     */
     isEpic(powerName) {
        if(!powerName)
            return false;
        return (indexOfByName(this.epic.powers, powerName) !== -1);
    }

    hasPrimary()
    {
        return this.primary !== null && Object.keys(this.primary).length > 1;
    }

    hasSecondary()
    {
        return this.secondary !== null && Object.keys(this.secondary).length > 1;
    }

    hasPool1()
    {
        return this.pool1 !== null && Object.keys(this.pool1).length > 1;
    }

    hasPool2()
    {
        return this.pool2 !== null && Object.keys(this.pool2).length > 1;
    }

    hasPool3()
    {
        return this.pool3 !== null && Object.keys(this.pool3).length > 1;
    }

    hasPool4()
    {
        return this.pool4 !== null && Object.keys(this.pool4).length > 1;
    }

    hasEpic()
    {
        return this.epic !== null && Object.keys(this.epic).length > 1;
    }

    /**
     * This function will get the pool that the passed power is in.
     * @param {string} powerName THe name of the power to lookup
     * @returns The set this power belongs to, or null if it doesn't exist.
     */
    getPowerSet(powerName) {
        if(this.hasPrimary() && indexOfByName(this.primary.powers, powerName) !== -1)
            return this.primary;
        else if(this.hasSecondary() && indexOfByName(this.secondary.powers, powerName) !== -1)
            return this.secondary;
        else if(this.hasPool1() && indexOfByName(this.pool1.powers, powerName) !== -1)
            return this.pool1;
        else if(this.hasPool2() && indexOfByName(this.pool2.powers, powerName) !== -1)
            return this.pool2;
        else if(this.hasPool3() && indexOfByName(this.pool3.powers, powerName) !== -1)
            return this.pool3;
        else if(this.hasPool4() && indexOfByName(this.pool4.powers, powerName) !== -1)
            return this.pool4;
        else if(this.hasEpic() && indexOfByName(this.epic.powers, powerName) !== -1)
            return this.epic;
        return null;
    }


}

export default ToonPowerSets;