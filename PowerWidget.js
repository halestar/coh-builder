import React, { Component } from 'react';
import {getByLevel, indexOfByName, logObj} from "./Helpers";
import PowerSelector from "./PowerSelector";

class PowerWidget extends Component {

    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - powerSets: all the power sets that belong to this toon. Of type ToonPowerSets
     *  - levelAssignment: the level, power, and enhancements assigned to this widget
     *  - onPowerSelect: Triggered when the user would like to change this power
     */
     constructor(props) {
        super(props)
        this.state = {
            levelAssignments: props.levelAssignments,
        };
    }

    componentDidUpdate(prevProps) {

        if(this.props.levelAssignments && this.props.levelAssignments !== prevProps.levelAssignments)
                this.setState({levelAssignments: this.props.levelAssignments});
    }

    selectPower = () => {
        if(this.props.onPowerSelect)
            this.props.onPowerSelect(this.state.levelAssignments.level);
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
                        if(enh.name === '')
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

        let name;
        let badge;
        let divClass = "power-selector";
        if(this.state.levelAssignments.level === 0)
        {
            name = this.state.levelAssignments.power.display_name;
            divClass += " picked-power";
            if(this.props.powerSets.hasSecondary()) 
                badge = <img className="image is-24x24" src={this.props.powerSets.secondary.icon} alt={this.props.powerSets.secondary.display_name} />;
        }
        else if(this.state.levelAssignments.name === '') {

            name = "Click to Select Power";
            divClass += " no-power";
            badge = <span>&nbsp;</span>;
        }
        else {
            name = this.state.levelAssignments.power.display_name;
            divClass += " picked-power";
            if(this.props.powerSets.isPrimary(this.state.levelAssignments.name))
                badge = <img className="image is-24x24" src={this.props.powerSets.primary.icon} alt={this.props.powerSets.primary.display_name} />;
            else if(this.props.powerSets.isSecondary(this.state.levelAssignments.name))
                badge = <img className="image is-24x24" src={this.props.powerSets.secondary.icon} alt={this.props.powerSets.secondary.display_name} />;
            else
            {
                let powerSet = this.props.powerSets.getPowerSet(this.state.levelAssignments.name);
                if(powerSet)
                    badge = <img className="image is-24x24" src={powerSet.icon} alt={powerSet.display_name} />;
            }
        }

        return (
            <div 
                key={this.state.levelAssignments.level}
                className="assigned-power-container"
            >
                <button
                    className={divClass}
                    onClick={this.selectPower}
                >
                    <span className="power-level">({this.state.levelAssignments.level === 0? 1: this.state.levelAssignments.level})</span> 
                    <span className="power-name">{name}</span> 
                    {badge}
                </button>
                {this.state.levelAssignments.name !== '' && this.renderEnhacements(this.state.levelAssignments.enhancements)}
            </div>
        )
    }

    
}

export default PowerWidget;