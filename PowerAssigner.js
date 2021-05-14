import React, { Component } from 'react';
import {getByLevel, indexOfByName, logObj} from "./Helpers";
import PowerSelector from "./PowerSelector";
import PowerInfo from "./PowerInfo";

class PowerAssigner extends Component {
    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - priPowerSet
     *  - secPowerSet
     *  - pool1PowerSet
     *  - pool2PowerSet
     *  - pool3PowerSet
     *  - pool4PowerSet
     *  - applyPowers: OPTIONAL. Whether to assign already existing power sets to the toon. Useful when loading.
     */
    constructor(props) {
        super(props)
        this.state = {
            availablePowers: [],
            powerSelectorPowers: null,
            powerSelectorLevel: null,
            toon_level1SecPower: {},
            toon_powers:[],

            show_info: false,
        };
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in the primary pool, false otherwise
     */
    isPriPower(powerName) {
        if(!powerName)
            return false;
        return (indexOfByName(this.props.priPowerSet.powers, powerName) != -1);
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in the sedcondary pool, false otherwise
     */
    isSecPower(powerName) {
        if(!powerName)
            return false;
        return (indexOfByName(this.props.secPowerSet, powerName) != -1);
    }

    /**
     * 
     * @param {string} powerName the name of the power to check
     * @returns true if the power is in one of the pool power set, false otherwise
     */
    isPoolPower(powerName) {
        if(!powerName)
            return false;
        return powerName.startsWith('Pool.');
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
        let powerTemplate = {
            name: '',
            power: {},
            enhancements: [{
                level: 0,
                name: '',
            }]
        }
        let toon_powers = [Object.assign({level: 1}, powerTemplate)];
        for(var i = 1; i <= 16; i++)
            toon_powers.push(Object.assign({level: (i *2)}, powerTemplate));
        toon_powers.push(Object.assign({level: 35}, powerTemplate));
        toon_powers.push(Object.assign({level: 38}, powerTemplate));
        toon_powers.push(Object.assign({level: 41}, powerTemplate));
        toon_powers.push(Object.assign({level: 44}, powerTemplate));
        toon_powers.push(Object.assign({level: 47}, powerTemplate));
        toon_powers.push(Object.assign({level: 49}, powerTemplate));
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
        if(this.props.priPowerSet.name && prevProps.priPowerSet.name != this.props.priPowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.secPowerSet.name && prevProps.secPowerSet.name != this.props.secPowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool1PowerSet.name && prevProps.pool1PowerSet.name != this.props.pool1PowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool2PowerSet.name && prevProps.pool2PowerSet.name != this.props.pool2PowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool3PowerSet.name && prevProps.pool3PowerSet.name != this.props.pool3PowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool4PowerSet.name && prevProps.pool4PowerSet.name != this.props.pool4PowerSet.name)
            this.updateAvailablePowers();

        if(this.props.applyPowers &&
            this.props.applyPowers.length == this.state.toon_powers.length
            && this.props.applyPowers != prevProps.applyPowers){
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
        if(this.props.priPowerSet.powers)
            allPowers = [...allPowers, ...this.props.priPowerSet.powers];
        if(this.props.secPowerSet.powers)
            allPowers = [...allPowers, ...this.props.secPowerSet.powers];
        if(this.props.pool1PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool1PowerSet.powers];
        if(this.props.pool2PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool2PowerSet.powers];
        if(this.props.pool3PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool3PowerSet.powers];
        if(this.props.pool4PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool4PowerSet.powers];

        let set = new Set();
        let availablePowers = allPowers.filter(item => {
            if(indexOfByName(this.state.toon_powers, item.name) != -1)
                return false
            if (!set.has(item.name)) {
                set.add(item.name);
                return true;
            }
            return false;
        }, set);

        //also, we can fill in the toon_level1SecPower since it will be the only possible power from the secondary power set
        if(this.props.secPowerSet.powers) {
            let possibleSecondary = this.props.secPowerSet.powers.find(power => power.available_at_level <= 1);
            if (possibleSecondary && Object.keys(possibleSecondary).length > 0) {
                this.setState({toon_level1SecPower: possibleSecondary});
                //remove the secondary power from available
                let secIdx = indexOfByName(availablePowers, possibleSecondary.name);
                if(secIdx != -1)
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
            if(this.state.toon_powers[i].name != '') {
                stms = stms + 'let ' + this.state.toon_powers[i].name.replaceAll('.', '_') + '=true; ';
            }
            i++;
        }

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
        return true;
    }

    /**
     * This is a callback when a user selects a level that wants to assign
     * a power to. It is responsible for showing the power selector. This will only work if there is a power
     * to select!
     * @param {int} level The level to select the power in
     */
    selectPower = (level) => {
        if(level == 0)
        {
            alert("You can't change your first secondary power!")
        }
        else
        {
            let powerSelectorPowers = this.state.availablePowers.filter(item => {
                if(item.available_at_level > level)
                    return false;
                if(this.isPoolPower(item.name) && level < 4)
                    return false;
                let idx = indexOfByName(this.state.toon_powers, item.name);
                if( idx != -1 && this.state.toon_powers[idx].level < level)
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
            lv.enhancements[0].level = this.state.powerSelectorLevel;
            this.setState(toon_powers);
            this.setState({powerSelectorLevel: null});
            if (this.props.onUpdatePowers)
                this.props.onUpdatePowers(toon_powers);
        }
    }

    /**
     * This function is in charge of rendering a single power selection widget for the passed level.
     * @param {Object} levelAssignments The container for which power must be rendered.
     * @returns The rendering of the Power
     */
    renderPower(levelAssignments) {

        let name;
        let divClass = "power-selector";
        let badge = <span className="tag is-warning is-light is-small is-rounded">POOL</span>;
        let powerSelected = false;
        if(levelAssignments.level == 0)
        {
            name = levelAssignments.power.display_name;
            divClass += " picked-power";
            badge = <span className="tag is-success is-light is-small is-rounded">SEC</span>;
        }
        else if(levelAssignments.name == '') {

            name = "Click to Select Power";
            divClass += " no-power";
            badge = <span>&nbsp;</span>;
        }
        else {
            powerSelected = true;
            name = levelAssignments.power.display_name;
            divClass += " picked-power";
            if(this.isPriPower(levelAssignments.name))
                badge = <span className="tag is-primary is-primary is-small is-rounded">PRI</span>;
            else if(this.isSecPower(levelAssignments.name))
                badge = <span className="tag is-success is-light is-small is-rounded">SEC</span>;
        }

        if(this.state.powerSelectorLevel == levelAssignments.level)
            divClass += " picked";

        return (
            <button
                className={divClass}
                key={levelAssignments.level}
                onClick={ () => this.selectPower(levelAssignments.level) }
            >
                <span className="power-level">({levelAssignments.level == 0? 1: levelAssignments.level})</span> 
                <span className="power-name">{name}</span> 
                {badge}
            </button>
        )
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
                        powerSets={ {
                            priPowerSet: this.props.priPowerSet,
                            secPowerset: this.props.secPowerSet,
                            pool1: this.props.pool1PowerSet,
                            pool2: this.props.pool2PowerSet,
                            pool3: this.props.pool3PowerSet,
                            pool4: this.props.pool4PowerSet,
                        } }
                        onSelectedPower={this.handleSelectedPower}
                    />
                    )}
                </div>

                <div className="columns">
                    <div className="column">
                        {this.renderPower({level: "0", name: this.state.toon_level1SecPower.name, power: this.state.toon_level1SecPower})}
                        { this.state.toon_powers.slice(0, 7).map(
                            (levelAssignments) =>
                                this.renderPower(levelAssignments)
                        )}
                    </div>
                    
                    <div className="column">
                        { this.state.toon_powers.slice(7, 15).map(
                            (levelAssignments) =>
                                this.renderPower(levelAssignments)
                        )}
                    </div>
                    
                    <div className="column">
                        { this.state.toon_powers.slice(15, 23).map(
                            (levelAssignments) =>
                                this.renderPower(levelAssignments)
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default PowerAssigner;
