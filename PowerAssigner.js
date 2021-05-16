import React, { Component } from 'react';
import {getByLevel, indexOfByName, logObj} from "./Helpers";
import PowerSelector from "./PowerSelector";
import PowerWidget from './PowerWidget';

class PowerAssigner extends Component {
    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - powerSets: all the power sets that belong to this toon. Of type ToonPowerSets
     *  - applyPowers: OPTIONAL. Whether to assign already existing power sets to the toon. Useful when loading.
     */
    constructor(props) {
        super(props)
        this.state = {
            availablePowers: [],
            powerSelectorPowers: null,
            powerSelectorLevel: null,
            toon_powers:[],

            show_info: false,
        };
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

    /**
     * The most important thing to do when the component is mounted is to set up the toon_powers array.
     * The toon_powers array will hold all the powers that the user has selected from the
     * available_powers array(which, in turn, will be a collection of all possible powers)
     * in a very specific format:
     * toon_power:
     *  - level: The level that this power is taken
     *  - name: THe database name of the power (NOT the display name), empty if no ower has been selected.
     *  - power: an object from the API representing the selected power, empty if no ower has been selected.
     *  - enhancement: An array of objects for every enhancement attached to this power
     *     - level: the level this enhancement was aquired. THe first element in the array will always be the same
     *              level as when the power was aquired.
     *     - enhancement: the actual enhancement (TODO)
     */
    componentDidMount() {
        this.updateAvailablePowers();
        let toon_powers = [this.makePowerObject(0), this.makePowerObject(1)];
        for(var i = 1; i <= 16; i++)
            toon_powers.push(this.makePowerObject(i * 2));
        toon_powers.push(this.makePowerObject(35));
        toon_powers.push(this.makePowerObject(38));
        toon_powers.push(this.makePowerObject(41));
        toon_powers.push(this.makePowerObject(44));
        toon_powers.push(this.makePowerObject(47));
        toon_powers.push(this.makePowerObject(49));
        if(this.props.applyPowers && toon_powers.length === this.props.applyPowers.length )
            this.setState({toon_powers: this.props.applyPowers});
        else
            this.setState({toon_powers});
    }

    /**
     * Any change in any of the powers will nesseciate an update of the available powers.
     * TODO: it should also remove from the toon powers those powers that are no longer allowed.
     * @param {*Object} prevProps THe previous props.
     */
    componentDidUpdate(prevProps) {
        if(prevProps.powerSets !== this.props.powerSets)
            this.updateAvailablePowers();

        if(this.props.applyPowers &&
            this.props.applyPowers.length === this.state.toon_powers.length
            && this.props.applyPowers !== prevProps.applyPowers){
                this.setState({toon_powers: this.props.applyPowers});
        }
    }

    /**
     * This function will take all the power pulls and generate a unique array of all of the powers
     * a user is allowed to select from.
     */
    updateAvailablePowers(){
        //merge all the power sets
        let allPowers = [];
        if(this.props.powerSets.hasPrimary())
            allPowers = [...allPowers, ...this.props.powerSets.primary.powers];
        if(this.props.powerSets.hasSecondary())
            allPowers = [...allPowers, ...this.props.powerSets.secondary.powers];
        if(this.props.powerSets.hasPool1())
            allPowers = [...allPowers, ...this.props.powerSets.pool1.powers];
        if(this.props.powerSets.hasPool2())
            allPowers = [...allPowers, ...this.props.powerSets.pool2.powers];
        if(this.props.powerSets.hasPool3())
            allPowers = [...allPowers, ...this.props.powerSets.pool3.powers];
        if(this.props.powerSets.hasPool4())
            allPowers = [...allPowers, ...this.props.powerSets.pool4.powers];
        if(this.props.powerSets.hasEpic())
            allPowers = [...allPowers, ...this.props.powerSets.epic.powers];

        //make sure they're unique!
        let set = new Set();
        let availablePowers = allPowers.filter(item => {
            if(indexOfByName(this.state.toon_powers, item.name) !== -1)
                return false
            if (!set.has(item.name)) {
                set.add(item.name);
                return true;
            }
            return false;
        }, set);

        //also, we can fill in the auto-first level power, since it will be the only possible power from the secondary power set
        if(this.props.powerSets.hasSecondary()) {
            let possibleSecondary = this.props.powerSets.secondary.powers.find(power => (power.available_at_level === 1 && this.powerMeetsReq(power, 1)));
            if (possibleSecondary && Object.keys(possibleSecondary).length > 0) {
                
                //update auto secondary power, which is stores as level 0
                this.state.toon_powers[0].name = possibleSecondary.name;
                this.state.toon_powers[0].power = possibleSecondary;
                if(possibleSecondary.enhancements_allowed && possibleSecondary.enhancements_allowed.length > 0)
                {
                    this.state.toon_powers[0].enhancements = [{
                        level: 1,
                        name: '',
                        enhancement: {}
                    }];
                }
                else
                    this.state.toon_powers[0].enhancements = null;
                //remove the secondary power from available
                let secIdx = indexOfByName(availablePowers, possibleSecondary.name);
                if(secIdx !== -1)
                    availablePowers.splice(secIdx, 1);
            }
        }

        this.setState({availablePowers: availablePowers});
    }


    /**
     * This function is in charge of determining whether the passed power name is 
     * available to select at the passed level.
     * @param {string} power The name of the power that we are checking
     * @param {int} level The level that we are checking for
     * @returns true if it can be added to that level's power, false otherwise.
     */
    powerMeetsReq(power, level) {
        let i = 0;
        let stms = '';
        while(i < this.state.toon_powers.length && this.state.toon_powers[i].level <= level)
        {
            if(this.state.toon_powers[i].name !== '') {
                stms = stms + 'let ' + this.state.toon_powers[i].name.replaceAll('.', '_') + '=true; ';
            }
            i++;
        }

        if(typeof power.requires === 'string')
        {
            let requirements =  power.requires.replaceAll('.', '_');
            const regex = /[a-zA-z_]+/ig;
            let jsReqs = requirements.replaceAll(regex, "(typeof $&  !== 'undefined')");
            let fn = "(function() { " + stms + " return " + jsReqs + "; })()";
            try {
                let meetReqs = eval(fn);
                return meetReqs;
            }
            catch (e) {
                console.log('refence error!');
            }
        }
        return true;
    }

    /**
     * This is a callback when a user selects a level that wants to assign
     * a power to. It is responsible for showing the power selector. This will only work if there is a power
     * to select!
     * @param {int} level The level to select the power in
     */
    selectPower = (level) => {
        if(level === 0)
        {
            alert("You can't change your first secondary power!")
        }
        else
        {
            let powerSelectorPowers = this.state.availablePowers.filter(item => {
                //check if the power is available at the current level
                if(item.available_at_level > level)
                    return false;
                //if ther elevel is below 4, we don't have access to pool powers
                if(this.props.powerSets.isPool(item.name) && level < 4)
                    return false;
                //if the level is below 35, we don't have access to epic powers
                if(this.props.powerSets.isEpic(item.name) && level < 35)
                    return false;
                let idx = indexOfByName(this.state.toon_powers, item.name);
                if( idx !== -1 && this.state.toon_powers[idx].level < level)
                    return false;
                if(item.requires)
                    return this.powerMeetsReq(item, level)
                return true;
            });
            if(powerSelectorPowers.length > 0)
            {
                this.setState({powerSelectorPowers});
                this.setState({powerSelectorLevel: level});
            }
            else
                alert("There are no powers available for you to take. Check your archetype to make sure it is set.");
        }
    }

    /**
     * This callback function is called when the user selects a power from the power selector
     * @param {Object} power A power object from the API to select.
     */
    handleSelectedPower = (power) => {
        let power_name = power.name;
        let toon_powers = this.state.toon_powers.slice();
        let lv = getByLevel(toon_powers, this.state.powerSelectorLevel);
        if(lv) {
            lv.name = power_name;
            lv.power = power;
            //can this power taken enhancements?
            if(power.enhancements_allowed && power.enhancements_allowed.length > 0)
            {
                lv.enhancements = [{
                    level: this.state.powerSelectorLevel,
                    name: '',
                    enhancement: {}
                }];
            }
            else
                lv.enhancements = null;
            this.setState(toon_powers);
            this.setState({powerSelectorLevel: null});
            if (this.props.onUpdatePowers)
                this.props.onUpdatePowers(toon_powers);
        }
    }

    

    render() {
        let pow = getByLevel(this.state.toon_powers, this.state.powerSelectorLevel);
        let powerSelected = '';
        if(pow && pow.power)
            powerSelected = pow.power.name;
        return (
            <div>
                <div className="selector-container">
                    {this.state.powerSelectorLevel && (
                    <PowerSelector
                        availablePowers={this.state.powerSelectorPowers}
                        powerSelected={powerSelected}
                        powerSets={this.props.powerSets}
                        onSelectedPower={this.handleSelectedPower}
                    />
                    )}
                </div>

                <div className="columns">
                    <div className="column">
                            { this.state.toon_powers.slice(0, 8).map(
                                (levelAssignments) =>
                                <PowerWidget 
                                    powerSets={this.props.powerSets}
                                    levelAssignments={levelAssignments}
                                    onPowerSelect={this.selectPower}
                                    key={levelAssignments.level}
                                />
                            )}
                    </div>
                    
                    <div className="column">
                            { this.state.toon_powers.slice(8, 16).map(
                                (levelAssignments) =>
                                <PowerWidget 
                                    powerSets={this.props.powerSets}
                                    levelAssignments={levelAssignments}
                                    onPowerSelect={this.selectPower}
                                    key={levelAssignments.level}
                                />
                            )}
                    </div>
                    
                    <div className="column">
                            { this.state.toon_powers.slice(16, 24).map(
                                (levelAssignments) =>
                                <PowerWidget 
                                    powerSets={this.props.powerSets}
                                    levelAssignments={levelAssignments}
                                    onPowerSelect={this.selectPower}
                                    key={levelAssignments.level}
                                />
                            )}
                    </div>
                </div>
            </div>
        );
    }
}

export default PowerAssigner;
