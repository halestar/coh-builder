import React, { Component } from 'react';
import {getByLevel, indexOfByName, logObj} from "./Helpers";
import PowerSelector from "./PowerSelector";
import PowerWidget from './PowerWidget';
import ToonPowers from './ToonPowers';

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
            toon_powers: props.applyPowers? props.applyPowers: new ToonPowers(),

            show_info: false,
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

        if(this.props.applyPowers instanceof ToonPowers )
            this.setState({toon_powers: this.props.applyPowers});

        else if(!(this.state.toon_powers instanceof ToonPowers))
            this.setState({toon_powers: new ToonPowers()});
            
        this.updateAvailablePowers();
    }

    /**
     * Any change in any of the powers will nesseciate an update of the available powers.
     * TODO: it should also remove from the toon powers those powers that are no longer allowed.
     * @param {*Object} prevProps THe previous props.
     */
    componentDidUpdate(prevProps) {
        if(prevProps.powerSets !== this.props.powerSets)
            this.updateAvailablePowers();

        if((this.props.applyPowers instanceof ToonPowers) &&
            this.props.applyPowers !== prevProps.applyPowers){
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
                this.state.toon_powers.assignLevelPower(0, possibleSecondary);
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
        let stms = this.state.toon_powers.getPowerEvalStatements(level);

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
                console.log('refence error! fn=' + fn);
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
                //discard if we already have the power
                let idx = indexOfByName(this.state.toon_powers.levelPowers, item.name);
                if( idx !== -1 && this.state.toon_powers.levelPowers[idx].level < level)
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
        let toon_powers = this.state.toon_powers.clone();
        toon_powers.assignLevelPower(this.state.powerSelectorLevel, power);
        this.setState(toon_powers);
        this.setState({powerSelectorLevel: null});
        if (this.props.onUpdatePowers)
            this.props.onUpdatePowers(toon_powers);
    }

    

    render() {
        let pow = getByLevel(this.state.toon_powers.levelPowers, this.state.powerSelectorLevel);
        let powerSelected = '';
        if(pow && pow.power)
            powerSelected = pow.power.name;
        return (
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
        );
    }
}

export default PowerAssigner;
