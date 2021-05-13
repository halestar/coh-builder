import React, { Component } from 'react';
import axios from "axios";
import {indexOfByName, logObj} from "./Helpers";

class PowerSelector extends Component {
    /**
     * the following props will be used:
     * availablePowers
     * powerSelected - name of a specific power that has to be highlighted
     * powerSets - array of all power sets. an objet containing the powerset info under the keys priPowerSet, secPowerset, pool1, pool2, pool3, pool4
     * onSelectedPower - hook that returns the power selected object to the parent
     */
    constructor(props) {
        super(props)
        this.server = "http://localhost/api/coh/";
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

    selectPower = (power) => {
        let power_name = power.name;
        this.setState({powerSelected: power_name});
        if(this.props.onSelectedPower)
            this.props.onSelectedPower(power);
    }

    render() {
        let badge;
        return (
            <div className="p-3">
                <div className="list-group">
                    { this.state.availablePowers.map(
                        (power) => {
                            let badge;
                            if(indexOfByName(this.props.powerSets.priPowerSet.powers, power.name) != -1)
                                badge = <span className="badge badge-pill badge-primary align-self-center">PRI</span>;
                            else if(indexOfByName(this.props.powerSets.secPowerset.powers, power.name) != -1)
                                badge = <span className="badge badge-pill badge-secondary align-self-center">SEC</span>;
                            else
                                badge = <span className="badge badge-pill badge-warning align-self-center">POOL</span>;
                            return (
                            <button
                                type="button"
                                className={this.props.powerSelected == power.name? 'power-info active': 'power-info'}
                                key={power.name}
                                onClick={() => this.selectPower(power)}
                            >
                                <div className="power-info-header">
                                    <span>{power.display_name}</span>
                                    {badge}
                                </div>
                                <div className="power-info-powerset">Powerset: {this.getPowerSet(power.name).display_name}</div>
                                <div className="power-info-effect">{[power.display_short_help]}</div>
                            </button>
                        )}
                    )}
                </div>
            </div>
        );
    }

}

export default PowerSelector;
