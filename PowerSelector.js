import React, { Component } from 'react';
import {indexOfByName, logObj} from "./Helpers";

class PowerSelector extends Component {
    /**
     * @param { } props the props being passed to this app must be the following:
     * availablePowers - REQUIRED. An array of all possible powers the user can select from.
     * powerSelected - name of a specific power that has to be highlighted because it was already selected
     * powerSets - array of all power sets. an object containing the powerset info under the keys:
     *  - priPowerSet
     *  - secPowerset
     *  - pool1
     *  - pool2
     *  - pool3
     *  - pool4
     * onSelectedPower - hook that returns the power selected object to the parent
     */
    constructor(props) {
        super(props)
        this.state = {
            availablePowers: [],
            powerSelected: null,
        };
    }

    componentDidMount() {
        this.setState({availablePowers: this.props.availablePowers});
        this.setState({powerSelected: this.props.powerSelected});
    }

    componentDidUpdate(prevProps) {
        if(this.props.availablePowers && prevProps.availablePowers != this.props.availablePowers)
            this.setState({availablePowers: this.props.availablePowers});
        else if(this.props.powerSelected && prevProps.powerSelected != this.props.powerSelected)
            this.updateAvailablePowers();
    }

    /**
     * This function will get the pool that the passed power is in.
     * @param {string} powerName THe name of the power to lookup
     * @returns The set this power belongs to, or null if it doesn't exist.
     */
    getPowerSet(powerName) {
        if(indexOfByName(this.props.powerSets.priPowerSet.powers, powerName) != -1)
            return this.props.powerSets.priPowerSet;
        else if(indexOfByName(this.props.powerSets.secPowerset.powers, powerName) != -1)
            return this.props.powerSets.secPowerset;
        else if(indexOfByName(this.props.powerSets.pool1.powers, powerName) != -1)
            return this.props.powerSets.pool1;
        else if(indexOfByName(this.props.powerSets.pool2.powers, powerName) != -1)
            return this.props.powerSets.pool2;
        else if(indexOfByName(this.props.powerSets.pool3.powers, powerName) != -1)
            return this.props.powerSets.pool3;
        else if(indexOfByName(this.props.powerSets.pool4.powers, powerName) != -1)
            return this.props.powerSets.pool4;
        return null;
    }

    /**
     * This callback is called when the user selects a power to assign
     * @param {Object} power THe API representation of the power the user chose.
     */
    selectPower = (power) => {
        let power_name = power.name;
        this.setState({powerSelected: power_name});
        if(this.props.onSelectedPower)
            this.props.onSelectedPower(power);
    }

    render() {
        let badge;
        return (
            <div className="select-power-container">
                { this.state.availablePowers.map(
                    (power) => {
                        let badge;
                        let class_name = "selectable-power";
                        let powerSet = this.getPowerSet(power.name);
                        if(powerSet)
                        {
                            badge = (
                                <div className="icon">
                                    <img src={powerSet.icon} />
                                </div>
                            );
                            if(powerSet.name === this.props.powerSets.priPowerSet.name)
                                class_name += " primary-power";
                            else if(powerSet.name === this.props.powerSets.secPowerset.name)
                                class_name += " secondary-power";
                            else
                            class_name += " pool-power";
                        }
                        
                        if(this.props.powerSelected == power.name)
                            class_name += " active";
                        return (
                        <button
                            type="button"
                            className={class_name}
                            key={power.name}
                            onClick={() => this.selectPower(power)}
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
