import React, { Component } from 'react';
import {getByLevel, indexOfByName, logObj} from "./Helpers";
import PowerSelector from "./PowerSelector";

class InherentPowerWidget extends Component {

    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - power: The power to display
     */
     constructor(props) {
        super(props)
        this.state = {
            power: props.power,
        };
    }

    componentDidUpdate(prevProps) {

        if(this.props.power && this.props.power !== prevProps.power)
                this.setState({power: this.props.power});
    }

    renderEnhacements(enhancements)
    {
        if(!enhancements || enhancements.length === 0)
            return null;
        return (
            <div className="enhancements-container">
                {enhancements.map(
                    (enh) => {
                        let cn = "enhancement";
                        if(!enh.name || enh.name === '')
                            cn += " empty"
                        return (
                            <button className={cn} key={enh.name + enh.level}> <span>{ enh.level }</span> </button>
                        );
                    }
                )}
            </div>
        );
    }

    /**
     * This function is in charge of rendering a single power selection widget for the passed level.
     * @param {Object} levelAssignments The container for which power must be rendered.
     * @returns The rendering of the Power
     */
     render() {

        return (
            <div 
                className="assigned-power-container"
            >
                <button
                    className="inherent-power-selector"
                >
                    <span className="power-level">({this.state.power.power.available_at_level})</span> 
                    <span className="power-name">{this.state.power.power.display_name}</span> 
                </button>
                {this.renderEnhacements(this.state.power.enhancements)}
            </div>
        )
    }

    
}

export default InherentPowerWidget;