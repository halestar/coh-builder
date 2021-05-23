import React, { Component } from 'react';

class PowerWidget extends Component {

    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - powerAssigment: the level, power, and enhancements assigned to this widget
     *  - onPowerSelect: Triggered when the user would like to change this power
     */
     constructor(props) {
        super(props)
        this.state = {
            powerAssigment: props.powerAssigment,
        };
    }

    componentDidUpdate(prevProps) {

        if(this.props.powerAssigment && this.props.powerAssigment !== prevProps.powerAssigment)
                this.setState({powerAssigment: this.props.powerAssigment});
    }

    selectPower = () => {
        if(this.props.onPowerSelect)
            this.props.onPowerSelect(this.state.powerAssigment);
    }

    /**
     * This function is in charge of rendering a single power selection widget for the passed level.
     * @param {Object} levelAssignments The container for which power must be rendered.
     * @returns The rendering of the Power
     */
     render() {
        if(!this.state.powerAssigment)
            return null;
        let name;
        let badge = <span></span>;
        let divClass = "power-widget";
        if(this.state.powerAssigment.name === '') {

            name = "Click to Select Power";
            divClass += " no-power";
        }
        else
        {
            divClass += " picked-power";
            name = this.state.powerAssigment.power.display_name;
            badge = <img className="image is-24x24" src={this.state.powerAssigment.power.icon} alt={this.state.powerAssigment.power.display_name} />;
        }

        return (
                <button
                    className={divClass}
                    onClick={this.selectPower}
                >
                    <span className="power-level">({this.state.powerAssigment.level === 0? 1: this.state.powerAssigment.level})</span> 
                    <span className="power-name">{name}</span> 
                    {badge}
                </button>
        )
    }

    
}

export default PowerWidget;