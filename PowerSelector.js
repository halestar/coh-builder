import React, { Component } from 'react';
import {indexOfByName, logObj} from "./Helpers";

class PowerSelector extends Component {
    /**
     * @param { } props the props being passed to this app must be the following:
     * availablePowers - REQUIRED. An array of all possible powers the user can select from.
     * powerSelected - name of a specific power that has to be highlighted because it was already selected
     * powerSets - the object ToonPowerSets
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
        if(this.props.availablePowers && prevProps.availablePowers !== this.props.availablePowers)
            this.setState({availablePowers: this.props.availablePowers});
        if(this.props.powerSelected && prevProps.powerSelected !== this.props.powerSelected)
            this.setState({powerSelected: this.props.powerSelected})
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
        return (
            <div className="select-power-container">
                { this.state.availablePowers.map(
                    (power) => {
                        let badge;
                        let class_name = "selectable-power";
                        let powerSet = this.props.powerSets.getPowerSet(power.name);
                        if(powerSet)
                        {
                            badge = (
                                <img src={powerSet.icon} alt={powerSet.display_name} className="image is-16x16" />
                            );
                            if(powerSet.name === this.props.powerSets.primary.name)
                                class_name += " primary-power";
                            else if(powerSet.name === this.props.powerSets.secondary.name)
                                class_name += " secondary-power";
                            else
                            class_name += " pool-power";
                        }
                        
                        if(this.state.powerSelected === power.name)
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
