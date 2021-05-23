import React, { Component } from 'react';
import {indexOfByName} from "./Helpers";
import ToonPowerSets from './ToonPowerSets';
import ToonPowers from './ToonPowers';

class PowerSelector extends Component {
    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - powerSets: all the power sets that belong to this toon. Of type ToonPowerSets
     *  - toon_powers: all the powers assigned to this toon. Of type ToonPowers
     *  - level: the level to assign
     *  - onPowerSelected: Callback function when this component selects a power.
     */
     constructor(props) {
        super(props)
        this.state = {
            availablePowers: [],
            powerSets: this.props.powerSets,
            toon_powers: this.props.toon_powers,
            level: this.props.level,
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

        if(this.props.toon_powers instanceof ToonPowers)
            this.setState({toon_powers: this.props.toon_powers});
        if(this.props.powerSets instanceof ToonPowerSets)
            this.setState({powerSets: this.props.powerSets});
        if(this.props.level)
            this.setState({level: this.props.level});
            
        this.updateAvailablePowers();
    }

    /**
     * Any change in any of the powers will nesseciate an update of the available powers.
     * TODO: it should also remove from the toon powers those powers that are no longer allowed.
     * @param {*Object} prevProps THe previous props.
     */
    componentDidUpdate(prevProps) {
        let update = false;
        if(prevProps.toon_powers !== this.props.toon_powers)
        {
            this.setState({toon_powers: this.props.toon_powers});
            update = true;
        }
            
        if(prevProps.powerSets !== this.props.powerSets)
        {
            this.setState({powerSets: this.props.powerSets});
            update = true;
        }
            
        if(prevProps.level !== this.props.level)
        {
            this.setState({level: this.props.level});
            update = true;
        }

        if(update)
            this.updateAvailablePowers();
    }

    /**
     * This function is in charge of determining whether the passed power name is 
     * available to select at the passed level.
     * @param {string} power The name of the power that we are checking
     * @param {int} level The level that we are checking for
     * @returns true if it can be added to that level's power, false otherwise.
     */
     powerMeetsReq(power) {
        let stms = this.state.toon_powers.getPowerEvalStatements(this.state.level);

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
     * This function will take all the power pulls and generate a unique array of all of the powers
     * a user is allowed to select from.
     */
    updateAvailablePowers(){
        //merge all the power sets
        let allPowers = [];
        if(this.props.powerSets instanceof ToonPowerSets)
        {
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
        }

        //make sure they're unique!
        let set = new Set();
        let availablePowers = allPowers.filter(item => {
            //check if the power is available at the current level
            if(item.available_at_level > this.props.level || item.available_at_level < 1)
                return false;
            //if ther elevel is below 4, we don't have access to pool powers
            if(this.props.powerSets.isPool(item.name) && this.props.level < 4)
                return false;
            //if the level is below 35, we don't have access to epic powers
            if(this.props.powerSets.isEpic(item.name) && this.props.level < 35)
                return false;
            //discard if we already have the power
            let idx = indexOfByName(this.props.toon_powers.levelPowers, item.name);
            if( idx !== -1 && this.props.toon_powers.levelPowers[idx].level < this.props.level)
                return false;
            if(item.requires && !this.powerMeetsReq(item, this.props.level))
                return false;


            if (!set.has(item.name)) 
            {
                set.add(item.name);

                return true;
            }
            return false;
        }, set);

        this.setState({availablePowers: availablePowers});
    }

    handlePowerSelected = (power) =>
    {
        if(this.props.onPowerSelected)
            this.props.onPowerSelected(power);
    }
    

    render() {
        return (
            <div className="select-power-container">
                { this.state.availablePowers.map(
                    (power) => {
                        let badge = (
                            <img src={power.icon} alt={power.display_name} className="image is-16x16" />
                        );
                        let class_name = "selectable-power";
                        if(this.state.powerSets.isPrimary(power.name))
                            class_name += " primary-power";
                        else if(this.state.powerSets.isSecondary(power.name))
                            class_name += " secondary-power";
                        else if(this.state.powerSets.isPool(power.name))
                            class_name += " pool-power";
                        else if(this.state.powerSets.isEpic(power.name))
                            class_name += " epic-power";
                        
                        let powerAssigner = this.state.toon_powers.getPowerAssignmentByLevel(this.state.level);
                        if(powerAssigner && powerAssigner.name === power.name)
                            class_name += " active";
                        return (
                        <button
                            type="button"
                            className={class_name}
                            key={power.name}
                            onClick={() => this.handlePowerSelected(power)}
                        >
                            <div className="power-info-header">
                                <span>{power.display_name}</span>
                                {badge}
                            </div>
                            <div className="power-info-effect">{[power.display_short_help]}</div>
                        </button>
                    )}
                )}
            </div>
        );
    }

}

export default PowerSelector;
