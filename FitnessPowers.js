import React, { Component } from 'react';
import InherentPowerWidget from './InherentPowerWidget';

class FitnessPowers extends Component {
    /**
     * 
     * @param { } props the props being passed to this app must be the following:
     *  - powers: all the fitness power sets
     */
    constructor(props) {
        super(props)
        this.state = {
            powers: props.powers,
        };
    }

    /**
     * Any change in any of the powers will nesseciate an update of the available powers.
     * TODO: it should also remove from the toon powers those powers that are no longer allowed.
     * @param {*Object} prevProps THe previous props.
     */
    componentDidUpdate(prevProps) {
        if(prevProps.powers !== this.props.powers)
            this.setState({powers: this.props.powers});
    }
    

    render() {
        return (
            <section className="fitness-container">
                <div className="fitness-header">Fitness Powers</div>
                {this.state.powers && this.state.powers.map(
                    (power) => 
                        <InherentPowerWidget key={power.name} power={power} />
                )}
            </section>
        );
    }
}

export default FitnessPowers;
